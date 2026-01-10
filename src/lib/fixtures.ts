export interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string;
  awayCrest: string;
  date: string; // ISO string
  competition: string;
  venue: "home" | "away";
  opponentPosition?: number;
  opponentForm?: ("W" | "D" | "L")[];
}

export interface Result {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string;
  awayCrest: string;
  homeScore: number;
  awayScore: number;
  date: string;
  result: "W" | "D" | "L"; // From Portsmouth's perspective
  venue: "home" | "away";
}

export interface StandingsEntry {
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

const PORTSMOUTH_TEAM_ID = 325; // Portsmouth FC in football-data.org

interface ApiMatch {
  id: number;
  homeTeam: { name: string; id: number; crest: string };
  awayTeam: { name: string; id: number; crest: string };
  utcDate: string;
  competition: { name: string };
  score?: {
    fullTime: { home: number | null; away: number | null };
  };
}

interface ApiStandingsTeam {
  position: number;
  team: { id: number; name: string; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// Fetch league standings
export async function fetchStandings(): Promise<StandingsEntry[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    // Fetch standings and finished matches in parallel
    const [standingsRes, matchesRes] = await Promise.all([
      fetch(`https://api.football-data.org/v4/competitions/ELC/standings`, {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.football-data.org/v4/competitions/ELC/matches?status=FINISHED`, {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 3600 },
      }),
    ]);

    if (!standingsRes.ok || !matchesRes.ok) {
      return [];
    }

    const [standingsData, matchesData] = await Promise.all([
      standingsRes.json(),
      matchesRes.json(),
    ]);

    const table = standingsData.standings[0].table as ApiStandingsTeam[];
    const allMatches = matchesData.matches as ApiMatch[];

    // Calculate form for each team (last 5 results)
    const teamForms = new Map<number, ("W" | "D" | "L")[]>();

    for (const team of table) {
      const teamMatches = allMatches
        .filter((m: ApiMatch) => m.homeTeam.id === team.team.id || m.awayTeam.id === team.team.id)
        .reverse() // Most recent first
        .slice(0, 5);

      const form: ("W" | "D" | "L")[] = teamMatches.map((m: ApiMatch) => {
        const isHome = m.homeTeam.id === team.team.id;
        const homeScore = m.score?.fullTime.home ?? 0;
        const awayScore = m.score?.fullTime.away ?? 0;

        if (homeScore === awayScore) return "D";
        if (isHome) return homeScore > awayScore ? "W" : "L";
        return awayScore > homeScore ? "W" : "L";
      });

      teamForms.set(team.team.id, form);
    }

    return table.map((team: ApiStandingsTeam) => ({
      position: team.position,
      teamId: team.team.id,
      teamName: team.team.name,
      teamCrest: team.team.crest,
      played: team.playedGames,
      won: team.won,
      drawn: team.draw,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalDifference,
      points: team.points,
      form: teamForms.get(team.team.id) || [],
    }));
  } catch (error) {
    console.error("Failed to fetch standings:", error);
    return [];
  }
}

// Fetch Portsmouth's recent results
export async function fetchResults(): Promise<Result[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/ELC/matches?status=FINISHED`,
      {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Filter for Portsmouth matches and get most recent 5
    const portsmouthMatches = (data.matches as ApiMatch[])
      .filter((m) => m.homeTeam.id === PORTSMOUTH_TEAM_ID || m.awayTeam.id === PORTSMOUTH_TEAM_ID)
      .reverse() // Most recent first
      .slice(0, 5);

    return portsmouthMatches.map((match) => {
      const isHome = match.homeTeam.id === PORTSMOUTH_TEAM_ID;
      const homeScore = match.score?.fullTime.home ?? 0;
      const awayScore = match.score?.fullTime.away ?? 0;

      let result: "W" | "D" | "L";
      if (homeScore === awayScore) {
        result = "D";
      } else if (isHome) {
        result = homeScore > awayScore ? "W" : "L";
      } else {
        result = awayScore > homeScore ? "W" : "L";
      }

      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeCrest: match.homeTeam.crest,
        awayCrest: match.awayTeam.crest,
        homeScore,
        awayScore,
        date: match.utcDate,
        result,
        venue: isHome ? "home" : "away",
      };
    });
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return [];
  }
}

// Fetch upcoming fixtures with opponent info
export async function fetchFixtures(): Promise<Fixture[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    // Fetch scheduled matches and standings in parallel
    const [matchesRes, standings] = await Promise.all([
      fetch(`https://api.football-data.org/v4/competitions/ELC/matches?status=SCHEDULED`, {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 3600 },
      }),
      fetchStandings(),
    ]);

    if (!matchesRes.ok) {
      return [];
    }

    const matchesData = await matchesRes.json();

    // Create lookup for standings
    const standingsMap = new Map(standings.map((s) => [s.teamId, s]));

    // Filter for Portsmouth matches
    const portsmouthMatches = (matchesData.matches as ApiMatch[])
      .filter((m) => m.homeTeam.id === PORTSMOUTH_TEAM_ID || m.awayTeam.id === PORTSMOUTH_TEAM_ID)
      .slice(0, 3);

    return portsmouthMatches.map((match) => {
      const isHome = match.homeTeam.id === PORTSMOUTH_TEAM_ID;
      const opponentId = isHome ? match.awayTeam.id : match.homeTeam.id;
      const opponentStanding = standingsMap.get(opponentId);

      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeCrest: match.homeTeam.crest,
        awayCrest: match.awayTeam.crest,
        date: match.utcDate,
        competition: match.competition.name,
        venue: isHome ? "home" : "away",
        opponentPosition: opponentStanding?.position,
        opponentForm: opponentStanding?.form,
      };
    });
  } catch (error) {
    console.error("Failed to fetch fixtures:", error);
    return [];
  }
}

export function formatFixtureTime(isoDate: string, timezone: string): string {
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

export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export interface Scorer {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  teamCrest: string;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

interface ApiScorer {
  player: { id: number; name: string };
  team: { id: number; name: string; crest: string };
  goals: number;
  assists: number | null;
  penalties: number | null;
}

// Fetch top scorers for the Championship
export async function fetchScorers(): Promise<Scorer[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/ELC/scorers?limit=50`,
      {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.scorers as ApiScorer[]).map((scorer) => ({
      playerId: scorer.player.id,
      playerName: scorer.player.name,
      teamId: scorer.team.id,
      teamName: scorer.team.name,
      teamCrest: scorer.team.crest,
      goals: scorer.goals,
      assists: scorer.assists,
      penalties: scorer.penalties,
    }));
  } catch (error) {
    console.error("Failed to fetch scorers:", error);
    return [];
  }
}
