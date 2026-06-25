import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "ID Pesanan wajib diisi." }, { status: 400 });
    }

    // Try finding by UUID (id) first, then fallback to kode_pesanan (MBS-xxx)
    let query = supabase
      .from("pesanan")
      .select("*, kamar(*)");

    if (id.startsWith("MBS-")) {
      query = query.eq("kode_pesanan", id);
    } else {
      query = query.eq("id", id);
    }

    const { data: pesanan, error } = await query.single();

    if (error || !pesanan) {
      return NextResponse.json({ message: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    // Normalize status, date, and room name fields for frontend compatibility
    const normalized = { ...pesanan };
    
    if (!normalized.status && normalized.status_pembayaran) {
      normalized.status = normalized.status_pembayaran;
    }
    
    if (!normalized.check_in && normalized.tgl_checkin) {
      normalized.check_in = normalized.tgl_checkin;
    }
    
    if (!normalized.check_out && normalized.tgl_checkout) {
      normalized.check_out = normalized.tgl_checkout;
    }

    if (normalized.kamar) {
      if (!normalized.kamar.nama && normalized.kamar.nama_kamar) {
        normalized.kamar.nama = normalized.kamar.nama_kamar;
      }
    }

    return NextResponse.json({ success: true, data: normalized });
  } catch (err: any) {
    console.error("Internal server error in get-pesanan-details:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, cancelled_reason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { message: "ID Pesanan dan Status baru wajib diisi." },
        { status: 400 }
      );
    }

    // Valid statuses
    const validStatuses = [
      "pending",
      "waiting_payment",
      "paid",
      "confirmed",
      "checked_in",
      "completed",
      "failed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Status pesanan tidak valid." }, { status: 400 });
    }

    // Discover columns dynamically to prevent PGRST204 errors on older schemas
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    let availableCols: string[] = [];
    if (sampleBooking && sampleBooking.length > 0) {
      availableCols = Object.keys(sampleBooking[0]);
    } else {
      availableCols = ["id", "status_pembayaran"];
    }

    const updatePayload: any = {};
    const setIfExist = (dbCol: string, value: any) => {
      if (availableCols.includes(dbCol)) {
        updatePayload[dbCol] = value;
      }
    };

    // Map status dynamically to whatever column is present (update both if both exist to stay in sync!)
    if (availableCols.includes("status")) {
      updatePayload.status = status;
    }
    if (availableCols.includes("status_pembayaran")) {
      updatePayload.status_pembayaran = status;
    }

    // Set other schema-dependent columns only if they exist in the database
    if (status === "cancelled") {
      setIfExist("cancelled_at", new Date().toISOString());
      setIfExist("cancelled_reason", cancelled_reason || "Dibatalkan oleh Admin");
    } else if (status === "paid") {
      setIfExist("paid_at", new Date().toISOString());
    } else if (status === "confirmed") {
      setIfExist("confirmed_at", new Date().toISOString());
    } else if (status === "checked_in") {
      setIfExist("checked_in_at", new Date().toISOString());
    } else if (status === "completed") {
      setIfExist("checked_out_at", new Date().toISOString());
    }

    const { data: updated, error } = await supabase
      .from("pesanan")
      .update(updatePayload)
      .eq("id", id)
      .select("*, kamar(*)")
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { message: "Gagal memperbarui status pesanan.", error: error?.message },
        { status: 500 }
      );
    }

    // Log status change
    try {
      await supabase.from("pesanan_log").insert({
        pesanan_id: id,
        status_baru: status,
        keterangan: `Status diubah oleh admin menjadi ${status}`,
      });
    } catch (logErr) {
      console.warn("Failed to insert pesanan_log:", logErr);
    }

    // Trigger notifications if admin manually marks as PAID
    if (status === "paid") {
      try {
        const { sendInvoiceEmail } = await import("@/lib/resend/client");
        const { sendTelegramNewOrderAlert } = await import("@/lib/telegram/client");

        console.log(`[Admin Manual] Booking ${updated.kode_pesanan} marked as PAID. Triggering Resend and Telegram...`);

        // Await the notifications to ensure Vercel does not terminate the function mid-flight
        await Promise.allSettled([
          sendInvoiceEmail(updated, updated.kamar)
            .then((s) => console.log(`[Admin Manual] Email invoice sent: ${s}`))
            .catch((e) => console.error("[Admin Manual] Email notification error:", e)),
          sendTelegramNewOrderAlert(updated, updated.kamar)
            .then((s) => console.log(`[Admin Manual] Telegram alert sent: ${s}`))
            .catch((e) => console.error("[Admin Manual] Telegram notification error:", e))
        ]);
      } catch (notifErr) {
        console.error("Failed to trigger notifications for admin manual paid:", notifErr);
      }
    }

    // Normalize status field for frontend compatibility
    const normalizedUpdated = { ...updated };
    if (!normalizedUpdated.status && normalizedUpdated.status_pembayaran) {
      normalizedUpdated.status = normalizedUpdated.status_pembayaran;
    }

    return NextResponse.json({ success: true, data: normalizedUpdated });
  } catch (err: any) {
    console.error("Internal server error in update-pesanan:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
