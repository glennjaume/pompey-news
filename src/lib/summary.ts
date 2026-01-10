import Anthropic from "@anthropic-ai/sdk";

interface StoryCluster {
  topic: string;
  indices: number[];
}

export interface SummaryData {
  summary: string | null;
  clusters: StoryCluster[];
  generatedAt: string;
}

function isTransferWindow(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  // January (0) or June-August (5-7) are transfer windows
  return month === 0 || (month >= 5 && month <= 7);
}

export async function generateSummary(headlines: string[]): Promise<SummaryData> {
  const generatedAt = new Date().toISOString();

  if (!process.env.ANTHROPIC_API_KEY) {
    return { summary: null, clusters: [], generatedAt };
  }

  if (!headlines || headlines.length === 0) {
    return { summary: null, clusters: [], generatedAt };
  }

  try {
    const anthropic = new Anthropic();
    const headlineText = headlines
      .slice(0, 15)
      .map((h: string, i: number) => `${i + 1}. ${h}`)
      .join("\n");

    const transferFocus = isTransferWindow()
      ? `\n\nIMPORTANT: It's transfer window time! Pay special attention to any transfer news - signings, rumors, departures. For any player mentioned in transfer context, include their name and position abbreviation (GK, CB, RB, LB, CDM, CM, CAM, RW, LW, ST, CF).`
      : "";

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `You are a Portsmouth FC fan analyzing the latest Pompey news. Based on these headlines:

${headlineText}

Provide a JSON response with:
1. "summary": A 2-3 sentence summary of the key Pompey news right now. Casual but informed tone.${transferFocus}
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
      return { summary: null, clusters: [], generatedAt };
    }

    try {
      const parsed = JSON.parse(rawText);
      return {
        summary: parsed.summary || null,
        clusters: parsed.clusters || [],
        generatedAt,
      };
    } catch {
      // If JSON parsing fails, treat the whole response as a summary
      return { summary: rawText, clusters: [], generatedAt };
    }
  } catch (error) {
    console.error("Summary generation failed:", error);
    return { summary: null, clusters: [], generatedAt };
  }
}
