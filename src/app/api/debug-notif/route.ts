import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Starting live integration test for Resend and Telegram...");

    const resendKey = process.env.RESEND_API_KEY || "";
    const tgToken = process.env.TELEGRAM_BOT_TOKEN || "";
    const tgChatId = process.env.TELEGRAM_CHAT_ID || "";

    // 1. Test Resend directly with raw fetch
    let resendResult: any = { sent: false };
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "MerbabuStay <onboarding@resend.dev>",
          to: ["saidqony@gmail.com"],
          subject: "[DEBUG TEST] MerbabuStay Notification Test",
          html: "<p>This is a live debug test from MerbabuStay. If you see this, Resend is working!</p>",
        }),
      });
      const resendData = await resendRes.json();
      resendResult = { sent: resendRes.ok, status: resendRes.status, response: resendData };
    } catch (e: any) {
      resendResult = { sent: false, fetch_error: e.message };
    }

    // 2. Test Telegram directly with raw fetch
    let telegramResult: any = { sent: false };
    try {
      const tgRes = await fetch(
        `https://api.telegram.org/bot${tgToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: "DEBUG TEST - MerbabuStay notification system is working correctly!",
          }),
        }
      );
      const tgData = await tgRes.json();
      telegramResult = { sent: tgRes.ok, status: tgRes.status, response: tgData };
    } catch (e: any) {
      telegramResult = { sent: false, fetch_error: e.message };
    }

    return NextResponse.json({
      success: true,
      resend: resendResult,
      telegram: telegramResult,
      env: {
        resend_key_prefix: resendKey ? resendKey.substring(0, 10) + "..." : "MISSING",
        telegram_token_prefix: tgToken ? tgToken.substring(0, 10) + "..." : "MISSING",
        telegram_chat_id: tgChatId || "MISSING",
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
