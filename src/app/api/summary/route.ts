import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
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
