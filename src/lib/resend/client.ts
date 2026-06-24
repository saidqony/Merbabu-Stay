import type { Pesanan, Kamar } from "@/types";
import { formatRupiah, formatTanggal } from "@/lib/utils";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "MerbabuStay <noreply@merbabustay.id>"; // Default fallback or verified domain

export async function sendInvoiceEmail(pesanan: Pesanan, kamar: Kamar): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping invoice email...");
    return false;
  }

  const subject = `🏔️ Konfirmasi Pembayaran Pesanan ${pesanan.kode_pesanan} | MerbabuStay`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ede7db; border-radius: 12px; background-color: #faf7f2; color: #2d3328;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #7a8b6f; padding-bottom: 15px;">
        <h1 style="color: #5c6b52; margin: 0; font-size: 24px;">🌿 MerbabuStay</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px; color: #7a8b6f; text-transform: uppercase;">Invoice Pembayaran</p>
      </div>

      <p>Halo <strong>${pesanan.nama_lengkap}</strong>,</p>
      <p>Terima kasih telah melakukan pembayaran. Reservasi kamar Anda di MerbabuStay telah kami terima dan berstatus <strong>PAID (Lunas)</strong>.</p>

      <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ede7db;">
        <h3 style="color: #5c6b52; margin-top: 0; border-bottom: 1px solid #ede7db; padding-bottom: 8px;">Rincian Pesanan</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Kode Pesanan</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #7a8b6f;">${pesanan.kode_pesanan}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Nama Kamar</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold;">${kamar.nama}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Check-In</td>
            <td style="padding: 6px 0; text-align: right;">${formatTanggal(pesanan.check_in)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Check-Out</td>
            <td style="padding: 6px 0; text-align: right;">${formatTanggal(pesanan.check_out)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Jumlah Malam</td>
            <td style="padding: 6px 0; text-align: right;">${pesanan.jumlah_malam} malam</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Jumlah Tamu</td>
            <td style="padding: 6px 0; text-align: right;">${pesanan.jumlah_tamu} orang</td>
          </tr>
          <tr style="border-top: 1px solid #ede7db;">
            <td style="padding: 10px 0 0 0; font-weight: bold; color: #5c6b52; font-size: 16px;">Total Pembayaran</td>
            <td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; color: #c4956a; font-size: 16px;">${formatRupiah(pesanan.total_bayar)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; line-height: 1.5;">
        Silakan tunjukkan email invoice ini kepada staff kami saat melakukan proses <strong>Check-In</strong> di lokasi homestay. 
      </p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ede7db; font-size: 11px; color: #6b7560;">
        <p>Ada pertanyaan? Hubungi kami via WhatsApp di +62 812-3456-7890</p>
        <p>Jl. Pendaki No. 12, Selo, Boyolali, Jawa Tengah</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [pesanan.email],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Failed to send email via Resend:", errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error calling Resend API:", err);
    return false;
  }
}
