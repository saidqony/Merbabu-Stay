import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendInvoiceEmail } from "@/lib/resend/client";
import { sendTelegramNewOrderAlert } from "@/lib/telegram/client";

// ─────────────────────────────────────────────────────────────
// Helper: Send a simple admin-action Telegram notification
// Used for status changes that don't need a full invoice email
// ─────────────────────────────────────────────────────────────
async function sendTelegramAdminUpdate(pesanan: any, status: string): Promise<void> {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const statusLabels: Record<string, string> = {
    pending:         "⏳ PENDING",
    waiting_payment: "💳 MENUNGGU PEMBAYARAN",
    paid:            "✅ LUNAS (PAID)",
    confirmed:       "✔️ DIKONFIRMASI",
    checked_in:      "🔑 CHECK-IN",
    completed:       "🚪 CHECK-OUT / SELESAI",
    failed:          "❌ GAGAL",
    cancelled:       "🚫 DIBATALKAN",
  };

  const label = statusLabels[status] || status.toUpperCase();
  const kode = pesanan.kode_pesanan || pesanan.id?.substring(0, 8) || "-";
  const nama = pesanan.nama_lengkap || "-";
  const noHp = pesanan.no_hp || "-";
  const waLink = `https://wa.me/${noHp.replace(/[^0-9]/g, "")}`;
  const roomName = pesanan.kamar?.nama_kamar || pesanan.kamar?.nama || "-";
  const checkIn = pesanan.check_in || pesanan.tgl_checkin || "-";
  const checkOut = pesanan.check_out || pesanan.tgl_checkout || "-";

  const message = [
    `🏔️ <b>UPDATE STATUS PESANAN</b>`,
    `Admin mengubah status pesanan secara manual.`,
    ``,
    `<b>Kode Pesanan:</b> <code>${kode}</code>`,
    `<b>Status Baru:</b> ${label}`,
    `<b>Pemesan:</b> ${nama}`,
    `<b>Kamar:</b> ${roomName}`,
    `<b>Telepon:</b> <a href="${waLink}">${noHp}</a>`,
    `<b>Check-In:</b> ${checkIn}`,
    `<b>Check-Out:</b> ${checkOut}`,
    ``,
    `<i>Diubah oleh Admin via Dashboard.</i>`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("[Admin Telegram] Failed:", JSON.stringify(data));
    } else {
      console.log(`[Admin Telegram] Status update sent for ${kode}: ${status}`);
    }
  } catch (e: any) {
    console.error("[Admin Telegram] Network error:", e.message);
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/pesanan/[id]
// ─────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "ID Pesanan wajib diisi." }, { status: 400 });
    }

    let query = supabase.from("pesanan").select("*, kamar(*)");

    if (id.startsWith("MBS-")) {
      query = query.eq("kode_pesanan", id);
    } else {
      query = query.eq("id", id);
    }

    const { data: pesanan, error } = await query.single();

    if (error || !pesanan) {
      return NextResponse.json({ message: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    // Normalize field names for frontend compatibility
    const normalized: any = { ...pesanan };
    if (!normalized.status && normalized.status_pembayaran) normalized.status = normalized.status_pembayaran;
    if (!normalized.check_in && normalized.tgl_checkin) normalized.check_in = normalized.tgl_checkin;
    if (!normalized.check_out && normalized.tgl_checkout) normalized.check_out = normalized.tgl_checkout;
    if (normalized.kamar && !normalized.kamar.nama && normalized.kamar.nama_kamar) {
      normalized.kamar.nama = normalized.kamar.nama_kamar;
    }

    return NextResponse.json({ success: true, data: normalized });
  } catch (err: any) {
    console.error("[GET pesanan] Internal error:", err);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", error: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/pesanan/[id]
// Admin manual status update — with smart notifications per status
// ─────────────────────────────────────────────────────────────
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

    const validStatuses = ["pending", "waiting_payment", "paid", "confirmed", "checked_in", "completed", "failed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Status pesanan tidak valid." }, { status: 400 });
    }

    // Discover available columns dynamically
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    const availableCols: string[] = sampleBooking && sampleBooking.length > 0
      ? Object.keys(sampleBooking[0])
      : ["id", "status_pembayaran"];

    const updatePayload: any = {};
    const setIfExist = (col: string, val: any) => {
      if (availableCols.includes(col)) updatePayload[col] = val;
    };

    // Update status column(s) — handle both schema variants
    if (availableCols.includes("status")) updatePayload.status = status;
    if (availableCols.includes("status_pembayaran")) updatePayload.status_pembayaran = status;

    // Add timestamp columns based on the new status
    const now = new Date().toISOString();
    if (status === "paid")        setIfExist("paid_at", now);
    if (status === "confirmed")   setIfExist("confirmed_at", now);
    if (status === "checked_in")  setIfExist("checked_in_at", now);
    if (status === "completed")   setIfExist("checked_out_at", now);
    if (status === "cancelled") {
      setIfExist("cancelled_at", now);
      setIfExist("cancelled_reason", cancelled_reason || "Dibatalkan oleh Admin");
    }

    // Perform the update
    const { error: updateError } = await supabase
      .from("pesanan")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("[Admin PUT] Failed to update:", updateError);
      return NextResponse.json(
        { message: "Gagal memperbarui status pesanan.", error: updateError.message },
        { status: 500 }
      );
    }

    // Re-fetch complete pesanan with kamar join for notifications and response
    const { data: updatedPesanan, error: refetchError } = await supabase
      .from("pesanan")
      .select("*, kamar(*)")
      .eq("id", id)
      .single();

    if (refetchError || !updatedPesanan) {
      console.error("[Admin PUT] Failed to re-fetch updated booking:", refetchError);
      return NextResponse.json({ success: true, data: null, message: "Status diperbarui tapi data gagal dimuat ulang." });
    }

    // Log the status change
    try {
      await supabase.from("pesanan_log").insert({
        pesanan_id: id,
        status_baru: status,
        keterangan: `Status diubah oleh admin menjadi ${status}`,
      });
    } catch (logErr) {
      console.warn("[Admin PUT] Failed to write pesanan_log:", logErr);
    }

    // ─── Smart Notification Logic per Status ───────────────────
    //
    // PAID   → Full PAID invoice email to guest + full Telegram PAID alert
    // Others → Simple Telegram status update notification only (no guest email spam)
    //
    // This covers ALL admin actions without breaking anything.
    // ───────────────────────────────────────────────────────────

    if (status === "paid") {
      // Full notification: invoice email + Telegram paid alert (same as Duitku automatic)
      console.log(`[Admin PUT] Marking ${updatedPesanan.kode_pesanan} as PAID manually. Sending full notifications...`);
      await Promise.allSettled([
        sendInvoiceEmail(updatedPesanan, updatedPesanan.kamar)
          .then((s) => console.log(`[Admin PUT] Invoice email sent: ${s}`))
          .catch((e) => console.error("[Admin PUT] Invoice email error:", e)),
        sendTelegramNewOrderAlert(updatedPesanan, updatedPesanan.kamar)
          .then((s) => console.log(`[Admin PUT] Telegram PAID alert sent: ${s}`))
          .catch((e) => console.error("[Admin PUT] Telegram PAID alert error:", e)),
      ]);
    } else if (["confirmed", "checked_in", "completed", "cancelled"].includes(status)) {
      // Simple Telegram-only status update notification
      console.log(`[Admin PUT] Status changed to ${status} for ${updatedPesanan.kode_pesanan}. Sending Telegram update...`);
      await sendTelegramAdminUpdate(updatedPesanan, status);
    }
    // pending, waiting_payment, failed → no notification (not meaningful for admin)

    // Normalize for frontend
    const normalized: any = { ...updatedPesanan };
    if (!normalized.status && normalized.status_pembayaran) normalized.status = normalized.status_pembayaran;

    return NextResponse.json({ success: true, data: normalized });
  } catch (err: any) {
    console.error("[Admin PUT] Internal server error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
