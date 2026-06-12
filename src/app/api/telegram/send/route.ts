import { NextResponse } from "next/server";
import { redis } from "../../../../lib/redis";
import { AppStateData } from "../../../../lib/types";

export async function POST(request: Request) {
  try {
    const { syncCode, videoUrl } = await request.json();

    if (!syncCode || !videoUrl) {
      return NextResponse.json({ error: "Missing syncCode or videoUrl" }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
    }

    // 1. Fetch household configuration to check custom Bot settings
    const key = `ulam_state_${syncCode}`;
    const state = await redis.get<AppStateData>(key);

    const botToken = state?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = state?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ 
        error: "Configuration missing", 
        details: "Telegram Bot Token or Group Chat ID is not configured. Please fill them out in the Bot Settings drawer." 
      }, { status: 400 });
    }

    // 2. Dispatch the link to Telegram sendMessage API
    const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🎬 *New Recipe Request!*\n\nForwarded from *ULAM v2*:\n🔗 ${videoUrl}\n\n_Please parse this recipe (ingredients and instructions) and sync it back!_`,
        parse_mode: "Markdown",
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("Telegram API Error:", result);
      return NextResponse.json({ 
        error: "Telegram API reject", 
        details: result.description || "Telegram Bot API error." 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Link successfully forwarded to your Telegram bot group!" });
  } catch (err: any) {
    console.error("Failed to forward link to Telegram:", err);
    return NextResponse.json({ error: "Server error", details: err?.message }, { status: 500 });
  }
}
