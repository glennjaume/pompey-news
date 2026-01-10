export interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string; // ISO string
  competition: string;
  venue: "home" | "away";
}

const PORTSMOUTH_TEAM_ID = 389; // Portsmouth FC in football-data.org
const CHAMPIONSHIP_ID = 2016; // EFL Championship

export async function fetchFixtures(): Promise<Fixture[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    // Return placeholder fixtures if no API key
    return getPlaceholderFixtures();
  }

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/teams/${PORTSMOUTH_TEAM_ID}/matches?status=SCHEDULED&limit=5`,
      {
        headers: {
          "X-Auth-Token": apiKey,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.error("Football API error:", response.status);
      return getPlaceholderFixtures();
    }

    const data = await response.json();

    return data.matches.slice(0, 3).map((match: {
      id: number;
      homeTeam: { name: string; id: number };
      awayTeam: { name: string; id: number };
      utcDate: string;
      competition: { name: string };
    }) => ({
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      date: match.utcDate,
      competition: match.competition.name,
      venue: match.homeTeam.id === PORTSMOUTH_TEAM_ID ? "home" : "away",
    }));
  } catch (error) {
    console.error("Failed to fetch fixtures:", error);
    return getPlaceholderFixtures();
  }
}

function getPlaceholderFixtures(): Fixture[] {
  // Placeholder until API key is added
  return [];
}

export function formatFixtureTime(
  isoDate: string,
  timezone: string
): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatFixtureDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
