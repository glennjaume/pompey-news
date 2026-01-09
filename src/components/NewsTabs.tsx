"use client";

import { useState } from "react";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  sourceUrl: string;
  pubDate: string; // Serialized date
  description?: string;
  category: string;
  thumbnail?: string;
}

interface NewsTabsProps {
  newsItems: NewsItem[];
  officialItems: NewsItem[];
  socialItems: NewsItem[];
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
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

function NewsCard({ item }: { item: NewsItem }) {
  const isVideo = item.category === "official" && item.source.includes("YouTube");
  const isSocial = item.category === "social";

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#001489] dark:hover:border-[#bba14f] transition-colors group"
    >
      {isVideo && item.thumbnail && (
        <div className="mb-3 rounded-md overflow-hidden aspect-video bg-slate-100 dark:bg-slate-700">
          <img
            src={item.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {isSocial ? (
        // Social posts: show full content as the "title" is usually the post text
        <p className="text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
          {item.title}
        </p>
      ) : (
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#001489] dark:group-hover:text-[#bba14f] transition-colors leading-snug">
          {item.title}
        </h2>
      )}
      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="font-medium text-[#001489] dark:text-[#bba14f]">
          {item.source}
        </span>
        <span>·</span>
        <time dateTime={item.pubDate}>{getRelativeTime(item.pubDate)}</time>
      </div>
      {item.description && !isVideo && !isSocial && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
          {item.description}
        </p>
      )}
    </a>
  );
}

export function NewsTabs({ newsItems, officialItems, socialItems }: NewsTabsProps) {
  const [activeTab, setActiveTab] = useState<"news" | "official" | "social">("news");

  const tabs = [
    { id: "news" as const, label: "News", count: newsItems.length },
    { id: "official" as const, label: "Official", count: officialItems.length },
    { id: "social" as const, label: "Social", count: socialItems.length },
  ];

  const getItems = () => {
    switch (activeTab) {
      case "news":
        return newsItems;
      case "official":
        return officialItems;
      case "social":
        return socialItems;
    }
  };

  const items = getItems();

  const emptyMessage = {
    news: "No news articles available right now.",
    official: "No official content available right now.",
    social: "No social posts available right now.",
  };

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#001489] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                activeTab === tab.id
                  ? "bg-white/20"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <NewsCard key={`${item.link}-${index}`} item={item} />
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p>{emptyMessage[activeTab]}</p>
          </div>
        )}
      </div>
    </div>
  );
}
