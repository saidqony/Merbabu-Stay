import type { Pesanan, Kamar } from "@/types";
import { formatRupiah, formatTanggal } from "@/lib/utils";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function sendTelegramNewOrderAlert(pesanan: Pesanan, kamar: Kamar): Promise<boolean> {
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

  const message = `
🏔️ *PESANAN BARU TERBAYAR* 🏔️

*Detail Pesanan:*
• Kode: \`${pesanan.kode_pesanan}\`
• Kamar: *${roomName}* (${roomType})
• Pemesan: ${pesanan.nama_lengkap}
• Telepon: [${pesanan.no_hp}](tel:${pesanan.no_hp})
• Email: ${pesanan.email}

*Rincian Jadwal:*
• Check-In: *${checkInDate ? formatTanggal(checkInDate) : "-"}*
• Check-Out: *${checkOutDate ? formatTanggal(checkOutDate) : "-"}*
• Durasi: ${totalNights} malam
• Tamu: ${totalGuests} orang

*Total Bayar:*
• *${formatRupiah(totalPay)}*
• Status: *PAID (LUNAS)*
• Waktu Bayar: ${pesanan.paid_at ? formatTanggal(pesanan.paid_at) : "Baru saja"}

_Silakan persiapkan kamar untuk menyambut kedatangan tamu!_
  `.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Failed to send Telegram message:", errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error calling Telegram Bot API:", err);
    return false;
  }
}
