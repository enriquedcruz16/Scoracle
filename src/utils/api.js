export const API_KEY = "b08f6877d56ad565b8dbb49558b764eb";
export const API_BASE = "https://v3.football.api-sports.io";

export async function apiFetch(p) {
  const r = await fetch(`${API_BASE}${p}`, {headers: {"x-apisports-key": API_KEY, "x-rapidapi-key": API_KEY, "x-rapidapi-host": "v3.football.api-sports.io"}});
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

export function normaliseTeam(name, API_TEAM_NAME_MAP) {
  return (API_TEAM_NAME_MAP && API_TEAM_NAME_MAP[name]) || name;
}

export function parseFix(data, API_TEAM_NAME_MAP, GROUP_NUM_TO_LETTER) {
  return data.map(f => {
    const s = f.fixture.status.short;
    const isLive = ["1H","HT","2H","ET","BT","P","SUSP","INT"].includes(s);
    const isDone = ["FT","AET","PEN"].includes(s);
    const dt = new Date(f.fixture.date);
    const rn = parseInt(((f.league.round || "").match(/(\d+)/) || [0, 1])[1]);
    const rawGroup = (f.league.round || "").replace(/Group Stage - /i, "").trim();
    const group = (GROUP_NUM_TO_LETTER && GROUP_NUM_TO_LETTER[rawGroup]) || rawGroup;
    const norm = name => normaliseTeam(name, API_TEAM_NAME_MAP);
    const home = norm(f.teams.home.name), away = norm(f.teams.away.name);
    return {
      id: String(f.fixture.id), rn, group, home, away,
      homeLogo: f.teams.home.logo, awayLogo: f.teams.away.logo,
      date: dt.toLocaleDateString("en-GB", {month: "short", day: "numeric"}),
      time: dt.toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"}),
      kickoffISO: f.fixture.date, status: s, elapsed: f.fixture.status.elapsed,
      venue: f.fixture.venue?.name, isLive, isDone,
      homeGoals: f.goals.home, awayGoals: f.goals.away,
      ftHome: f.score?.fulltime?.home, ftAway: f.score?.fulltime?.away,
      wentToET: ["AET","PEN","ET","BT"].includes(s), wentToPens: s === "PEN",
      penHome: s === "PEN" && f.score?.penalty?.home != null ? f.score.penalty.home : null,
      penAway: s === "PEN" && f.score?.penalty?.away != null ? f.score.penalty.away : null,
    };
  });
}

export function buildMD(fixtures) {
  const byR = {};
  fixtures.forEach(f => { const r = f.rn || 1; (byR[r] = byR[r] || []).push(f); });
  return Object.entries(byR).sort(([a],[b]) => +a - +b).map(([, fxs], i) => {
    const s = [...fxs].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    return {day: i+1, label: `Matchday ${i+1}`, dates: s[0]?.date + (s.length > 1 ? ` – ${s[s.length-1]?.date}` : ""), fixtures: s};
  });
}

export function groupTable(gKey, allFix, live, preds, GROUPS_TEAMS) {
  const teams = (GROUPS_TEAMS && GROUPS_TEAMS[gKey]) || [], t = {};
  teams.forEach(tm => { t[tm] = {team: tm, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0}; });
  allFix.filter(f => (f.group || "").toUpperCase().replace(/GROUP\s*/, "").trim() === gKey).forEach(fix => {
    const src = live[fix.id] || (fix.isDone ? {homeGoals: fix.homeGoals, awayGoals: fix.awayGoals} : null) || preds[fix.id];
    if (!src || src.homeGoals == null) return;
    const hg = +src.homeGoals, ag = +src.awayGoals, h = t[fix.home], a = t[fix.away];
    if (!h || !a) return;
    h.mp++; a.mp++; h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg;
    if (hg > ag) { h.w++; h.pts += 3; a.l++; }
    else if (hg < ag) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; h.pts++; a.d++; a.pts++; }
  });
  return Object.values(t).sort((a, b) => b.pts - a.pts || (b.gf-b.ga) - (a.gf-a.ga) || b.gf - a.gf);
}

export function calcBracketStandings(predictions, allFix, live, GROUPS_TEAMS) {
  const standings = {};
  Object.keys(GROUPS_TEAMS || {}).forEach(g => {
    const teams = GROUPS_TEAMS[g], table = {};
    teams.forEach(t => { table[t] = {team: t, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0}; });
    allFix.filter(f => (f.group || '').toUpperCase().replace(/GROUP\s*/, '').trim() === g && !f.isKnockout).forEach(fix => {
      const src = live[fix.id] || (fix.isDone ? {homeGoals: fix.homeGoals, awayGoals: fix.awayGoals} : null) || predictions[fix.id];
      if (!src || src.homeGoals == null) return;
      const hg = +src.homeGoals, ag = +src.awayGoals, h = table[fix.home], a = table[fix.away];
      if (!h || !a) return;
      h.mp++; a.mp++; h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg;
      if (hg > ag) { h.w++; h.pts += 3; a.l++; }
      else if (hg < ag) { a.w++; a.pts += 3; h.l++; }
      else { h.d++; h.pts++; a.d++; a.pts++; }
    });
    standings[g] = Object.values(table).sort((a, b) => b.pts - a.pts || (b.gf-b.ga) - (a.gf-a.ga) || b.gf - a.gf);
  });
  return standings;
}

export function getBest3rd(standings) {
  return Object.entries(standings).map(([g, rows]) => ({group: g, ...rows[2]})).filter(t => t.team)
    .sort((a, b) => b.pts - a.pts || (b.gf-b.ga) - (a.gf-a.ga) || b.gf - a.gf);
}

export function resolveSlot(key, standings) {
  if (key.startsWith('W_')) return standings[key.slice(2)]?.[0]?.team || `Winner Group ${key.slice(2)}`;
  if (key.startsWith('RU_')) return standings[key.slice(3)]?.[1]?.team || `Runner-up Group ${key.slice(3)}`;
  return key;
}

export function assignBest3rd(r32Bracket, standings, allThirds) {
  const best8 = allThirds.slice(0, 8);
  const used = new Set();
  const slotsWithIdx = r32Bracket.map((m, i) => ({m, i})).filter(({m}) => m.awayKey && m.awayKey.startsWith('3rd_'));
  slotsWithIdx.sort((a, b) => {
    const la = a.m.awayKey.replace('3rd_','').replace(/[0-9]/g,'').length;
    const lb = b.m.awayKey.replace('3rd_','').replace(/[0-9]/g,'').length;
    return la - lb;
  });
  const result = [...r32Bracket];
  slotsWithIdx.forEach(({m, i}) => {
    const suffix = m.awayKey.replace('3rd_','').replace(/[0-9]/g,'');
    const eligibleGroups = suffix.split('');
    const pick = best8.find(t => eligibleGroups.includes(t.group) && !used.has(t.team));
    if (pick) used.add(pick.team);
    result[i] = {...result[i], away: pick?.team || `Best 3rd (${suffix})`};
  });
  return result;
}
