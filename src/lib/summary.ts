import Anthropic from "@anthropic-ai/sdk";
import type { NewsItem } from "./feeds";

const anthropic = new Anthropic();

export async function generateNewsSummary(
  news: NewsItem[]
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  const topNews = news.slice(0, 10);

  if (topNews.length === 0) {
    return null;
  }

  const headlines = topNews
    .map(
      (item, i) =>
        `${i + 1}. "${item.title}" (${item.source})`
    )
    .join("\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a Portsmouth FC fan summarizing the latest Pompey news. Based on these recent headlines, write a brief 2-3 sentence summary of what's happening with Portsmouth FC right now. Be concise and focus on the most important stories. Use a casual but informed tone.

Headlines:
${headlines}

Summary:`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    return textBlock ? textBlock.text : null;
  } catch (error) {
    console.error("Failed to generate summary:", error);
    return null;
  }
}
