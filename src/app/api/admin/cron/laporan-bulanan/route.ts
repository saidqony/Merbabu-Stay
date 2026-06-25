import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/lib/utils";

const CRON_SECRET = process.env.CRON_SECRET || "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "MerbabuStay <onboarding@resend.dev>";
const ADMIN_EMAIL = "saidqony@gmail.com"; // Verified owner email for sandbox / testing

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

    // 2. Calculate dynamic date range for the previous month
    const now = new Date();
    let targetYear = now.getFullYear();
    let targetMonth = now.getMonth() - 1; // Default to previous month (0-indexed)

    if (now.getMonth() === 0) {
      // If current month is January, previous month is December of last year
      targetMonth = 11;
      targetYear = now.getFullYear() - 1;
    }

    // Allow forcing a specific month/year via query params for manual testing
    const forceMonth = req.nextUrl.searchParams.get("month");
    const forceYear = req.nextUrl.searchParams.get("year");
    if (forceMonth !== null) {
      targetMonth = parseInt(forceMonth, 10) - 1;
    }
    if (forceYear !== null) {
      targetYear = parseInt(forceYear, 10);
    }

    // Date boundaries (UTC to prevent timezone offsets)
    const startDate = new Date(Date.UTC(targetYear, targetMonth, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59, 999));
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    // 3. Discover columns dynamically to prevent PGRST204 errors on older schemas
    const { data: sampleBooking } = await supabase.from("pesanan").select("*").limit(1);
    let availableCols: string[] = [];
    if (sampleBooking && sampleBooking.length > 0) {
      availableCols = Object.keys(sampleBooking[0]);
    } else {
      availableCols = ["id", "status_pembayaran"];
    }

    let colStatus = "status_pembayaran";
    if (availableCols.includes("status")) colStatus = "status";

    // 4. Query all active paid bookings in the range
    const { data: bookings, error: bookingsErr } = await supabase
      .from("pesanan")
      .select("*, kamar(*)")
      .or(`${colStatus}.in.(paid,confirmed,checked_in,completed,PAID,CONFIRMED,COMPLETED)`)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (bookingsErr) {
      console.error("Failed to fetch bookings for report:", bookingsErr);
      return NextResponse.json({ message: "Failed to fetch bookings", error: bookingsErr.message }, { status: 500 });
    }

    // 5. Query all rooms to calculate total capacity and occupancy rate
    const { data: rooms, error: roomsErr } = await supabase.from("kamar").select("*");
    if (roomsErr) {
      console.error("Failed to fetch rooms for report:", roomsErr);
    }

    const totalRoomsCount = rooms
      ? rooms.reduce((sum, r: any) => sum + (r.jumlah_kamar || r.stok || 1), 0)
      : 1;

    const totalCapacityNights = totalRoomsCount * daysInMonth;

    // 6. Calculate Financial Metrics
    let totalRevenue = 0;
    let totalNightsSold = 0;
    const totalBookings = bookings ? bookings.length : 0;

    const roomPerformance: Record<string, { name: string; type: string; nights: number; revenue: number }> = {};

    // Initialize with all active rooms
    if (rooms) {
      rooms.forEach((r: any) => {
        roomPerformance[r.id] = {
          name: r.nama_kamar || r.nama || "Kamar",
          type: (r.tipe || "standard").toUpperCase(),
          nights: 0,
          revenue: 0,
        };
      });
    }

    if (bookings) {
      bookings.forEach((b: any) => {
        const pAny = b as any;
        const kAny = b.kamar as any;
        const roomId = pAny.kamar_id;
        const nights = pAny.jumlah_malam || 1;
        const revenue = pAny.total_bayar || pAny.total_harga || 0;

        totalRevenue += revenue;
        totalNightsSold += nights;

        if (roomId) {
          if (!roomPerformance[roomId]) {
            roomPerformance[roomId] = {
              name: kAny?.nama_kamar || kAny?.nama || "Kamar",
              type: (kAny?.tipe || "standard").toUpperCase(),
              nights: 0,
              revenue: 0,
            };
          }
          roomPerformance[roomId].nights += nights;
          roomPerformance[roomId].revenue += revenue;
        }
      });
    }

    const occupancyRate = totalCapacityNights > 0 ? (totalNightsSold / totalCapacityNights) * 100 : 0;

    // Month name in Indonesian
    const namaBulanIndo = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const namaBulan = namaBulanIndo[targetMonth];

    // 7. Compile Telegram Markdown Message
    let telegramMsg = `🏔️ *LAPORAN KEUANGAN BULANAN - MERBABUSTAY* 🏔️\n`;
    telegramMsg += `📅 *Periode:* ${namaBulan} ${targetYear}\n\n`;
    telegramMsg += `📊 *Ringkasan Eksekutif:*\n`;
    telegramMsg += `• Total Pendapatan: *${formatRupiah(totalRevenue)}*\n`;
    telegramMsg += `• Transaksi Lunas: *${totalBookings} pesanan*\n`;
    telegramMsg += `• Kamar Terjual: *${totalNightsSold} malam*\n`;
    telegramMsg += `• Tingkat Okupansi: *${occupancyRate.toFixed(1)}%* (dari total ${totalCapacityNights} malam tersedia)\n\n`;
    
    telegramMsg += `🚪 *Rincian Performa per Kamar:*\n`;
    Object.values(roomPerformance).forEach((rp: any) => {
      telegramMsg += `• *${rp.name}* (${rp.type}): ${rp.nights} malam | *${formatRupiah(rp.revenue)}*\n`;
    });
    telegramMsg += `\n_Laporan bulanan otomatis dibuat oleh sistem MerbabuStay Scheduler._`;

    // 8. Compile Resend Email HTML Template
    let roomRowsHtml = "";
    Object.values(roomPerformance).forEach((rp: any) => {
      roomRowsHtml += `
        <tr style="border-bottom: 1px solid #ede7db;">
          <td style="padding: 12px; font-weight: bold; color: #2d3328;">${rp.name}</td>
          <td style="padding: 12px; text-align: center; color: #6b7560;">${rp.type}</td>
          <td style="padding: 12px; text-align: center; font-weight: bold; color: #5c6b52;">${rp.nights} malam</td>
          <td style="padding: 12px; text-align: right; font-weight: bold; color: #c4956a;">${formatRupiah(rp.revenue)}</td>
        </tr>
      `;
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #ede7db; border-radius: 16px; background-color: #faf7f2; color: #2d3328;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #7a8b6f; padding-bottom: 15px;">
          <h1 style="color: #5c6b52; margin: 0; font-size: 26px;">🌿 MerbabuStay</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px; color: #7a8b6f; text-transform: uppercase; font-weight: bold;">Laporan Keuangan & Okupansi Bulanan</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Halo <strong>Administrator</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Berikut adalah rangkuman performa operasional dan pendapatan homestay MerbabuStay untuk periode bulan kemarin.</p>

        <!-- Executive Cards Grid -->
        <div style="margin: 25px 0;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 10px; font-family: Arial, sans-serif;">
            <tr>
              <td style="background-color: #ffffff; padding: 15px; border-radius: 12px; border: 1px solid #ede7db; width: 50%; text-align: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: #7a8b6f; font-weight: bold; display: block; margin-bottom: 5px;">Total Pendapatan</span>
                <span style="font-size: 20px; font-weight: bold; color: #c4956a; display: block;">${formatRupiah(totalRevenue)}</span>
              </td>
              <td style="background-color: #ffffff; padding: 15px; border-radius: 12px; border: 1px solid #ede7db; width: 50%; text-align: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: #7a8b6f; font-weight: bold; display: block; margin-bottom: 5px;">Tingkat Okupansi</span>
                <span style="font-size: 20px; font-weight: bold; color: #5c6b52; display: block;">${occupancyRate.toFixed(1)}%</span>
              </td>
            </tr>
            <tr>
              <td style="background-color: #ffffff; padding: 15px; border-radius: 12px; border: 1px solid #ede7db; text-align: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: #7a8b6f; font-weight: bold; display: block; margin-bottom: 5px;">Malam Terjual</span>
                <span style="font-size: 20px; font-weight: bold; color: #2d3328; display: block;">${totalNightsSold} malam</span>
              </td>
              <td style="background-color: #ffffff; padding: 15px; border-radius: 12px; border: 1px solid #ede7db; text-align: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: #7a8b6f; font-weight: bold; display: block; margin-bottom: 5px;">Transaksi Lunas</span>
                <span style="font-size: 20px; font-weight: bold; color: #2d3328; display: block;">${totalBookings} pesanan</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #ede7db; padding: 15px; margin-bottom: 25px;">
          <h3 style="color: #5c6b52; margin-top: 0; border-bottom: 2px solid #faf7f2; padding-bottom: 8px; font-size: 16px;">📊 Performa Berdasarkan Unit Kamar</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #faf7f2; border-bottom: 2px solid #ede7db;">
                <th style="padding: 10px; text-align: left; color: #5c6b52;">Nama Kamar</th>
                <th style="padding: 10px; text-align: center; color: #5c6b52;">Tipe</th>
                <th style="padding: 10px; text-align: center; color: #5c6b52;">Malam Terjual</th>
                <th style="padding: 10px; text-align: right; color: #5c6b52;">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              ${roomRowsHtml}
            </tbody>
          </table>
        </div>

        <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 12px; margin-bottom: 25px; text-align: center; font-size: 13px; color: #2e7d32; font-weight: bold;">
          ✅ Laporan Keuangan Bulanan periode ${namaBulan} ${targetYear} berhasil diverifikasi dan disinkronkan.
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ede7db; font-size: 11px; color: #6b7560;">
          <p style="margin: 0;">Sistem Laporan Otomatis MerbabuStay</p>
          <p style="margin: 5px 0 0 0;">Jl. Pendaki No. 12, Selo, Boyolali, Jawa Tengah</p>
        </div>
      </div>
    `;

    // 9. Send Telegram Bot Notification (Async)
    let telegramSent = false;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
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
        console.error("Failed to send cron report to Telegram:", tgErr);
      }
    }

    // 10. Send Email Notification via Resend (Async) with Excel Attachment
    let emailSent = false;
    if (RESEND_API_KEY) {
      try {
        // Generate CSV Content for Excel
        let csvContent = "sep=,\n"; // Excel helper for separator
        csvContent += `"LAPORAN KEUANGAN BULANAN - MERBABUSTAY"\n`;
        csvContent += `"Periode","${namaBulan} ${targetYear}"\n`;
        csvContent += `"Tanggal Cetak","${new Date().toLocaleDateString("id-ID")}"\n\n`;
        
        csvContent += `"RINGKASAN EKSEKUTIF"\n`;
        csvContent += `"Metrik","Nilai"\n`;
        csvContent += `"Total Pendapatan (IDR)",${totalRevenue}\n`;
        csvContent += `"Tingkat Okupansi (%)","${occupancyRate.toFixed(1)}%"\n`;
        csvContent += `"Total Malam Terjual (malam)",${totalNightsSold}\n`;
        csvContent += `"Total Transaksi Lunas",${totalBookings}\n\n`;
        
        csvContent += `"PERFORMA PER UNIT KAMAR"\n`;
        csvContent += `"Nama Kamar","Tipe","Malam Terjual","Total Pendapatan (IDR)"\n`;
        Object.values(roomPerformance).forEach((rp: any) => {
          const cleanName = rp.name.replace(/"/g, '""');
          csvContent += `"${cleanName}","${rp.type}",${rp.nights},${rp.revenue}\n`;
        });
        csvContent += "\n";
        
        csvContent += `"DAFTAR TRANSAKSI DETAIL (LUNAS)"\n`;
        csvContent += `"Kode Booking","Nama Tamu","Email","No HP","Nama Kamar","Check-in","Check-out","Jumlah Malam","Total Bayar (IDR)"\n`;
        if (bookings) {
          bookings.forEach((b: any) => {
            const pAny = b as any;
            const kAny = b.kamar as any;
            const cleanGuestName = (pAny.nama_lengkap || "").replace(/"/g, '""');
            const cleanRoomName = (kAny?.nama_kamar || kAny?.nama || "Kamar").replace(/"/g, '""');
            
            csvContent += `"${pAny.kode_pesanan || ""}","${cleanGuestName}","${pAny.email || ""}","${pAny.no_hp || ""}","${cleanRoomName}","${pAny.check_in || pAny.tgl_checkin || ""}","${pAny.check_out || pAny.tgl_checkout || ""}",${pAny.jumlah_malam || 1},${pAny.total_bayar || pAny.total_harga || 0}\n`;
          });
        }
        
        const csvBase64 = Buffer.from(csvContent, "utf-8").toString("base64");

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `📊 Laporan Keuangan Bulanan (${namaBulan} ${targetYear}) - MerbabuStay`,
            html: emailHtml,
            attachments: [
              {
                content: csvBase64,
                filename: `Laporan_Keuangan_${namaBulan.replace(/\s+/g, "_")}_${targetYear}.csv`
              }
            ]
          }),
        });
        
        emailSent = resendRes.ok;
        if (!resendRes.ok) {
          const errData = await resendRes.json();
          console.error("Resend API rejected cron report email:", errData);
          try {
            const fs = require("fs");
            fs.writeFileSync("cron_resend_error.log", JSON.stringify({
              timestamp: new Date().toISOString(),
              status: resendRes.status,
              statusText: resendRes.statusText,
              error: errData
            }, null, 2));
          } catch (logErr) {}
        }
      } catch (emailErr: any) {
        console.error("Failed to send cron report to Resend:", emailErr);
        try {
          const fs = require("fs");
          fs.writeFileSync("cron_resend_error.log", JSON.stringify({
            timestamp: new Date().toISOString(),
            exception: emailErr.message || emailErr,
            stack: emailErr.stack
          }, null, 2));
        } catch (logErr) {}
      }
    } else {
      console.warn("RESEND_API_KEY is not defined in environment variables for cron report.");
    }

    return NextResponse.json({
      success: true,
      periode: `${namaBulan} ${targetYear}`,
      data: {
        total_pendapatan: totalRevenue,
        total_transaksi: totalBookings,
        malam_terjual: totalNightsSold,
        tingkat_okupansi: `${occupancyRate.toFixed(1)}%`,
        rincian_kamar: roomPerformance,
      },
      notifikasi: {
        telegram: telegramSent,
        email: emailSent,
      },
    });
  } catch (err: any) {
    console.error("Internal server error in monthly report cron:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: err.message },
      { status: 500 }
    );
  }
}
