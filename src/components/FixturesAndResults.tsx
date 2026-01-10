"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { type Fixture, type Result, formatFixtureTime, formatFixtureDate } from "@/lib/fixtures";

interface FixturesAndResultsProps {
  fixtures: Fixture[];
  results: Result[];
}

export function FixturesAndResults({ fixtures, results }: FixturesAndResultsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstFixtureRef = useRef<HTMLDivElement>(null);

  // Scroll to first fixture on mount (results are off-screen to the left)
  useEffect(() => {
    if (firstFixtureRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const fixture = firstFixtureRef.current;
      // Scroll so the first fixture is at the left edge with a small padding
      container.scrollLeft = fixture.offsetLeft - 16;
    }
  }, []);

  if (fixtures.length === 0 && results.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
        Upcoming League Fixtures
      </h2>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {/* Recent Results - compact single card */}
        {results.length > 0 && (
          <RecentResultsCard results={results} />
        )}
        {/* Upcoming Fixtures */}
        {fixtures.map((fixture, index) => (
          <div key={fixture.id} ref={index === 0 ? firstFixtureRef : undefined}>
            <FixtureCard fixture={fixture} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentResultsCard({ results }: { results: Result[] }) {
  // Results come in most recent first, show them in that order (recent on right)
  return (
    <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 min-w-[140px] flex-shrink-0">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
        Recent Form
      </div>
      <div className="flex flex-col gap-1.5">
        {results.slice(0, 5).reverse().map((result) => (
          <div key={result.id} className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                result.result === "W" ? "bg-green-500" : result.result === "D" ? "bg-amber-500" : "bg-red-500"
              }`}
            >
              {result.result}
            </span>
            <Image
              src={result.venue === "home" ? result.awayCrest : result.homeCrest}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 object-contain flex-shrink-0"
              unoptimized
            />
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
              {result.homeScore}-{result.awayScore}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const ukTime = formatFixtureTime(fixture.date, "Europe/London");
  const pstTime = formatFixtureTime(fixture.date, "America/Los_Angeles");
  const dateStr = formatFixtureDate(fixture.date);

  // Get opponent info
  const isHome = fixture.venue === "home";
  const opponentPosition = fixture.opponentPosition;
  const opponentForm = fixture.opponentForm || [];

  return (
    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 min-w-[200px] flex-shrink-0">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
        {dateStr}
      </div>
      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
        <Image
          src={fixture.homeCrest}
          alt=""
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
          unoptimized
        />
        <span className={isHome ? "text-[#001489] dark:text-[#bba14f]" : ""}>
          {formatTeamName(fixture.homeTeam)}
        </span>
        <span className="text-slate-400 mx-0.5">vs</span>
        <Image
          src={fixture.awayCrest}
          alt=""
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
          unoptimized
        />
        <span className={!isHome ? "text-[#001489] dark:text-[#bba14f]" : ""}>
          {formatTeamName(fixture.awayTeam)}
        </span>
      </div>

      {/* Opponent position and form */}
      {opponentPosition && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {isHome ? fixture.awayTeam.split(" ")[0] : fixture.homeTeam.split(" ")[0]}:
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {getOrdinal(opponentPosition)}
          </span>
          {opponentForm.length > 0 && (
            <div className="flex gap-0.5">
              {opponentForm.slice(0, 5).map((result, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    result === "W" ? "bg-green-500" : result === "D" ? "bg-amber-500" : "bg-red-500"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-slate-400">UK</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{ukTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400">PST</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{pstTime}</span>
        </div>
      </div>
    </div>
  );
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatTeamName(name: string): string {
  const shortNames: Record<string, string> = {
    "Portsmouth FC": "Pompey",
    "Sheffield United FC": "Sheff Utd",
    "Sheffield Wednesday FC": "Sheff Wed",
    "West Bromwich Albion FC": "West Brom",
    "Queens Park Rangers FC": "QPR",
    "Wolverhampton Wanderers FC": "Wolves",
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
