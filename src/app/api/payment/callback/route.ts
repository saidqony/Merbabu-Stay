import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyCallbackSignature } from "@/lib/duitku/client";
import { sendInvoiceEmail } from "@/lib/resend/client";
import { sendTelegramNewOrderAlert } from "@/lib/telegram/client";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};

    // Duitku callbacks can be application/json or application/x-www-form-urlencoded
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    }

    console.log("[Callback] Received Duitku callback:", JSON.stringify(body));

    const {
      merchantCode,
      amount,
      merchantOrderId,
      productDetail,
      additionalParam,
      paymentCode,
      resultCode,
      merchantUserId,
      reference,
      signature,
    } = body;

    // 1. Validate mandatory fields
    if (!merchantCode || !amount || !merchantOrderId || !signature) {
      console.warn("[Callback] Missing mandatory fields:", body);
      return new NextResponse("Bad Request: Missing fields", { status: 400 });
    }

    // 2. Verify signature to prevent fraud
    const isValid = verifyCallbackSignature(amount, merchantOrderId, signature);
    if (!isValid) {
      console.error("[Callback] Signature mismatch! Received:", signature);
      return new NextResponse("Unauthorized: Signature mismatch", { status: 401 });
    }

    console.log(`[Callback] Signature valid. ResultCode: ${resultCode}, OrderId: ${merchantOrderId}`);

    // 3. Fetch order details from database
    const { data: pesanan, error: fetchError } = await supabase
      .from("pesanan")
      .select("*, kamar(*)")
      .eq("id", merchantOrderId)
      .single();

    if (fetchError || !pesanan) {
      console.error(`[Callback] Order ${merchantOrderId} not found.`, fetchError);
      return new NextResponse("Not Found: Booking not found", { status: 404 });
    }

    // Discover columns dynamically to prevent errors on older schemas
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    let availableCols: string[] = [];
    if (sampleBooking && sampleBooking.length > 0) {
      availableCols = Object.keys(sampleBooking[0]);
    } else {
      availableCols = ["id", "status"];
    }

    const currentBookingStatus = pesanan.status || (pesanan as any).status_pembayaran || "";

    // Check if already processed to avoid duplicate triggers
    if (currentBookingStatus === "paid" || currentBookingStatus === "confirmed") {
      console.log(`[Callback] Order ${pesanan.kode_pesanan} already paid. Skipping.`);
      return new NextResponse("OK", { status: 200 });
    }

    let nextStatus = "failed";
    const updateFields: any = {};

    // resultCode '00' means success in Duitku
    if (resultCode === "00") {
      nextStatus = "paid";
      updateFields.paid_at = new Date().toISOString();
      updateFields.payment_method = paymentCode;
      updateFields.payment_method_name = paymentCode;
      updateFields.duitku_reference = reference;
    } else {
      nextStatus = "failed";
      console.warn(`[Callback] Payment failed. ResultCode: ${resultCode}`);
    }

    // Set status dynamically (update both if both exist to keep them in sync!)
    if (availableCols.includes("status")) {
      updateFields.status = nextStatus;
    }
    if (availableCols.includes("status_pembayaran")) {
      updateFields.status_pembayaran = nextStatus;
    }

    // 4. Update order in database
    const { error: updateError } = await supabase
      .from("pesanan")
      .update(updateFields)
      .eq("id", merchantOrderId);

    if (updateError) {
      console.error("[Callback] Failed to update booking status:", updateError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // 5. Re-fetch the complete updated pesanan with all fields including kamar join
    const { data: updatedPesanan, error: refetchError } = await supabase
      .from("pesanan")
      .select("*, kamar(*)")
      .eq("id", merchantOrderId)
      .single();

    if (refetchError || !updatedPesanan) {
      console.error("[Callback] Failed to re-fetch updated booking:", refetchError);
      // Status was updated, so still return OK to Duitku
      return new NextResponse("OK", { status: 200 });
    }

    // 6. Log status change
    try {
      await supabase.from("pesanan_log").insert({
        pesanan_id: merchantOrderId,
        status_baru: nextStatus,
        keterangan: `Pembayaran melalui Duitku callback. ResultCode: ${resultCode}. Method: ${paymentCode}`,
      });
    } catch (logErr) {
      console.warn("[Callback] Failed to write pesanan_log:", logErr);
    }

    // 7. Trigger notifications if paid successfully
    if (nextStatus === "paid") {
      console.log(`[Callback] Payment SUCCESS for ${updatedPesanan.kode_pesanan}. Sending notifications...`);
      console.log(`[Callback] Guest email: ${updatedPesanan.email}, name: ${updatedPesanan.nama_lengkap}`);

      await Promise.allSettled([
        sendInvoiceEmail(updatedPesanan, updatedPesanan.kamar)
          .then((s) => console.log(`[Callback] Email invoice sent: ${s}`))
          .catch((e) => console.error("[Callback] Email notification error:", e)),
        sendTelegramNewOrderAlert(updatedPesanan, updatedPesanan.kamar)
          .then((s) => console.log(`[Callback] Telegram alert sent: ${s}`))
          .catch((e) => console.error("[Callback] Telegram notification error:", e)),
      ]);
    }

    // Duitku expects 'OK' as plain text response to acknowledge successful callback
    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error("[Callback] Internal error:", err.message);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
