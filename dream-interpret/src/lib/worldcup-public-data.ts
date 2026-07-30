import type { WorldCupTeamContext } from "@/lib/chaos-worldcup-oracle";

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const RECENT_MATCH_LIMIT = 6;

const TEAM_ALIASES: Record<string, string> = {
  阿根廷: "ARG",
  法国: "FRA",
  巴西: "BRA",
  德国: "GER",
  西班牙: "ESP",
  葡萄牙: "POR",
  英格兰: "ENG",
  荷兰: "NED",
  意大利: "ITA",
  比利时: "BEL",
  克罗地亚: "CRO",
  乌拉圭: "URU",
  哥伦比亚: "COL",
  墨西哥: "MEX",
  美国: "USA",
  加拿大: "CAN",
  日本: "JPN",
  韩国: "KOR",
  澳大利亚: "AUS",
  摩洛哥: "MAR",
  塞内加尔: "SEN",
  瑞士: "SUI",
  丹麦: "DEN",
  奥地利: "AUT",
  挪威: "NOR",
  瑞典: "SWE",
  波兰: "POL",
  土耳其: "TUR",
  乌克兰: "UKR",
  塞尔维亚: "SRB",
  捷克: "CZE",
  苏格兰: "SCO",
  威尔士: "WAL",
  爱尔兰: "IRL",
  埃及: "EGY",
  阿尔及利亚: "ALG",
  突尼斯: "TUN",
  南非: "RSA",
  尼日利亚: "NGA",
  加纳: "GHA",
  科特迪瓦: "CIV",
  喀麦隆: "CMR",
  沙特: "KSA",
  沙特阿拉伯: "KSA",
  伊朗: "IRN",
  卡塔尔: "QAT",
  约旦: "JOR",
  新西兰: "NZL",
  厄瓜多尔: "ECU",
  巴拉圭: "PAR",
  委内瑞拉: "VEN",
  智利: "CHI",
  秘鲁: "PER",
  哥斯达黎加: "CRC",
  巴拿马: "PAN",
  牙买加: "JAM",
  海地: "HAI",
  库拉索: "CUW",
  佛得角: "CPV",
  刚果民主共和国: "COD",
  民主刚果: "COD",
};

interface EspnTeamListResponse {
  sports?: Array<{
    leagues?: Array<{ teams?: Array<{ team?: EspnTeam }> }>;
  }>;
}

interface EspnTeam {
  id?: string;
  abbreviation?: string;
  displayName?: string;
  shortDisplayName?: string;
  location?: string;
  name?: string;
  slug?: string;
  logos?: Array<{ href?: string; rel?: string[] }>;
}

interface EspnScheduleResponse {
  events?: EspnEvent[];
}

interface EspnEvent {
  id?: string;
  date?: string;
  seasonType?: { name?: string };
  competitions?: Array<{
    venue?: { fullName?: string };
    competitors?: Array<{
      id?: string;
      winner?: boolean;
      team?: EspnTeam;
      score?: { value?: number };
    }>;
    status?: { type?: { completed?: boolean } };
  }>;
}

interface EspnRosterResponse {
  athletes?: Array<{
    status?: { type?: string; name?: string };
    injuries?: unknown[];
  }>;
}

export interface PublicTeamSnapshot {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
  recent: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  personnel: {
    rostered: number;
    available: number;
    injuries?: number;
    suspensions?: number;
  };
}

export interface WorldCupPublicDataResolution {
  homeTeam: PublicTeamSnapshot;
  awayTeam: PublicTeamSnapshot;
  homeContext: WorldCupTeamContext;
  awayContext: WorldCupTeamContext;
  matchMeta?: {
    kickoffTime?: string;
    venue?: string;
    stage?: string;
  };
  scoreForecast: {
    method: "recent_form_poisson";
    expectedGoals: { home: number; away: number };
    candidates: Array<{
      home: number;
      away: number;
      probabilityPct: number;
    }>;
  };
  fetchedAt: string;
  sources: Array<{ label: string; url: string }>;
  warnings: string[];
}

export class WorldCupTeamNotFoundError extends Error {
  constructor(team: string) {
    super(`未在本届世界杯公开名单中找到“${team}”，请换用国家队全名或英文名。`);
    this.name = "WorldCupTeamNotFoundError";
  }
}

export async function resolveWorldCupPublicData(
  homeInput: string,
  awayInput: string,
): Promise<WorldCupPublicDataResolution> {
  const teamsUrl = `${ESPN_BASE}/teams`;
  const teamList = await fetchRequiredJson<EspnTeamListResponse>(teamsUrl);
  const teams = teamList.sports?.[0]?.leagues?.[0]?.teams?.map((entry) => entry.team).filter(isTeam) ?? [];
  const homeTeam = findTeam(homeInput, teams);
  const awayTeam = findTeam(awayInput, teams);

  if (!homeTeam) throw new WorldCupTeamNotFoundError(homeInput);
  if (!awayTeam) throw new WorldCupTeamNotFoundError(awayInput);

  const homeScheduleUrl = `${ESPN_BASE}/teams/${homeTeam.id}/schedule`;
  const awayScheduleUrl = `${ESPN_BASE}/teams/${awayTeam.id}/schedule`;
  const homeRosterUrl = `${ESPN_BASE}/teams/${homeTeam.id}/roster`;
  const awayRosterUrl = `${ESPN_BASE}/teams/${awayTeam.id}/roster`;
  const [homeSchedule, awaySchedule, homeRoster, awayRoster] = await Promise.all([
    fetchOptionalJson<EspnScheduleResponse>(homeScheduleUrl),
    fetchOptionalJson<EspnScheduleResponse>(awayScheduleUrl),
    fetchOptionalJson<EspnRosterResponse>(homeRosterUrl),
    fetchOptionalJson<EspnRosterResponse>(awayRosterUrl),
  ]);

  const warnings: string[] = [];
  if (!homeSchedule || !awaySchedule) warnings.push("部分赛程数据暂时不可用");
  if (!homeRoster || !awayRoster) warnings.push("部分名单或伤停数据暂时不可用");

  const homeSummary = summarizeTeam(homeTeam, homeSchedule, homeRoster);
  const awaySummary = summarizeTeam(awayTeam, awaySchedule, awayRoster);
  const directMatch = findDirectMatch(homeSchedule?.events ?? [], homeTeam.id, awayTeam.id);

  return {
    homeTeam: homeSummary.snapshot,
    awayTeam: awaySummary.snapshot,
    homeContext: homeSummary.context,
    awayContext: awaySummary.context,
    matchMeta: directMatch
      ? {
          kickoffTime: directMatch.date,
          venue: directMatch.competitions?.[0]?.venue?.fullName,
          stage: directMatch.seasonType?.name,
        }
      : undefined,
    scoreForecast: buildScoreForecast(homeSummary.context, awaySummary.context),
    fetchedAt: new Date().toISOString(),
    sources: [
      { label: "ESPN 世界杯球队名单", url: teamsUrl },
      { label: `${homeSummary.snapshot.name} 赛程`, url: homeScheduleUrl },
      { label: `${awaySummary.snapshot.name} 赛程`, url: awayScheduleUrl },
      { label: `${homeSummary.snapshot.name} 名单`, url: homeRosterUrl },
      { label: `${awaySummary.snapshot.name} 名单`, url: awayRosterUrl },
    ],
    warnings,
  };
}

function buildScoreForecast(home: WorldCupTeamContext, away: WorldCupTeamContext) {
  const homeMatches = Math.max(1, home.recentMatches ?? 0);
  const awayMatches = Math.max(1, away.recentMatches ?? 0);
  const homeAttack = home.goalsFor !== undefined ? home.goalsFor / homeMatches : 1.3;
  const awayAttack = away.goalsFor !== undefined ? away.goalsFor / awayMatches : 1.15;
  const homeDefense = home.goalsAgainst !== undefined ? home.goalsAgainst / homeMatches : 1.15;
  const awayDefense = away.goalsAgainst !== undefined ? away.goalsAgainst / awayMatches : 1.3;
  const expectedHome = clamp((homeAttack * 0.58 + awayDefense * 0.42) * 1.06, 0.3, 3.8);
  const expectedAway = clamp(awayAttack * 0.58 + homeDefense * 0.42, 0.3, 3.8);
  const scores: Array<{ home: number; away: number; probabilityPct: number }> = [];

  for (let homeGoals = 0; homeGoals <= 6; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= 6; awayGoals += 1) {
      scores.push({
        home: homeGoals,
        away: awayGoals,
        probabilityPct: poisson(homeGoals, expectedHome) * poisson(awayGoals, expectedAway) * 100,
      });
    }
  }

  return {
    method: "recent_form_poisson" as const,
    expectedGoals: {
      home: round(expectedHome, 2),
      away: round(expectedAway, 2),
    },
    candidates: scores
      .sort((a, b) => b.probabilityPct - a.probabilityPct)
      .slice(0, 3)
      .map((score) => ({ ...score, probabilityPct: round(score.probabilityPct, 1) })),
  };
}

function poisson(goals: number, expected: number) {
  return (Math.exp(-expected) * expected ** goals) / factorial(goals);
}

function factorial(value: number) {
  let result = 1;
  for (let current = 2; current <= value; current += 1) result *= current;
  return result;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits: number) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function summarizeTeam(
  team: EspnTeam,
  schedule?: EspnScheduleResponse,
  roster?: EspnRosterResponse,
) {
  const events = completedTeamEvents(schedule?.events ?? [], team.id).slice(0, RECENT_MATCH_LIMIT);
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const event of events) {
    const competitors = event.competitions?.[0]?.competitors ?? [];
    const current = competitors.find((competitor) => competitor.id === team.id);
    const opponent = competitors.find((competitor) => competitor.id !== team.id);
    const currentScore = finite(current?.score?.value) ?? 0;
    const opponentScore = finite(opponent?.score?.value) ?? 0;
    goalsFor += currentScore;
    goalsAgainst += opponentScore;
    if (currentScore > opponentScore) wins += 1;
    else if (currentScore < opponentScore) losses += 1;
    else draws += 1;
  }

  const athletes = roster?.athletes ?? [];
  const injuries = roster ? athletes.filter((athlete) => (athlete.injuries?.length ?? 0) > 0).length : undefined;
  const suspensions = roster
    ? athletes.filter((athlete) => /suspend/i.test(`${athlete.status?.type ?? ""} ${athlete.status?.name ?? ""}`)).length
    : undefined;
  const unavailable = (injuries ?? 0) + (suspensions ?? 0);
  const available = Math.max(0, athletes.length - unavailable);
  const points = wins * 3 + draws;
  const moraleSignal = events.length ? Math.round((points / (events.length * 3)) * 100) : undefined;
  const lastPlayedAt = events[0]?.date ? new Date(events[0].date) : undefined;
  const restDays = lastPlayedAt
    ? Math.max(0, Math.floor((Date.now() - lastPlayedAt.getTime()) / 86_400_000))
    : undefined;
  const abbreviation = clean(team.abbreviation);
  const displayName = clean(team.displayName || team.location || team.name || abbreviation);

  const snapshot: PublicTeamSnapshot = {
    id: clean(team.id),
    name: displayName,
    abbreviation,
    logo: team.logos?.find((logo) => logo.rel?.includes("default"))?.href,
    recent: {
      matches: events.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
    },
    personnel: {
      rostered: athletes.length,
      available,
      injuries,
      suspensions,
    },
  };

  const context: WorldCupTeamContext = {
    recentMatches: events.length || undefined,
    recentWins: events.length ? wins : undefined,
    recentDraws: events.length ? draws : undefined,
    recentLosses: events.length ? losses : undefined,
    goalsFor: events.length ? goalsFor : undefined,
    goalsAgainst: events.length ? goalsAgainst : undefined,
    injuries,
    suspensions,
    squadDepth: roster ? Math.min(100, Math.round((athletes.length / 26) * 100)) : undefined,
    moraleSignal,
    restDays,
    notes: [
      `公开赛程统计最近${events.length}场`,
      roster ? `公开名单${athletes.length}人，可用状态${available}人` : "公开名单暂时不可用",
    ],
  };

  return { snapshot, context };
}

function completedTeamEvents(events: EspnEvent[], teamId?: string) {
  return events
    .filter((event) => {
      const competition = event.competitions?.[0];
      const hasTeam = competition?.competitors?.some((competitor) => competitor.id === teamId);
      return Boolean(competition?.status?.type?.completed && hasTeam);
    })
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
}

function findDirectMatch(events: EspnEvent[], homeId?: string, awayId?: string) {
  const matches = events.filter((event) => {
    const ids = event.competitions?.[0]?.competitors?.map((competitor) => competitor.id) ?? [];
    return ids.includes(homeId) && ids.includes(awayId);
  });
  return matches.sort((a, b) => {
    const now = Date.now();
    return Math.abs(new Date(a.date ?? 0).getTime() - now) - Math.abs(new Date(b.date ?? 0).getTime() - now);
  })[0];
}

function findTeam(input: string, teams: EspnTeam[]) {
  const normalized = normalize(input);
  const alias = TEAM_ALIASES[normalized];
  const exact = teams.find((team) => teamKeys(team).includes(normalized) || clean(team.abbreviation).toUpperCase() === alias);
  if (exact) return exact;
  if (normalized.length < 3) return undefined;
  return teams.find((team) => teamKeys(team).some((key) => key.includes(normalized) || normalized.includes(key)));
}

function teamKeys(team: EspnTeam) {
  return [team.displayName, team.shortDisplayName, team.location, team.name, team.slug, team.abbreviation]
    .map(normalize)
    .filter(Boolean);
}

async function fetchRequiredJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "chaos-dreamcore-worldcup-oracle/0.5" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`世界杯公开数据请求失败：${response.status}`);
  return (await response.json()) as T;
}

async function fetchOptionalJson<T>(url: string): Promise<T | undefined> {
  try {
    return await fetchRequiredJson<T>(url);
  } catch (error) {
    console.warn("World Cup public data fetch failed:", url, error);
    return undefined;
  }
}

function isTeam(team: EspnTeam | undefined): team is EspnTeam & { id: string } {
  return Boolean(team?.id);
}

function normalize(value: unknown) {
  return clean(value).toLowerCase().replace(/[\s·._'’()-]/g, "");
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function finite(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
