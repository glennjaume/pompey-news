import {
  fetchAllNews,
  getNewsByCategory,
} from "@/lib/feeds";
import { fetchFixtures, fetchResults, fetchStandings, fetchScorers } from "@/lib/fixtures";
import { generateSummary } from "@/lib/summary";
import { AISummary } from "@/components/AISummary";
import { NewsTabs } from "@/components/NewsTabs";
import { FixturesAndResults } from "@/components/FixturesAndResults";

// Revalidate every hour for AI summary
export const revalidate = 3600;

// Serialize news items for client components (Date -> string)
function serializeNews(items: Awaited<ReturnType<typeof fetchAllNews>>) {
  return items.map((item) => ({
    ...item,
    pubDate: item.pubDate.toISOString(),
  }));
}

export default async function Home() {
  const [allNews, fixtures, results, standings, scorers] = await Promise.all([
    fetchAllNews(),
    fetchFixtures(),
    fetchResults(),
    fetchStandings(),
    fetchScorers(),
  ]);
  const newsItems = serializeNews(getNewsByCategory(allNews, "news"));
  const officialItems = serializeNews(getNewsByCategory(allNews, "official"));
  const socialItems = serializeNews(getNewsByCategory(allNews, "social"));
  const lastUpdated = new Date();

  const headlines = allNews
    .filter((item) => item.category === "news")
    .slice(0, 15)
    .map((item) => `"${item.title}" (${item.source})`);

  // Generate AI summary server-side (cached for 1 hour)
  const summaryData = await generateSummary(headlines);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-[#001489] text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-[#bba14f]">⚓</span>
            Pompey News
          </h1>
          <p className="mt-1 text-blue-200 text-sm">
            Portsmouth FC news from across the web
          </p>
        </div>
      </header>

      {/* News Feed */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Fixtures and Results */}
        <FixturesAndResults fixtures={fixtures} results={results} />

        {/* AI Summary */}
        <AISummary summaryData={summaryData} />

        {/* Status Bar */}
        <div className="flex items-center justify-between mb-4 text-sm text-slate-500 dark:text-slate-400">
          <span>{allNews.length} items</span>
          <span>
            Updated{" "}
            {lastUpdated.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Tabbed Content */}
        <NewsTabs newsItems={newsItems} officialItems={officialItems} socialItems={socialItems} standings={standings} scorers={scorers} />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-8 py-6 px-4">
        <div className="max-w-3xl mx-auto text-center text-sm text-slate-500">
          <p>
            News aggregated from official sources.
            <br className="sm:hidden" />
            <span className="sm:ml-1">Play Up Pompey!</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
