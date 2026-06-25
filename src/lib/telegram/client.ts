import type { Pesanan, Kamar } from "@/types";
import { formatRupiah, formatTanggal } from "@/lib/utils";

export async function sendTelegramNewOrderAlert(pesanan: Pesanan, kamar: Kamar): Promise<boolean> {
  // Read env vars fresh on every call — do NOT read at module scope on serverless
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram bot token or chat ID is not set. Skipping Telegram notification...");
    return false;
  }

  const pAny = pesanan as any;
  const kAny = kamar as any;

  const roomName = kAny.nama_kamar || kAny.nama || "Kamar";
  const roomType = (kAny.tipe || "standard").toUpperCase();

  const checkInDate = pAny.check_in || pAny.tgl_checkin;
  const checkOutDate = pAny.check_out || pAny.tgl_checkout;

  const totalPay = pAny.total_bayar || pAny.total_harga || 0;
  const totalNights = pAny.jumlah_malam || 1;
  const totalGuests = pAny.jumlah_tamu || 1;
  const noHp = pAny.no_hp || pesanan.no_hp || "-";
  const guestEmail = pAny.email || pesanan.email || "-";
  const guestName = pAny.nama_lengkap || pesanan.nama_lengkap || "Tamu";
  const kode = pAny.kode_pesanan || pesanan.kode_pesanan || "-";
  const paidAt = pAny.paid_at || pesanan.paid_at;

  // Use HTML parse mode — much more reliable than Markdown v1 on Telegram
  // Avoid special characters that break Markdown: *, _, `, [, ]
  const waLink = `https://wa.me/${noHp.replace(/[^0-9]/g, "")}`;

  const message = [
    "🏔️ <b>PESANAN BARU TERBAYAR</b> 🏔️",
    "",
    "<b>Detail Pesanan:</b>",
    `• Kode: <code>${kode}</code>`,
    `• Kamar: <b>${roomName}</b> (${roomType})`,
    `• Pemesan: <b>${guestName}</b>`,
    `• Telepon: <a href="${waLink}">${noHp}</a>`,
    `• Email: ${guestEmail}`,
    "",
    "<b>Rincian Jadwal:</b>",
    `• Check-In: <b>${checkInDate ? formatTanggal(checkInDate) : "-"}</b>`,
    `• Check-Out: <b>${checkOutDate ? formatTanggal(checkOutDate) : "-"}</b>`,
    `• Durasi: ${totalNights} malam`,
    `• Tamu: ${totalGuests} orang`,
    "",
    "<b>Total Bayar:</b>",
    `• <b>${formatRupiah(totalPay)}</b>`,
    "• Status: <b>✅ PAID (LUNAS)</b>",
    `• Waktu Bayar: ${paidAt ? formatTanggal(paidAt) : "Baru saja"}`,
    "",
    "<i>Silakan persiapkan kamar untuk menyambut kedatangan tamu!</i>",
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[Telegram] Failed to send message. Status:", response.status, "Error:", JSON.stringify(responseData));
      return false;
    }

    console.log("[Telegram] Message sent successfully. Message ID:", responseData?.result?.message_id);
    return true;
  } catch (err: any) {
    console.error("[Telegram] Network error calling Telegram Bot API:", err.message);
    return false;
  }
}
