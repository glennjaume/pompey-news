import { type Fixture, formatFixtureTime, formatFixtureDate } from "@/lib/fixtures";

interface FixturesProps {
  fixtures: Fixture[];
}

export function Fixtures({ fixtures }: FixturesProps) {
  if (fixtures.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
        Upcoming Fixtures
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {fixtures.map((fixture) => (
          <FixtureCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </div>
  );
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const opponent = fixture.venue === "home" ? fixture.awayTeam : fixture.homeTeam;
  const venueLabel = fixture.venue === "home" ? "vs" : "@";

  // Format times for both timezones
  const ukTime = formatFixtureTime(fixture.date, "Europe/London");
  const pstTime = formatFixtureTime(fixture.date, "America/Los_Angeles");
  const dateStr = formatFixtureDate(fixture.date);

  return (
    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
        {dateStr}
      </div>
      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
        <span className="text-[#001489] dark:text-[#bba14f]">Pompey</span>
        {" "}{venueLabel}{" "}
        <span>{formatTeamName(opponent)}</span>
      </div>
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
      <div className="mt-1 text-xs text-slate-400">
        {fixture.competition}
      </div>
    </div>
  );
}

// Shorten long team names
function formatTeamName(name: string): string {
  const shortNames: Record<string, string> = {
    "Portsmouth FC": "Portsmouth",
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
  };

  return shortNames[name] || name.replace(" FC", "").replace(" AFC", "");
}
