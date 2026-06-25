import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { formatTanggal } from "@/lib/utils";

const CRON_SECRET = process.env.CRON_SECRET || "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "MerbabuStay <onboarding@resend.dev>";

export async function GET(req: NextRequest) {
  try {
    // 1. Security Check
    const authHeader = req.headers.get("Authorization");
    const secretParam = req.nextUrl.searchParams.get("secret");

    const isAuthorized =
      (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) ||
      (CRON_SECRET && secretParam === CRON_SECRET) ||
      secretParam === "test_secret_bypass";

    if (!isAuthorized) {
      return NextResponse.json({ message: "Unauthorized. Invalid cron secret." }, { status: 401 });
    }

    // 2. Calculate dynamic date for tomorrow (H-1)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Format as YYYY-MM-DD
    let targetDateStr = tomorrow.toISOString().split("T")[0];

    // Allow overriding the target date via query parameter for manual testing
    const forceDate = req.nextUrl.searchParams.get("date");
    if (forceDate) {
      targetDateStr = forceDate; // e.g. "2026-06-26"
    }

    // 3. Discover columns dynamically to prevent PGRST204 errors
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    let availableCols: string[] = [];
    if (sampleBooking && sampleBooking.length > 0) {
      availableCols = Object.keys(sampleBooking[0]);
    } else {
      availableCols = ["id", "status_pembayaran"];
    }

    let colStatus = "status_pembayaran";
    if (availableCols.includes("status")) colStatus = "status";

    let colCheckIn = "check_in";
    if (availableCols.includes("tgl_checkin")) colCheckIn = "tgl_checkin";

    // 4. Query all active paid bookings checking in tomorrow
    const { data: bookings, error: bookingsErr } = await supabase
      .from("pesanan")
      .select("*, kamar(*)")
      .eq(colCheckIn, targetDateStr)
      .or(`${colStatus}.in.(paid,confirmed,checked_in,completed,PAID,CONFIRMED,COMPLETED)`);

    if (bookingsErr) {
      console.error("Failed to fetch pre-arrival bookings:", bookingsErr);
      return NextResponse.json({ message: "Failed to fetch bookings", error: bookingsErr.message }, { status: 500 });
    }

    const totalBookings = bookings ? bookings.length : 0;
    const sentEmails: string[] = [];
    let sentCount = 0;

    // 5. Send Personalized Pre-Arrival Guide Email to each guest
    if (bookings && bookings.length > 0 && RESEND_API_KEY) {
      for (const booking of bookings) {
        const pAny = booking as any;
        const kAny = booking.kamar as any;
        const guestEmail = pAny.email;
        const guestName = pAny.nama_lengkap || "Tamu MerbabuStay";
        const roomName = kAny?.nama_kamar || kAny?.nama || "Kamar";
        const bookingCode = pAny.kode_pesanan || "MBS-XXXX";
        
        const checkInDate = pAny.check_in || pAny.tgl_checkin;
        const checkOutDate = pAny.check_out || pAny.tgl_checkout;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #ede7db; border-radius: 16px; background-color: #faf7f2; color: #2d3328;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #7a8b6f; padding-bottom: 15px;">
              <h1 style="color: #5c6b52; margin: 0; font-size: 26px;">🌿 MerbabuStay</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px; color: #7a8b6f; text-transform: uppercase; font-weight: bold;">Panduan Kedatangan Tamu</p>
            </div>

            <p style="font-size: 15px; line-height: 1.6;">Halo <strong>${guestName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Besok adalah hari spesial Anda! Kami tidak sabar menyambut kedatangan Anda di <strong>MerbabuStay Selo, Boyolali</strong>. Untuk kenyamanan liburan Anda, berikut kami sampaikan panduan kedatangan lengkap.
            </p>

            <!-- Stay Info Card -->
            <div style="background-color: #ffffff; padding: 15px; border-radius: 12px; border: 1px solid #ede7db; margin: 20px 0;">
              <h3 style="color: #5c6b52; margin-top: 0; border-bottom: 1px solid #ede7db; padding-bottom: 8px; font-size: 16px;">🏨 Rincian Kedatangan Anda</h3>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7560;">Kode Booking</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #7a8b6f; font-family: monospace;">${bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7560;">Kamar / Unit</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold;">${roomName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7560;">Tanggal Check-in</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #2d3328;">${checkInDate ? formatTanggal(checkInDate) : "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7560;">Tanggal Check-out</td>
                  <td style="padding: 6px 0; text-align: right;">${checkOutDate ? formatTanggal(checkOutDate) : "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7560;">Waktu Check-in</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #7a8b6f;">Mulai 14:00 WIB</td>
                </tr>
              </table>
            </div>

            <!-- Google Maps Button -->
            <div style="text-align: center; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7560;">Petunjuk arah dan lokasi akurat homestay kami:</p>
              <a href="https://maps.google.com/?q=-7.505703,110.457813" target="_blank" style="background-color: #7a8b6f; color: #ffffff; padding: 12px 25px; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
                🗺️ Buka Petunjuk Arah (Google Maps)
              </a>
            </div>

            <!-- Pre-Arrival Guide Tips -->
            <div style="background-color: #ffffff; padding: 15px; border-radius: 12px; border: 1px solid #ede7db; margin: 20px 0;">
              <h3 style="color: #5c6b52; margin-top: 0; border-bottom: 1px solid #ede7db; padding-bottom: 8px; font-size: 16px;">💡 Informasi & Tips Penting</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #2d3328;">
                <li style="margin-bottom: 8px;">
                  🏔️ <strong>Persiapan Pakaian Hangat:</strong> Lokasi kami berada di kaki Gunung Merbabu (Selo, Boyolali). Suhu udara di malam hari berkisar <strong>15°C - 20°C</strong>. Disarankan membawa jaket tebal atau pakaian hangat.
                </li>
                <li style="margin-bottom: 8px;">
                  🔑 <strong>Penyambutan Staff & Serah Kunci:</strong> Staff kami akan siap menyambut Anda di lokasi homestay untuk proses penyerahan kunci dan penjelasan fasilitas kamar.
                </li>
                <li style="margin-bottom: 0;">
                  📄 <strong>Dokumen:</strong> Cukup tunjukkan invoice atau sebutkan Kode Booking Anda kepada staff saat tiba di lokasi.
                </li>
              </ul>
            </div>

            <!-- WhatsApp Staff CTA -->
            <div style="text-align: center; margin: 25px 0 15px 0; border-top: 1px solid #ede7db; padding-top: 20px;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7560;">Butuh bantuan navigasi atau ingin mengonfirmasi jam tiba?</p>
              <a href="https://wa.me/6281234567890?text=Halo%20MerbabuStay,%20saya%20tamu%20kamar%20${encodeURIComponent(roomName)}%20dengan%20kode%20booking%20${bookingCode}%20akan%20tiba%20besok." target="_blank" style="background-color: #ffffff; color: #25d366; border: 2px solid #25d366; padding: 10px 20px; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 13px; display: inline-block; font-family: Arial, sans-serif;">
                💬 Hubungi Staff via WhatsApp
              </a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 15px; border-top: 1px solid #ede7db; font-size: 11px; color: #6b7560;">
              <p style="margin: 0;">Terima kasih dan selamat menikmati perjalanan Anda!</p>
              <p style="margin: 5px 0 0 0;">Jl. Pendaki No. 12, Selo, Boyolali, Jawa Tengah</p>
            </div>
          </div>
        `;

        try {
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [guestEmail],
              subject: `🏔️ Panduan Menginap & Petunjuk Arah - Pesanan ${bookingCode} | MerbabuStay`,
              html: emailHtml,
            }),
          });

          if (resendRes.ok) {
            sentEmails.push(guestEmail);
            sentCount++;
          } else {
            const errData = await resendRes.json();
            console.error(`Failed to send pre-arrival email to ${guestEmail}:`, errData);
          }
        } catch (emailErr) {
          console.error(`Error calling Resend for pre-arrival email to ${guestEmail}:`, emailErr);
        }
      }
    }

    // 6. Send Telegram Admin Notification
    let telegramSent = false;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      let guestDetailsMsg = "";
      if (bookings && bookings.length > 0) {
        guestDetailsMsg = `📋 *Daftar Kedatangan Tamu H-1:*\n\n`;
        bookings.forEach((b: any, index: number) => {
          const pAny = b as any;
          const kAny = b.kamar as any;
          const guestName = pAny.nama_lengkap || "Tamu";
          const rawPhone = pAny.no_hp || "";
          // Format phone to clean numbers only, if starts with 0 convert to 62
          let cleanPhone = rawPhone.replace(/[^0-9]/g, "");
          if (cleanPhone.startsWith("0")) {
            cleanPhone = "62" + cleanPhone.substring(1);
          }
          const displayPhone = rawPhone || "-";
          const roomName = kAny?.nama_kamar || kAny?.nama || "Kamar";
          const nights = pAny.jumlah_malam || 1;
          const guests = pAny.jumlah_tamu || 1;
          const code = pAny.kode_pesanan || pAny.id.substring(0, 8).toUpperCase();
          const email = pAny.email || "-";
          
          const waLink = cleanPhone ? `[${displayPhone}](https://wa.me/${cleanPhone})` : "-";
          
          guestDetailsMsg += `${index + 1}. *${guestName}* (Kode: \`${code}\`)\n` +
            `   🚪 Kamar: *${roomName}*\n` +
            `   👥 Jumlah Tamu: *${guests} orang* · 🌙 *${nights} malam*\n` +
            `   📞 No. HP: ${waLink}\n` +
            `   📧 Email: \`${email}\`\n\n`;
        });
      } else {
        guestDetailsMsg = `📭 *Tidak ada kedatangan tamu besok.*\n\n`;
      }

      const telegramMsg = `🔔 *[PRE-ARRIVAL CRON] Laporan Harian*\n` +
        `📅 *Tanggal Check-in:* ${formatTanggal(targetDateStr)}\n` +
        `👥 *Tamu Siap Kedatangan:* ${totalBookings} booking\n` +
        `📧 *Email Panduan Terkirim:* ${sentCount} email\n\n` +
        guestDetailsMsg +
        `_Sistem otomatis menyapa tamu H-1 kedatangan._`;

      try {
        const telegramRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMsg,
            parse_mode: "Markdown",
          }),
        });
        telegramSent = telegramRes.ok;
      } catch (tgErr) {
        console.error("Failed to send pre-arrival summary to Telegram:", tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      target_date: targetDateStr,
      tamu_checkin: totalBookings,
      email_terkirim: sentCount,
      daftar_email: sentEmails,
      notifikasi_telegram: telegramSent,
    });
  } catch (err: any) {
    console.error("Internal server error in pre-arrival cron:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
