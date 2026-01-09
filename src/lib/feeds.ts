import Parser from "rss-parser";

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  sourceUrl: string;
  pubDate: Date;
  description?: string;
}

interface FeedSource {
  name: string;
  url: string;
  rssUrl: string;
}

// Portsmouth FC related RSS feeds
// Add/remove sources here to customize your feed
const FEED_SOURCES: FeedSource[] = [
  {
    name: "BBC Sport",
    url: "https://www.bbc.co.uk/sport/football/teams/portsmouth",
    rssUrl: "https://feeds.bbci.co.uk/sport/football/teams/portsmouth/rss.xml",
  },
  {
    name: "The News Portsmouth",
    url: "https://www.portsmouth.co.uk",
    rssUrl: "https://www.portsmouth.co.uk/sport/football/portsmouth-fc/rss",
  },
  {
    name: "Football League World",
    url: "https://footballleagueworld.co.uk",
    rssUrl: "https://footballleagueworld.co.uk/category/portsmouth/feed/",
  },
  {
    name: "The72",
    url: "https://www.the72.co.uk",
    rssUrl: "https://www.the72.co.uk/tag/portsmouth/feed/",
  },
];

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "PompeyNews/1.0",
  },
});

async function fetchFeed(source: FeedSource): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.rssUrl);
    return feed.items.map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "#",
      source: source.name,
      sourceUrl: source.url,
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      description: item.contentSnippet || item.content || undefined,
    }));
  } catch (error) {
    console.error(`Failed to fetch ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map((source) => fetchFeed(source))
  );

  const allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by date, newest first
  allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  // Remove duplicates based on similar titles
  const seen = new Set<string>();
  return allItems.filter((item) => {
    const normalized = item.title.toLowerCase().slice(0, 50);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
