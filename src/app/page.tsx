import { fetchAllNews, getRelativeTime, type NewsItem } from "@/lib/feeds";

// Revalidate every 5 minutes
export const revalidate = 300;

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#001489] dark:hover:border-[#bba14f] transition-colors group"
    >
      <h2 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#001489] dark:group-hover:text-[#bba14f] transition-colors leading-snug">
        {item.title}
      </h2>
      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="font-medium text-[#001489] dark:text-[#bba14f]">
          {item.source}
        </span>
        <span>·</span>
        <time dateTime={item.pubDate.toISOString()}>
          {getRelativeTime(item.pubDate)}
        </time>
      </div>
      {item.description && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
          {item.description}
        </p>
      )}
    </a>
  );
}

export default async function Home() {
  const news = await fetchAllNews();
  const lastUpdated = new Date();

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
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-4 text-sm text-slate-500 dark:text-slate-400">
          <span>{news.length} articles</span>
          <span>
            Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Articles */}
        <div className="space-y-3">
          {news.length > 0 ? (
            news.map((item, index) => (
              <NewsCard key={`${item.link}-${index}`} item={item} />
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>No news available right now. Check back soon!</p>
            </div>
          )}
        </div>
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
