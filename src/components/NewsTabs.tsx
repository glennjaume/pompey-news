"use client";

import { useState } from "react";
import Image from "next/image";

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

interface StandingsEntry {
  position: number;
  teamId: number;
  teamName: string;
  teamCrest: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

interface Scorer {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  teamCrest: string;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

interface NewsTabsProps {
  newsItems: NewsItem[];
  officialItems: NewsItem[];
  socialItems: NewsItem[];
  standings: StandingsEntry[];
  scorers: Scorer[];
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

function LeagueTable({ standings }: { standings: StandingsEntry[] }) {
  const PORTSMOUTH_TEAM_ID = 325;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 w-8">#</th>
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400">Team</th>
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-10">P</th>
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-10 hidden sm:table-cell">W</th>
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-10 hidden sm:table-cell">D</th>
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-10 hidden sm:table-cell">L</th>
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-12 hidden sm:table-cell">GD</th>
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-10">Pts</th>
            <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-20">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => {
            const isPompey = team.teamId === PORTSMOUTH_TEAM_ID;
            const isPromotion = team.position <= 2;
            const isPlayoff = team.position >= 3 && team.position <= 6;
            const isRelegation = team.position >= standings.length - 2;

            let rowClass = "";
            if (isPompey) {
              rowClass = "bg-[#001489]/10 dark:bg-[#bba14f]/10";
            } else if (isPromotion) {
              rowClass = "bg-green-50 dark:bg-green-900/20";
            } else if (isPlayoff) {
              rowClass = "bg-blue-50 dark:bg-blue-900/20";
            } else if (isRelegation) {
              rowClass = "bg-red-50 dark:bg-red-900/20";
            }

            return (
              <tr
                key={team.teamId}
                className={`border-b border-slate-100 dark:border-slate-800 ${rowClass}`}
              >
                <td className="py-2 px-2 font-medium text-slate-900 dark:text-slate-100">
                  {team.position}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src={team.teamCrest}
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                      unoptimized
                    />
                    <span className={`font-medium truncate ${isPompey ? "text-[#001489] dark:text-[#bba14f]" : "text-slate-900 dark:text-slate-100"}`}>
                      {formatTeamName(team.teamName)}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300">{team.played}</td>
                <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300 hidden sm:table-cell">{team.won}</td>
                <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300 hidden sm:table-cell">{team.drawn}</td>
                <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300 hidden sm:table-cell">{team.lost}</td>
                <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </td>
                <td className="py-2 px-2 text-center font-bold text-slate-900 dark:text-slate-100">{team.points}</td>
                <td className="py-2 px-2">
                  <div className="flex gap-0.5 justify-center">
                    {team.form.slice(0, 5).map((result, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          result === "W" ? "bg-green-500" : result === "D" ? "bg-amber-500" : "bg-red-500"
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-500/30"></span>
          <span>Promotion</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500/30"></span>
          <span>Playoffs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500/30"></span>
          <span>Relegation</span>
        </div>
      </div>
    </div>
  );
}

function formatTeamName(name: string): string {
  const shortNames: Record<string, string> = {
    "Portsmouth FC": "Portsmouth",
    "Sheffield United FC": "Sheff Utd",
    "Sheffield Wednesday FC": "Sheff Wed",
    "West Bromwich Albion FC": "West Brom",
    "Queens Park Rangers FC": "QPR",
    "Nottingham Forest FC": "Nott'm Forest",
    "Birmingham City FC": "Birmingham",
    "Middlesbrough FC": "Middlesbrough",
    "Sunderland AFC": "Sunderland",
    "Leeds United FC": "Leeds",
    "Norwich City FC": "Norwich",
    "Coventry City FC": "Coventry",
    "Bristol City FC": "Bristol City",
    "Stoke City FC": "Stoke",
    "Hull City FC": "Hull",
    "Watford FC": "Watford",
    "Millwall FC": "Millwall",
    "Blackburn Rovers FC": "Blackburn",
    "Preston North End FC": "Preston",
    "Swansea City AFC": "Swansea",
    "Cardiff City FC": "Cardiff",
    "Plymouth Argyle FC": "Plymouth",
    "Oxford United FC": "Oxford",
    "Derby County FC": "Derby",
    "Luton Town FC": "Luton",
    "Burnley FC": "Burnley",
    "Charlton Athletic FC": "Charlton",
    "Southampton FC": "Southampton",
    "Ipswich Town FC": "Ipswich",
  };

  return shortNames[name] || name.replace(" FC", "").replace(" AFC", "");
}

function ScorersTable({ scorers, pompeyOnly }: { scorers: Scorer[]; pompeyOnly: boolean }) {
  const PORTSMOUTH_TEAM_ID = 325;

  const filteredScorers = pompeyOnly
    ? scorers.filter(s => s.teamId === PORTSMOUTH_TEAM_ID)
    : scorers;

  // Create separate lists for top scorers and top assisters
  const topScorers = [...filteredScorers]
    .filter(s => s.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 20);

  const topAssisters = [...filteredScorers]
    .filter(s => (s.assists ?? 0) > 0)
    .sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0))
    .slice(0, 20);

  if (filteredScorers.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>{pompeyOnly ? "No Pompey players in the stats yet." : "No scorer data available."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Scorers */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
          Top Scorers
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 w-8">#</th>
                <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400">Player</th>
                <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400">Team</th>
                <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-12">Goals</th>
                <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-12 hidden sm:table-cell">Pen</th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((scorer, index) => {
                const isPompey = scorer.teamId === PORTSMOUTH_TEAM_ID;
                return (
                  <tr
                    key={`scorer-${scorer.playerId}`}
                    className={`border-b border-slate-100 dark:border-slate-800 ${isPompey ? "bg-[#001489]/10 dark:bg-[#bba14f]/10" : ""}`}
                  >
                    <td className="py-2 px-2 font-medium text-slate-900 dark:text-slate-100">
                      {index + 1}
                    </td>
                    <td className={`py-2 px-2 font-medium ${isPompey ? "text-[#001489] dark:text-[#bba14f]" : "text-slate-900 dark:text-slate-100"}`}>
                      {scorer.playerName}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src={scorer.teamCrest}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain"
                          unoptimized
                        />
                        <span className="text-slate-600 dark:text-slate-300 truncate hidden sm:inline">
                          {formatTeamName(scorer.teamName)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-900 dark:text-slate-100">
                      {scorer.goals}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                      {scorer.penalties ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Assisters */}
      {topAssisters.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
            Top Assisters
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                  <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 w-8">#</th>
                  <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400">Player</th>
                  <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400">Team</th>
                  <th className="py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 text-center w-12">Assists</th>
                </tr>
              </thead>
              <tbody>
                {topAssisters.map((scorer, index) => {
                  const isPompey = scorer.teamId === PORTSMOUTH_TEAM_ID;
                  return (
                    <tr
                      key={`assister-${scorer.playerId}`}
                      className={`border-b border-slate-100 dark:border-slate-800 ${isPompey ? "bg-[#001489]/10 dark:bg-[#bba14f]/10" : ""}`}
                    >
                      <td className="py-2 px-2 font-medium text-slate-900 dark:text-slate-100">
                        {index + 1}
                      </td>
                      <td className={`py-2 px-2 font-medium ${isPompey ? "text-[#001489] dark:text-[#bba14f]" : "text-slate-900 dark:text-slate-100"}`}>
                        {scorer.playerName}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <Image
                            src={scorer.teamCrest}
                            alt=""
                            width={20}
                            height={20}
                            className="w-5 h-5 object-contain"
                            unoptimized
                          />
                          <span className="text-slate-600 dark:text-slate-300 truncate hidden sm:inline">
                            {formatTeamName(scorer.teamName)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-slate-900 dark:text-slate-100">
                        {scorer.assists}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function NewsTabs({ newsItems, officialItems, socialItems, standings, scorers }: NewsTabsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "news" | "official" | "social" | "table" | "stats">("all");
  const [pompeyOnly, setPompeyOnly] = useState(false);

  // Combine and sort all items by date for the "All" tab
  const allItems = [...newsItems, ...officialItems, ...socialItems]
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const tabs = [
    { id: "all" as const, label: "All", count: allItems.length },
    { id: "news" as const, label: "News", count: newsItems.length },
    { id: "official" as const, label: "Official", count: officialItems.length },
    { id: "social" as const, label: "Social", count: socialItems.length },
    { id: "table" as const, label: "Table", count: standings.length },
    { id: "stats" as const, label: "Stats", count: scorers.length },
  ];

  const getItems = () => {
    switch (activeTab) {
      case "all":
        return allItems;
      case "news":
        return newsItems;
      case "official":
        return officialItems;
      case "social":
        return socialItems;
      case "table":
      case "stats":
        return []; // Not used for table/stats
    }
  };

  const items = getItems();

  const emptyMessage = {
    all: "No content available right now.",
    news: "No news articles available right now.",
    official: "No official content available right now.",
    social: "No social posts available right now.",
    table: "No standings available right now.",
    stats: "No scorer data available right now.",
  };

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
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
            {tab.id !== "table" && tab.id !== "stats" && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                  activeTab === tab.id
                    ? "bg-white/20"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "table" ? (
        standings.length > 0 ? (
          <LeagueTable standings={standings} />
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p>{emptyMessage.table}</p>
          </div>
        )
      ) : activeTab === "stats" ? (
        <>
          {/* Pompey Only Filter */}
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => setPompeyOnly(!pompeyOnly)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                pompeyOnly
                  ? "bg-[#001489] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {pompeyOnly ? "Showing Pompey Only" : "Show Pompey Only"}
            </button>
          </div>
          {scorers.length > 0 ? (
            <ScorersTable scorers={scorers} pompeyOnly={pompeyOnly} />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>{emptyMessage.stats}</p>
            </div>
          )}
        </>
      ) : (
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
      )}
    </div>
  );
}
