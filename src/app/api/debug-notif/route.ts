import { NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/lib/resend/client";
import { sendTelegramNewOrderAlert } from "@/lib/telegram/client";

export async function GET() {
  try {
    // 1. Create mock data for testing
    const mockKamar: any = {
      nama: "Kamar Pemandangan Gunung (Test)",
      tipe: "deluxe",
      harga_per_malam: 425000,
      foto_utama: "https://prhqqfvmcpuakjopqyzs.supabase.co/storage/v1/object/public/kamar/test.jpg"
    };

    const mockPesanan: any = {
      id: "test-uuid-12345",
      kode_pesanan: "MBS-TEST-9999",
      nama_lengkap: "Budi Santoso (Test)",
      email: "merbabustay.test@gmail.com", // Mock test email
      no_hp: "081234567890",
      catatan: "Ini adalah pengujian integrasi Resend & Telegram Bot.",
      check_in: "2026-07-10",
      check_out: "2026-07-12",
      jumlah_malam: 2,
      jumlah_tamu: 2,
      total_harga: 850000,
      diskon: 0,
      total_bayar: 850000,
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method_name: "Duitku Virtual Account"
    };

    console.log("Starting live integration test for Resend and Telegram...");

    // 2. Trigger notifications
    const resendSuccess = await sendInvoiceEmail(mockPesanan, mockKamar);
    const telegramSuccess = await sendTelegramNewOrderAlert(mockPesanan, mockKamar);

    console.log("Test Results:", { resendSuccess, telegramSuccess });

    return NextResponse.json({
      success: true,
      message: "Integrasi diuji secara langsung!",
      results: {
        resend_email_sent: resendSuccess,
        telegram_bot_sent: telegramSuccess
      },
      credentials_check: {
        resend_key_exists: !!process.env.RESEND_API_KEY,
        telegram_token_exists: !!process.env.TELEGRAM_BOT_TOKEN,
        telegram_chat_id_exists: !!process.env.TELEGRAM_CHAT_ID
      }
    });
  } catch (err: any) {
    console.error("Error in debug-notif API:", err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
