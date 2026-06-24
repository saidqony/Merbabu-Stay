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
      console.warn("Duitku callback missing mandatory fields:", body);
      return new NextResponse("Bad Request: Missing fields", { status: 400 });
    }

    // 2. Verify signature to prevent fraud
    const isValid = verifyCallbackSignature(amount, merchantOrderId, signature);
    if (!isValid) {
      console.error("Duitku callback signature mismatch! Fraud alert. Received:", signature);
      return new NextResponse("Unauthorized: Signature mismatch", { status: 401 });
    }

    // 3. Fetch order details from database
    const { data: pesanan, error: fetchError } = await supabase
      .from("pesanan")
      .select("*, kamar(*)")
      .eq("id", merchantOrderId)
      .single();

    if (fetchError || !pesanan) {
      console.error(`Order ${merchantOrderId} not found for Duitku callback.`);
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

    const getBookingStatus = (item: any) => {
      return item.status || item.status_pembayaran || "";
    };

    const currentBookingStatus = getBookingStatus(pesanan);

    // Check if already processed to avoid duplicate triggers
    if (currentBookingStatus === "paid" || currentBookingStatus === "confirmed") {
      console.log(`Order ${pesanan.kode_pesanan} is already marked as paid.`);
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
    }

    // Set status dynamically (update both if both exist to keep them in sync!)
    if (availableCols.includes("status")) {
      updateFields.status = nextStatus;
    }
    if (availableCols.includes("status_pembayaran")) {
      updateFields.status_pembayaran = nextStatus;
    }

    // 4. Update order in database
    const { data: updatedPesanan, error: updateError } = await supabase
      .from("pesanan")
      .update(updateFields)
      .eq("id", merchantOrderId)
      .select()
      .single();

    if (updateError || !updatedPesanan) {
      console.error("Failed to update booking status in callback:", updateError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // 5. Log status change
    try {
      await supabase.from("pesanan_log").insert({
        pesanan_id: merchantOrderId,
        status_baru: nextStatus,
        keterangan: `Pembayaran melalui Duitku callback. ResultCode: ${resultCode}. Method: ${paymentCode}`,
      });
    } catch (logErr) {
      console.warn("Failed to write log for payment callback:", logErr);
    }

    // 6. Trigger notifications in parallel if paid successfully
    if (nextStatus === "paid") {
      console.log(`Payment success for ${pesanan.kode_pesanan}. Triggering emails and Telegram notifications.`);
      
      const emailPromise = sendInvoiceEmail(updatedPesanan, pesanan.kamar)
        .then((s) => console.log(`Email invoice sent: ${s}`))
        .catch((e) => console.error("Email notification error:", e));

      const telegramPromise = sendTelegramNewOrderAlert(updatedPesanan, pesanan.kamar)
        .then((s) => console.log(`Telegram alert sent: ${s}`))
        .catch((e) => console.error("Telegram notification error:", e));

      // Do not block the webhook response, let them run in background
      Promise.allSettled([emailPromise, telegramPromise]);
    }

    // Duitku expects 'OK' as plain text response to acknowledge successful callback
    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error("Internal error in Duitku payment callback:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
