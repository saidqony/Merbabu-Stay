import type { Pesanan, Kamar } from "@/types";
import { formatRupiah, formatTanggal } from "@/lib/utils";

export async function sendInvoiceEmail(pesanan: Pesanan, kamar: Kamar): Promise<boolean> {
  // Read env vars fresh on every call — do NOT read at module scope on serverless
  const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "MerbabuStay <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping invoice email...");
    return false;
  }

  const pAny = pesanan as any;
  const kAny = kamar as any;

  const roomName = kAny.nama_kamar || kAny.nama || "Kamar";
  const checkInDate = pAny.check_in || pAny.tgl_checkin;
  const checkOutDate = pAny.check_out || pAny.tgl_checkout;
  const totalPay = pAny.total_bayar || pAny.total_harga || 0;
  const totalNights = pAny.jumlah_malam || 1;
  const totalGuests = pAny.jumlah_tamu || 1;

  // Determine status and style dynamically
  const isPaid = pAny.status === "paid" || pAny.status === "confirmed" || pAny.status === "PAID" || pAny.status === "CONFIRMED";
  
  const subject = isPaid
    ? `🏔️ Konfirmasi Pembayaran Lunas - Pesanan ${pAny.kode_pesanan} | MerbabuStay`
    : `🏔️ Tagihan Pembayaran - Pesanan ${pAny.kode_pesanan} | MerbabuStay`;

  const statusText = isPaid ? "LUNAS (PAID)" : "MENUNGGU PEMBAYARAN (PENDING)";
  const statusColor = isPaid ? "#2d7a43" : "#c4956a";
  const statusBg = isPaid ? "#edf7f1" : "#faf7f2";
  
  const welcomeMessage = isPaid
    ? `Terima kasih telah melakukan pembayaran. Reservasi kamar Anda di MerbabuStay telah kami terima dan berstatus <strong>PAID (Lunas)</strong>.`
    : `Reservasi kamar Anda di MerbabuStay telah kami terima. Silakan lakukan pembayaran Anda untuk mengamankan pesanan kamar Anda sebelum batas waktu habis.`;

  const paymentButtonHtml = isPaid
    ? ""
    : `
      <div style="text-align: center; margin: 25px 0; border-top: 1px solid #ede7db; border-bottom: 1px solid #ede7db; padding: 20px 0;">
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6B7560;">Silakan selesaikan pembayaran Anda secara aman melalui tautan di bawah ini:</p>
        <a href="${pAny.payment_url || "#"}" style="background-color: #7A8B6F; color: #ffffff; padding: 12px 30px; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
          💳 Bayar Sekarang via Duitku
        </a>
        <p style="font-size: 11px; color: #8c9682; margin: 8px 0 0 0;">Batas waktu pembayaran: 30 menit sejak pemesanan dilakukan.</p>
      </div>
    `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ede7db; border-radius: 12px; background-color: #faf7f2; color: #2d3328;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #7a8b6f; padding-bottom: 15px;">
        <h1 style="color: #5c6b52; margin: 0; font-size: 24px;">🌿 MerbabuStay</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px; color: #7a8b6f; text-transform: uppercase;">Invoice Pembayaran</p>
      </div>

      <p>Halo <strong>${pAny.nama_lengkap}</strong>,</p>
      <p>${welcomeMessage}</p>

      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; padding: 6px 16px; font-weight: bold; border-radius: 20px; font-size: 13px; color: ${statusColor}; background-color: ${statusBg}; border: 1px solid ${statusColor}40;">
          Status: ${statusText}
        </span>
      </div>

      ${paymentButtonHtml}

      <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ede7db;">
        <h3 style="color: #5c6b52; margin-top: 0; border-bottom: 1px solid #ede7db; padding-bottom: 8px;">Rincian Pesanan</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Kode Pesanan</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #7a8b6f; font-family: monospace;">${pAny.kode_pesanan}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Nama Kamar</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold;">${roomName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Check-In</td>
            <td style="padding: 6px 0; text-align: right;">${checkInDate ? formatTanggal(checkInDate) : "-"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Check-Out</td>
            <td style="padding: 6px 0; text-align: right;">${checkOutDate ? formatTanggal(checkOutDate) : "-"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Jumlah Malam</td>
            <td style="padding: 6px 0; text-align: right;">${totalNights} malam</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7560;">Jumlah Tamu</td>
            <td style="padding: 6px 0; text-align: right;">${totalGuests} orang</td>
          </tr>
          <tr style="border-top: 1px solid #ede7db;">
            <td style="padding: 10px 0 0 0; font-weight: bold; color: #5c6b52; font-size: 16px;">Total Pembayaran</td>
            <td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; color: #c4956a; font-size: 16px;">${formatRupiah(totalPay)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; line-height: 1.5;">
        Silakan simpan invoice ini. Jika status pesanan Anda sudah Lunas, tunjukkan email invoice ini kepada staff kami saat melakukan proses <strong>Check-In</strong> di lokasi homestay.
      </p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ede7db; font-size: 11px; color: #6b7560;">
        <p>Ada pertanyaan? Hubungi kami via WhatsApp di +62 812-3456-7890</p>
        <p>Jl. Pendaki No. 12, Selo, Boyolali, Jawa Tengah</p>
      </div>
    </div>
  `;

  // If we are in Sandbox mode (using onboarding@resend.dev), Resend only allows sending to the registered owner (saidqony@gmail.com)
  const isSandbox = FROM_EMAIL.includes("onboarding@resend.dev");
  const recipientEmail = isSandbox ? "saidqony@gmail.com" : pesanan.email;
  const finalSubject = isSandbox ? `[Sandbox Test untuk ${pesanan.email}] ${subject}` : subject;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipientEmail],
        subject: finalSubject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Failed to send email via Resend:", errData);
      try {
        const fs = require("fs");
        fs.writeFileSync("resend_error.log", JSON.stringify({
          timestamp: new Date().toISOString(),
          status: response.status,
          statusText: response.statusText,
          error: errData,
          payload: {
            from: FROM_EMAIL,
            to: [pesanan.email],
            subject: subject
          }
        }, null, 2));
      } catch (logErr) {
        console.error("Failed to write resend_error.log:", logErr);
      }
      return false;
    }

    return true;
  } catch (err: any) {
    console.error("Error calling Resend API:", err);
    try {
      const fs = require("fs");
      fs.writeFileSync("resend_error.log", JSON.stringify({
        timestamp: new Date().toISOString(),
        exception: err.message || err,
        stack: err.stack
      }, null, 2));
    } catch (logErr) {}
    return false;
  }
}
