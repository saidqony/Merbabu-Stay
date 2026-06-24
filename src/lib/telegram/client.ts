import type { Pesanan, Kamar } from "@/types";
import { formatRupiah, formatTanggal } from "@/lib/utils";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function sendTelegramNewOrderAlert(pesanan: Pesanan, kamar: Kamar): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram bot token or chat ID is not set. Skipping Telegram notification...");
    return false;
  }

  const message = `
🏔️ *PESANAN BARU TERBAYAR* 🏔️

*Detail Pesanan:*
• Kode: \`${pesanan.kode_pesanan}\`
• Kamar: *${kamar.nama}* (${kamar.tipe.toUpperCase()})
• Pemesan: ${pesanan.nama_lengkap}
• Telepon: [${pesanan.no_hp}](tel:${pesanan.no_hp})
• Email: ${pesanan.email}

*Rincian Jadwal:*
• Check-In: *${formatTanggal(pesanan.check_in)}*
• Check-Out: *${formatTanggal(pesanan.check_out)}*
• Durasi: ${pesanan.jumlah_malam} malam
• Tamu: ${pesanan.jumlah_tamu} orang

*Total Bayar:*
• *${formatRupiah(pesanan.total_bayar)}*
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
