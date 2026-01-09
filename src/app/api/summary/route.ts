import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Simple in-memory rate limiting
// Note: This resets on serverless cold starts, but provides basic protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const dailyUsage = { count: 0, resetDate: new Date().toDateString() };

const RATE_LIMIT_PER_IP = 10; // requests per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const DAILY_LIMIT = 100; // max requests per day globally

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const today = new Date().toDateString();

  // Reset daily counter if it's a new day
  if (dailyUsage.resetDate !== today) {
    dailyUsage.count = 0;
    dailyUsage.resetDate = today;
  }

  // Check daily limit
  if (dailyUsage.count >= DAILY_LIMIT) {
    return { allowed: false, message: "Daily limit reached. Try again tomorrow." };
  }

  // Check per-IP limit
  const ipData = rateLimitMap.get(ip);
  if (ipData) {
    if (now < ipData.resetTime) {
      if (ipData.count >= RATE_LIMIT_PER_IP) {
        const minutesLeft = Math.ceil((ipData.resetTime - now) / 60000);
        return { allowed: false, message: `Rate limit exceeded. Try again in ${minutesLeft} minutes.` };
      }
      ipData.count++;
    } else {
      // Reset window
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }

  dailyUsage.count++;
  return { allowed: true };
}

function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  // Check rate limit first
  const ip = getClientIP(request);
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: rateCheck.message },
      { status: 429 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { headlines } = await request.json();

    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      return NextResponse.json(
        { error: "No headlines provided" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic();
    const headlineText = headlines
      .slice(0, 15)
      .map((h: string, i: number) => `${i + 1}. ${h}`)
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `You are a Portsmouth FC fan analyzing the latest Pompey news. Based on these headlines:

${headlineText}

Provide a JSON response with:
1. "summary": A 2-3 sentence summary of the key Pompey news right now. Casual but informed tone.
2. "clusters": An array of story clusters where multiple headlines cover the same topic (e.g., same transfer rumor, same match). Each cluster has "topic" (brief label) and "indices" (array of headline numbers that overlap). Only include clusters with 2+ headlines. Empty array if no overlaps.

Example response format:
{"summary": "Your summary here...", "clusters": [{"topic": "Smith transfer rumor", "indices": [1, 4, 7]}, {"topic": "Derby result", "indices": [2, 5]}]}

Respond with only valid JSON, no other text.`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const rawText = textBlock ? textBlock.text : null;

    if (!rawText) {
      return NextResponse.json({ summary: null, clusters: [] });
    }

    try {
      const parsed = JSON.parse(rawText);
      return NextResponse.json({
        summary: parsed.summary || null,
        clusters: parsed.clusters || [],
      });
    } catch {
      // If JSON parsing fails, treat the whole response as a summary
      return NextResponse.json({ summary: rawText, clusters: [] });
    }
  } catch (error) {
    console.error("Summary generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
