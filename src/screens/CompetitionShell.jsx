import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabase";
import { CompetitionContext } from "../contexts/CompetitionContext";
import { COMPETITIONS } from "../constants/competitions";
import { parseFix, calcBracketStandings, getBest3rd } from "../utils/api";
import { pts, PTS_WINNER, PTS_BONUS } from "../utils/scoring";

// WC2026 constants
import { GROUPS_TEAMS as WC_GT, GROUPS_LIST as WC_GL, ALL_TEAMS as WC_AT, FLAGS as WC_F } from "../constants/wc2026/teams";
import { PLAYERS as WC_PL, PLAYER_FLAGS as WC_PF, ADV_ROUNDS as WC_ADV, BONUS_QUESTIONS as WC_BQ, BONUS_LOCK_ISO as WC_BLI } from "../constants/wc2026/bonus";
import { STATIC_MATCHDAYS as WC_SM, KNOCKOUT_BRACKET as WC_KB, GROUP_NUM_TO_LETTER as WC_GNL, API_TEAM_NAME_MAP as WC_ATM, HOME_AWAY_TO_STATIC_ID as WC_HASI, KO_LABEL as WC_KL } from "../constants/wc2026/fixtures";

// PL2526 constants
import { ALL_TEAMS as PL_AT, FLAGS as PL_F, PLAYERS as PL_PL } from "../constants/pl2526/teams";
import { STATIC_MATCHDAYS as PL_SM, KNOCKOUT_BRACKET as PL_KB, API_TEAM_NAME_MAP as PL_ATM } from "../constants/pl2526/fixtures";
import { BONUS_QUESTIONS as PL_BQ, BONUS_LOCK_ISO as PL_BLI } from "../constants/pl2526/bonus";

// Tabs
import { PredTab } from "../tabs/PredTab";
import { StandTab } from "../tabs/StandTab";
import { RankTab } from "../tabs/RankTab";
import { BonusTab } from "../tabs/BonusTab";
import { StatsTab } from "../tabs/StatsTab";
import { BracketTab } from "../tabs/BracketTab";
import { RulesTab } from "../tabs/RulesTab";
import { MiniLeaguesTab } from "../tabs/MiniLeaguesTab";
import { AdminTab } from "../tabs/AdminTab";
import Confetti from "../components/Confetti";
import PWAPrompt from "../components/PWAPrompt";

const ADMIN_ID = "0c51030f-a4ce-4e6c-8c4c-87ffba2acae2";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

const NAV = [
  {id:"predict",icon:"🎯",label:"Predict"},
  {id:"standings",icon:"📋",label:"Standings"},
  {id:"leaderboard",icon:"🏆",label:"Leaderboard"},
  {id:"bonus",icon:"⭐",label:"Bonus"},
  {id:"leagues",icon:"👥",label:"My Leagues"},
];

const S = {
  root:{minHeight:"100vh",background:"#000",color:"#f9fafb",fontFamily:"'DM Sans','Segoe UI',sans-serif",maxWidth:960,margin:"0 auto",paddingBottom:72},
  header:{background:"#000",borderBottom:"1px solid #141414",padding:"14px 16px 0",position:"sticky",top:0,zIndex:100},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:500,backdropFilter:"blur(6px)"},
  menu:{position:"fixed",top:0,left:0,bottom:0,width:290,background:"#080808",borderRight:"1px solid #1a1a1a",display:"flex",flexDirection:"column",zIndex:501,overflowY:"auto"},
  botNav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:960,background:"#040404",borderTop:"1px solid #141414",display:"flex",zIndex:200},
  card:{background:"#080808",border:"1px solid #141414",borderRadius:16,padding:16,marginBottom:12,transition:"border-color 0.3s,box-shadow 0.3s"},
  pill:{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,color:"#fff"},
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
@keyframes pp{0%,100%{opacity:0.14}50%{opacity:0.24}}
@keyframes sc{0%{transform:translateY(-100%)}100%{transform:translateY(2000%)}}
@keyframes ballFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-5px)}}
@keyframes glowP{0%,100%{opacity:0.25}50%{opacity:0.55}}
.pp{animation:pp 3s ease-in-out infinite}
.scanline{animation:sc 5s linear infinite}
.ballf{animation:ballFloat 3s ease-in-out infinite}
.glowp{animation:glowP 3s ease-in-out infinite}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#000;-webkit-tap-highlight-color:transparent;}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
input[type=number]{-moz-appearance:textfield;}
input,select,button,textarea{outline:none!important;} input:focus,select:focus{border-color:#1a1a1a!important;box-shadow:none!important;}
button:active{transform:scale(0.97);}
tr:hover td{background:#0c0c0c;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
@keyframes pitchPulse{0%,100%{opacity:0.13;}50%{opacity:0.22;}}
::-webkit-scrollbar{height:4px;width:4px;background:#0a0a0a;}
::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:#3a3a3a;}
::-webkit-scrollbar-track{background:#0a0a0a;}
*{scrollbar-width:thin;scrollbar-color:#2a2a2a #0a0a0a;}
@keyframes scanMove{0%{transform:translateY(-100px);}100%{transform:translateY(1000px);}}
.pitch-lines{animation:pitchPulse 3s ease-in-out infinite;}
.scan-line{animation:scanMove 5s linear infinite;}
.cp{animation:fall 1.4s ease-in forwards;}
@keyframes fall{0%{transform:translateY(0) rotate(0);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}
`;

export function CompetitionShell({ competitionId, user, onBack }) {
  const competition = COMPETITIONS[competitionId];
  const G = competition.accentColor;
  const isWC = competitionId === "wc2026";

  // Competition-specific constants (stable for lifetime of component)
  const GROUPS_TEAMS = isWC ? WC_GT : {};
  const GROUPS_LIST = isWC ? WC_GL : [];
  const ALL_TEAMS = isWC ? WC_AT : PL_AT;
  const FLAGS = isWC ? WC_F : PL_F;
  const PLAYERS = isWC ? WC_PL : PL_PL;
  const PLAYER_FLAGS = isWC ? WC_PF : {};
  const STATIC_MATCHDAYS = isWC ? WC_SM : PL_SM;
  const KNOCKOUT_BRACKET = isWC ? WC_KB : PL_KB;
  const GROUP_NUM_TO_LETTER = isWC ? WC_GNL : {};
  const API_TEAM_NAME_MAP = isWC ? WC_ATM : PL_ATM;
  const HOME_AWAY_TO_STATIC_ID = isWC ? WC_HASI : {};
  const KO_LABEL = isWC ? WC_KL : {};
  const ADV_ROUNDS = isWC ? WC_ADV : [];
  const BONUS_QUESTIONS = isWC ? WC_BQ : PL_BQ;
  const BONUS_LOCK_ISO = isWC ? WC_BLI : PL_BLI;

  const [tab, setTab] = useState("predict");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const initDay = () => {
    const now = Date.now();
    const allMDs = [...STATIC_MATCHDAYS, ...KNOCKOUT_BRACKET];
    for (const md of allMDs) {
      if ((md.fixtures || []).some(f => new Date(f.kickoffISO).getTime() > now - 2 * 60 * 60 * 1000)) return md.day;
    }
    return allMDs[allMDs.length - 1]?.day || 1;
  };

  const [matchdays, setMatchdays] = useState([...STATIC_MATCHDAYS, ...KNOCKOUT_BRACKET]);
  const [selDay, setSelDay] = useState(initDay);
  const [predictions, setPredictions] = useState({});
  const [live, setLive] = useState({});
  const [bonus, setBonus] = useState({});
  const [champion, setChampion] = useState("");
  const [savedId, setSavedId] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [apiStatus, setApiStatus] = useState("fallback");
  const [apiIdMap, setApiIdMap] = useState({});
  const [allPreds, setAllPreds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [allBonusAnswers, setAllBonusAnswers] = useState([]);
  const poll = useRef(null);

  useEffect(() => {
    if (!user || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then(async reg => {
      const sub = await reg.pushManager.getSubscription();
      setNotifEnabled(!!sub);
    });
  }, [user]);

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
  }

  async function toggleNotifications() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications aren't supported on this browser."); return;
    }
    setNotifLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        await supabase.from("push_subscriptions").delete().eq("user_id", user.id);
        setNotifEnabled(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") { alert("Please allow notifications in your browser settings."); setNotifLoading(false); return; }
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
        await supabase.from("push_subscriptions").upsert({ user_id: user.id, subscription: sub.toJSON() }, { onConflict: "user_id" });
        setNotifEnabled(true);
      }
    } catch (e) { console.error("Notification toggle error:", e); }
    setNotifLoading(false);
  }

  async function loadAll() {
    async function fetchBatched(table) {
      let all = [], offset = 0;
      while (true) {
        const { data: batch } = await supabase.from(table).select("*").eq("competition_id", competitionId).range(offset, offset + 999);
        if (!batch || batch.length === 0) break;
        all = [...all, ...batch];
        if (batch.length < 1000) break;
        offset += 1000;
      }
      return all;
    }
    const [{ data: pr }, allAp, allAb] = await Promise.all([
      supabase.from("profiles").select("id,name"),
      fetchBatched("predictions"),
      fetchBatched("bonus_answers"),
    ]);
    setProfiles(pr || []);
    setAllPreds(allAp);
    setAllBonusAnswers(allAb);
  }

  useEffect(() => {
    if (!user) return;
    supabase.from("predictions").select("*").eq("user_id", user.id).eq("competition_id", competitionId).then(({ data }) => {
      if (!data) return;
      const p = {};
      data.forEach(x => { p[x.fixture_id] = { homeGoals: x.home_goals, awayGoals: x.away_goals, home_et: x.home_et, away_et: x.away_et, home_pens: x.home_pens, away_pens: x.away_pens, fixture_id: x.fixture_id }; });
      STATIC_MATCHDAYS.forEach(md => { (md.fixtures || []).forEach(fix => { if (p[fix.id]) p[(fix.home + "|" + fix.away).toLowerCase()] = p[fix.id]; }); });
      setPredictions(p);
    });
    supabase.from("bonus_answers").select("*").eq("user_id", user.id).eq("competition_id", competitionId).then(({ data }) => {
      if (!data) return;
      const a = {};
      data.forEach(x => { a[x.question_id] = x.answer; });
      setBonus(a);
      const champ = data.find(x => x.question_id === "champion");
      if (champ) setChampion(champ.answer);
    });
    loadAll();
  }, [user]);

  async function runBonusEngine(currentLive, currentAllFix) {
    if (!user || !isWC) return;
    const lv = currentLive || live;
    const fx = currentAllFix || allFix;
    const r32Start = new Date("2026-06-28T15:00:00-04:00");
    const groupsDone = new Date() >= r32Start || ["A","B","C","D","E","F","G","H","I","J","K","L"].every(g =>
      fx.filter(f => (f.group || "").toUpperCase().replace(/GROUP/i, "").trim() === g && !f.isKnockout).every(f => f.isDone)
    );
    if (groupsDone) {
      const fxForStandings = fx.map(f => f.isDone || f.homeGoals != null ? {...f, isDone: true} : f);
      const standings = calcBracketStandings({}, fxForStandings, lv, GROUPS_TEAMS);
      const r32Teams = [];
      Object.values(standings).forEach(rows => { r32Teams.push(rows[0]?.team); r32Teams.push(rows[1]?.team); });
      const best3rd = getBest3rd(standings).slice(0, 8).map(t => t.team);
      const allR32 = [...r32Teams, ...best3rd].filter(Boolean);
      if (allR32.length > 0) {
        await supabase.from("bonus_answers").upsert({ user_id: user.id, competition_id: competitionId, question_id: "actual_adv_r32", answer: JSON.stringify(allR32) }, { onConflict: "user_id,question_id,competition_id" });
      }
    }
    const PLACEHOLDER_RE = /^([12][A-L]|3rd-|W M|L M)/;
    const koRounds = [{id:"r16",group:"R32",nextGroup:"R16"},{id:"qf",group:"R16",nextGroup:"QF"},{id:"sf",group:"QF",nextGroup:"SF"},{id:"final",group:"SF",nextGroup:"Final"}];
    for (let i = 0; i < koRounds.length; i++) {
      const rnd = koRounds[i];
      const nextFix = fx.filter(f => f.isKnockout && f.group === rnd.nextGroup);
      const resolvedTeams = [];
      nextFix.forEach(f => {
        if (f.home && !PLACEHOLDER_RE.test(f.home)) resolvedTeams.push(f.home);
        if (f.away && !PLACEHOLDER_RE.test(f.away)) resolvedTeams.push(f.away);
      });
      if (resolvedTeams.length > 0 && resolvedTeams.length === nextFix.length * 2) {
        await supabase.from("bonus_answers").upsert({ user_id: user.id, competition_id: competitionId, question_id: "actual_adv_" + rnd.id, answer: JSON.stringify(resolvedTeams) }, { onConflict: "user_id,question_id,competition_id" });
        continue;
      }
      const roundFix = fx.filter(f => f.isKnockout && f.group === rnd.group);
      const allDone = roundFix.length > 0 && roundFix.every(f => f.isDone || (lv[f.id] != null && lv[f.id].homeGoals != null));
      if (allDone) {
        const winners = roundFix.map(f => {
          const r = lv[f.id] || (f.isDone ? { homeGoals: f.homeGoals, awayGoals: f.awayGoals, wentToPens: f.wentToPens || false, penHome: f.penHome ?? null, penAway: f.penAway ?? null } : null);
          if (!r) return null;
          return (r.wentToPens && r.penHome != null && r.penAway != null) ? (r.penHome > r.penAway ? f.home : f.away) : (r.homeGoals > r.awayGoals ? f.home : f.away);
        }).filter(Boolean);
        if (winners.length > 0) {
          await supabase.from("bonus_answers").upsert({ user_id: user.id, competition_id: competitionId, question_id: "actual_adv_" + rnd.id, answer: JSON.stringify(winners) }, { onConflict: "user_id,question_id,competition_id" });
        }
      }
    }
    await loadAll();
  }

  const fetchLive = useCallback(async () => {
    try {
      const r = await fetch(`/api/fixtures?league=${competition.apiLeagueId}&season=${competition.apiSeason}`);
      const d = await r.json();
      if (!r.ok) throw new Error(r.status);
      if (!d.response?.length) { setApiStatus("fallback"); return; }
      const parsed = parseFix(d.response, API_TEAM_NAME_MAP, GROUP_NUM_TO_LETTER);

      if (!isWC) {
        // PL: simple matchday build from API
        const apiByPair = {};
        parsed.forEach(f => { apiByPair[(f.home + "|" + f.away).toLowerCase()] = f; });
        const nl = {};
        parsed.forEach(f => {
          if ((f.isLive || f.isDone) && f.homeGoals != null) {
            nl[f.id] = { homeGoals: f.homeGoals, awayGoals: f.awayGoals, isLive: f.isLive, elapsed: f.elapsed, wentToET: false, wentToPens: false, ftHome: f.ftHome, ftAway: f.ftAway, penHome: null, penAway: null, isKnockout: false };
          }
        });
        setLive(nl);
        setApiStatus("live");
        return;
      }

      // WC2026: complex enrichment
      const apiByPair = {};
      parsed.forEach(f => { apiByPair[(f.home + "|" + f.away).toLowerCase()] = f; });

      const enriched = STATIC_MATCHDAYS.map(md => ({
        ...md, fixtures: md.fixtures.map(fix => {
          const key = (fix.home + "|" + fix.away).toLowerCase();
          const revKey = (fix.away + "|" + fix.home).toLowerCase();
          let af = apiByPair[key]; let reversed = false;
          if (!af && apiByPair[revKey]) { af = apiByPair[revKey]; reversed = true; }
          if (!af) return fix;
          return { ...fix, homeLogo: reversed ? af.awayLogo : af.homeLogo, awayLogo: reversed ? af.homeLogo : af.awayLogo, status: af.status, elapsed: af.elapsed, isLive: af.isLive, isDone: af.isDone, homeGoals: reversed ? af.awayGoals : af.homeGoals, awayGoals: reversed ? af.homeGoals : af.awayGoals, wentToET: af.wentToET || false, wentToPens: af.wentToPens || false, ftHome: reversed ? af.ftAway : af.ftHome, ftAway: reversed ? af.ftHome : af.ftAway, penHome: reversed ? af.penAway : af.penHome, penAway: reversed ? af.penHome : af.penAway };
        })
      }));

      const knockoutFix = parsed.filter(f => !/^[A-L]$/.test(f.group));
      const apiKOByPair = {};
      knockoutFix.forEach(f => { apiKOByPair[(f.home + "|" + f.away).toLowerCase()] = f; });

      const fxDone = enriched.flatMap(md => md.fixtures).map(f => f.isDone || f.homeGoals != null ? {...f, isDone: true} : f);
      const koStandings = calcBracketStandings({}, fxDone, {}, GROUPS_TEAMS);

      const THIRD_RE = /^3rd-([A-L]+)$/;
      const allThirdsKO = getBest3rd(koStandings);
      const best8KO = allThirdsKO.slice(0, 8);
      const OFFICIAL_3RD_SLOT_GROUPS = {"3rd-ABCDF":"D","3rd-CDFGH":"F","3rd-CEFHI":"E","3rd-EHIJK":"K","3rd-BCEFH":"B","3rd-BCIJK":"I","3rd-ACDFGJ":"J","3rd-DEIJL":"L"};
      const thirdSlotsKO = Array.from(new Set(KNOCKOUT_BRACKET.flatMap(kb => kb.fixtures).flatMap(f => [f.home, f.away]).filter(s => THIRD_RE.test(s))));
      const usedKOT = new Set();
      const thirdMapKO = {};
      thirdSlotsKO.forEach(slot => {
        const targetGroup = OFFICIAL_3RD_SLOT_GROUPS[slot];
        const pick = targetGroup ? best8KO.find(t => t.group === targetGroup && !usedKOT.has(t.team)) : best8KO.find(t => slot.replace("3rd-", "").split("").includes(t.group) && !usedKOT.has(t.team));
        if (pick) { usedKOT.add(pick.team); thirdMapKO[slot] = pick.team; }
      });

      const SLOT_RE = /^([12])([A-L])$/;
      function resSlot(slot) {
        const m = SLOT_RE.exec(slot);
        if (m) { const rows = koStandings[m[2]]; return (rows && rows[m[1] === "1" ? 0 : 1]?.team) || slot; }
        if (THIRD_RE.test(slot)) return thirdMapKO[slot] || slot;
        return slot;
      }

      const knockoutMDs = KNOCKOUT_BRACKET.map(kb => ({
        ...kb, day: enriched.length + (kb.day - 3),
        fixtures: kb.fixtures.map(fix => {
          const resolvedHome = resSlot(fix.home), resolvedAway = resSlot(fix.away);
          const pairKey = (resolvedHome + "|" + resolvedAway).toLowerCase(), revKey = (resolvedAway + "|" + resolvedHome).toLowerCase();
          let af = apiKOByPair[pairKey]; let reversed = false;
          if (!af && apiKOByPair[revKey]) { af = apiKOByPair[revKey]; reversed = true; }
          if (!af) return {...fix, home: resolvedHome, away: resolvedAway};
          return { ...fix, home: resolvedHome, away: resolvedAway, homeLogo: reversed ? af.awayLogo : af.homeLogo, awayLogo: reversed ? af.homeLogo : af.awayLogo, status: af.status, elapsed: af.elapsed, isLive: af.isLive, isDone: af.isDone, homeGoals: reversed ? af.awayGoals : af.homeGoals, awayGoals: reversed ? af.homeGoals : af.awayGoals, wentToET: af.wentToET || false, wentToPens: af.wentToPens || false, ftHome: reversed ? af.ftAway : af.ftHome, ftAway: reversed ? af.ftHome : af.ftAway, penHome: reversed ? af.penAway : af.penHome, penAway: reversed ? af.penHome : af.penAway };
        })
      }));

      const WM_RE = /^([WL])\s*M(\d+)$/i;
      function applyWMPass(mds) {
        const krbn = {};
        mds.flatMap(md => md.fixtures).forEach(fix => {
          if (fix.mNum && fix.homeGoals != null && !WM_RE.test(fix.home) && !WM_RE.test(fix.away)) {
            const winner = (fix.wentToPens && fix.penHome != null) ? (fix.penHome > fix.penAway ? fix.home : fix.away) : (fix.homeGoals > fix.awayGoals ? fix.home : fix.away);
            krbn[fix.mNum] = { winner, loser: fix.home === winner ? fix.away : fix.home };
          }
        });
        return mds.map(md => ({
          ...md, fixtures: md.fixtures.map(fix => {
            const hm = WM_RE.exec(fix.home), am = WM_RE.exec(fix.away);
            if (!hm && !am) return fix;
            const rh = hm ? (hm[1].toUpperCase() === "W" ? krbn[+hm[2]]?.winner : krbn[+hm[2]]?.loser) || fix.home : fix.home;
            const ra = am ? (am[1].toUpperCase() === "W" ? krbn[+am[2]]?.winner : krbn[+am[2]]?.loser) || fix.away : fix.away;
            if (rh === fix.home && ra === fix.away) return fix;
            const pk = (rh + "|" + ra).toLowerCase(), rvk = (ra + "|" + rh).toLowerCase();
            let af2 = apiKOByPair[pk]; let rev2 = false;
            if (!af2 && apiKOByPair[rvk]) { af2 = apiKOByPair[rvk]; rev2 = true; }
            if (!af2) return {...fix, home: rh, away: ra};
            return { ...fix, home: rh, away: ra, homeLogo: rev2 ? af2.awayLogo : af2.homeLogo, awayLogo: rev2 ? af2.homeLogo : af2.awayLogo, status: af2.status, elapsed: af2.elapsed, isLive: af2.isLive, isDone: af2.isDone, homeGoals: rev2 ? af2.awayGoals : af2.homeGoals, awayGoals: rev2 ? af2.homeGoals : af2.awayGoals, wentToET: af2.wentToET || false, wentToPens: af2.wentToPens || false, ftHome: rev2 ? af2.ftAway : af2.ftHome, ftAway: rev2 ? af2.ftHome : af2.ftAway, penHome: rev2 ? af2.penAway : af2.penHome, penAway: rev2 ? af2.penHome : af2.penAway };
          })
        }));
      }

      let knockoutMDsFinal = applyWMPass(knockoutMDs);
      knockoutMDsFinal = applyWMPass(knockoutMDsFinal);
      knockoutMDsFinal = applyWMPass(knockoutMDsFinal);
      setMatchdays([...enriched, ...knockoutMDsFinal]);

      const nl = {};
      parsed.forEach(f => {
        if ((f.isLive || f.isDone) && f.homeGoals != null) {
          nl[f.id] = { homeGoals: f.homeGoals, awayGoals: f.awayGoals, isLive: f.isLive, elapsed: f.elapsed, wentToET: f.wentToET || false, wentToPens: f.wentToPens || false, ftHome: f.ftHome, ftAway: f.ftAway, penHome: f.penHome, penAway: f.penAway, isKnockout: false };
          const normalKey = (f.home + "|" + f.away).toLowerCase();
          const reversedKey = (f.away + "|" + f.home).toLowerCase();
          const sid = HOME_AWAY_TO_STATIC_ID[normalKey] || HOME_AWAY_TO_STATIC_ID[reversedKey];
          const isReversed = !HOME_AWAY_TO_STATIC_ID[normalKey] && !!HOME_AWAY_TO_STATIC_ID[reversedKey];
          if (sid) nl[sid] = { homeGoals: isReversed ? f.awayGoals : f.homeGoals, awayGoals: isReversed ? f.homeGoals : f.awayGoals, isLive: f.isLive, elapsed: f.elapsed, wentToET: f.wentToET || false, wentToPens: f.wentToPens || false, ftHome: isReversed ? f.ftAway : f.ftHome, ftAway: isReversed ? f.ftHome : f.ftAway, penHome: isReversed ? f.penAway : f.penHome, penAway: isReversed ? f.penHome : f.penAway, isKnockout: false };
        }
      });
      knockoutMDsFinal.flatMap(md => md.fixtures).forEach(fix => {
        if ((fix.isLive || fix.isDone) && fix.homeGoals != null) {
          nl[fix.id] = { homeGoals: fix.homeGoals, awayGoals: fix.awayGoals, isLive: fix.isLive, elapsed: fix.elapsed, wentToET: fix.wentToET || false, wentToPens: fix.wentToPens || false, ftHome: fix.ftHome, ftAway: fix.ftAway, penHome: fix.penHome, penAway: fix.penAway, isKnockout: true };
        }
      });
      const newApiIdMap = {};
      parsed.forEach(f => { newApiIdMap[(f.home + "|" + f.away).toLowerCase()] = f.id; });
      setApiIdMap(newApiIdMap);
      setLive(nl);
      setApiStatus("live");
      runBonusEngine(nl, [...enriched.flatMap(md => md.fixtures), ...knockoutMDsFinal.flatMap(md => md.fixtures)]);
    } catch (err) {
      console.error("API fetch error:", err);
      setApiStatus("fallback");
    }
  }, [user]);

  useEffect(() => { fetchLive(); poll.current = setInterval(fetchLive, 30000); return () => clearInterval(poll.current); }, [fetchLive]);
  useEffect(() => { if (!user) return; const id = setInterval(loadAll, 30000); return () => clearInterval(id); }, [user]);

  const allFix = matchdays.flatMap(m => m.fixtures);

  const totalPts = allFix.reduce((s, fix) => {
    const r = live[fix.id] || (fix.isDone ? { homeGoals: fix.homeGoals, awayGoals: fix.awayGoals, ftHome: fix.ftHome, ftAway: fix.ftAway, wentToET: fix.wentToET || false, wentToPens: fix.wentToPens || false, penHome: fix.penHome, penAway: fix.penAway, isKnockout: fix.isKnockout || false } : null);
    const staticId = HOME_AWAY_TO_STATIC_ID[(fix.home + "|" + fix.away).toLowerCase()];
    const pred = predictions[fix.id] || (staticId && predictions[staticId]);
    return s + (pts(pred, r) || 0);
  }, 0);

  const myBonusPts = (() => {
    if (!user || !allBonusAnswers?.length) return 0;
    const ub = allBonusAnswers.filter(b => b.user_id === user.id);
    const adminBonus = allBonusAnswers.filter(b => b.user_id === ADMIN_ID);
    const adminGet = k => (adminBonus.find(b => b.question_id === k) || {}).answer || "";
    const get = k => (ub.find(b => b.question_id === k) || {}).answer || "";
    let bp = 0;
    const champResult = adminGet("champion_result");
    const bootResult = adminGet("topscorer_result");
    const goalsResult = adminGet("mostgoals_result");
    let goalsArr; try { goalsArr = JSON.parse(goalsResult); } catch { goalsArr = null; }
    const goalsMatch = goalsResult && (Array.isArray(goalsArr) ? goalsArr.includes(get("mostgoals")) : get("mostgoals") === goalsResult);
    if (champResult && get("champion") === champResult) bp += PTS_WINNER;
    if (bootResult && get("topscorer") === bootResult) bp += PTS_BONUS;
    if (goalsMatch) bp += PTS_BONUS;
    ADV_ROUNDS.forEach(rnd => {
      const actual = adminGet("actual_adv_" + rnd.id);
      if (!actual) return;
      try {
        const actualTeams = JSON.parse(actual);
        const userPicks = JSON.parse(get("adv_" + rnd.id) || "[]");
        bp += userPicks.filter(t => actualTeams.includes(t)).length * PTS_BONUS;
      } catch {}
    });
    return bp;
  })();

  const predCount = Object.keys(predictions).filter(k => k.startsWith("s_") || /^\d+$/.test(k)).length;
  const totalFix = STATIC_MATCHDAYS.reduce((s, md) => s + md.fixtures.length, 0) + KNOCKOUT_BRACKET.reduce((s, kb) => s + kb.fixtures.length, 0);
  const isAdmin = user?.id === ADMIN_ID;

  async function savePred(id, h, a, hEt, aEt, hPens, aPens) {
    const hg = parseInt(h), ag = parseInt(a); if (isNaN(hg) || isNaN(ag)) return;
    const etH = hEt != null && hEt !== "" ? parseInt(hEt) : null;
    const etA = aEt != null && aEt !== "" ? parseInt(aEt) : null;
    const pnH = hPens != null && hPens !== "" ? parseInt(hPens) : null;
    const pnA = aPens != null && aPens !== "" ? parseInt(aPens) : null;
    const fix = allFix.find(f => f.id === id);
    const staticId = (fix && HOME_AWAY_TO_STATIC_ID[(fix.home + "|" + fix.away).toLowerCase()]) || id;
    setPredictions(p => ({ ...p, [staticId]: { homeGoals: hg, awayGoals: ag, home_et: etH, away_et: etA, home_pens: pnH, away_pens: pnA }, [id]: { homeGoals: hg, awayGoals: ag, home_et: etH, away_et: etA, home_pens: pnH, away_pens: pnA } }));
    setSavedId(id); setConfetti(true); setTimeout(() => setConfetti(false), 1400); setTimeout(() => setSavedId(null), 2200);
    await supabase.from("predictions").upsert({ user_id: user.id, competition_id: competitionId, fixture_id: staticId, home_goals: hg, away_goals: ag, home_et: etH ?? null, away_et: etA ?? null, home_pens: pnH ?? null, away_pens: pnA ?? null }, { onConflict: "user_id,fixture_id,competition_id" });
    loadAll();
  }

  async function saveBonus(id, val) {
    setBonus(p => ({ ...p, [id]: val }));
    await supabase.from("bonus_answers").upsert({ user_id: user.id, competition_id: competitionId, question_id: id, answer: val }, { onConflict: "user_id,question_id,competition_id" });
  }

  function go(t) { setTab(t); setMenuOpen(false); }

  const MENU_EXTRA = [
    {id:"stats",icon:"📊",label:"Stats"},
    ...(isWC ? [{id:"bracket",icon:"🗂️",label:"My Bracket"}] : []),
    {id:"rules",icon:"📖",label:"Rules"},
  ];

  const ctxValue = {
    accentColor: G,
    competition,
    GROUPS_TEAMS, GROUPS_LIST, ALL_TEAMS, FLAGS,
    PLAYERS, PLAYER_FLAGS, HOME_AWAY_TO_STATIC_ID, KO_LABEL,
    STATIC_MATCHDAYS, KNOCKOUT_BRACKET, ADV_ROUNDS, BONUS_QUESTIONS, BONUS_LOCK_ISO,
    matchdays, selDay, setSelDay,
    predictions, live, bonus, champion,
    setChampion: c => { setChampion(c); saveBonus("champion", c); },
    savedId, allPreds, profiles, allBonusAnswers,
    onSave: savePred,
    saveBonus,
    totalPts, myBonusPts, predCount, totalFix,
    isAdmin, apiStatus, confetti, apiIdMap, allFix,
    user, currentUser: user, loadAll,
  };

  return (
    <CompetitionContext.Provider value={ctxValue}>
      <div style={S.root}>
        <style>{CSS}</style>
        {confetti && <Confetti/>}
        <PWAPrompt/>

        {menuOpen && (
          <div style={S.overlay} onClick={() => setMenuOpen(false)}>
            <nav style={S.menu} onClick={e => e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"24px 20px 16px"}}>
                <div>
                  <div style={{fontSize:18,fontWeight:800,letterSpacing:3,color:G}}>⚽ SCORACLE</div>
                  <div style={{fontSize:10,color:"#374151",letterSpacing:1,marginTop:2}}>{competition.name}</div>
                </div>
                <button style={{background:"none",border:"1px solid #222",color:"#6b7280",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:14}} onClick={() => setMenuOpen(false)}>✕</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 20px",background:"#0f0f0f"}}>
                <div style={{fontSize:28}}>👤</div>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#f9fafb",display:"flex",alignItems:"center",gap:6}}>
                    {user.name}
                    {isAdmin && <span style={{fontSize:9,fontWeight:800,color:"#000",background:G,borderRadius:4,padding:"2px 6px"}}>ADMIN</span>}
                  </div>
                  <div style={{fontSize:11,color:"#6b7280"}}>{user.email}</div>
                </div>
              </div>
              <div style={{height:1,background:"#141414"}}/>
              {MENU_EXTRA.map(n => (
                <button key={n.id} onClick={() => go(n.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 20px",background:tab===n.id?"#0d0d0d":"none",border:"none",color:tab===n.id?G:"#6b7280",cursor:"pointer",fontSize:14,fontWeight:500,width:"100%",textAlign:"left",borderLeft:tab===n.id?`3px solid ${G}`:"3px solid transparent"}}>
                  <span style={{fontSize:18,width:24,textAlign:"center"}}>{n.icon}</span>
                  <span>{n.label}</span>
                  {tab===n.id && <span style={{marginLeft:"auto",color:G,fontSize:8}}>●</span>}
                </button>
              ))}
              {isAdmin && (
                <button onClick={() => go("admin")} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 20px",background:tab==="admin"?"#0d0d0d":"none",border:"none",borderTop:"1px solid #1a1a1a",color:tab==="admin"?G:"#6b7280",cursor:"pointer",fontSize:14,fontWeight:500,width:"100%",textAlign:"left",borderLeft:tab==="admin"?`3px solid ${G}`:"3px solid transparent"}}>
                  <span style={{fontSize:18,width:24,textAlign:"center"}}>⚙️</span>
                  <span>Admin Dashboard</span>
                </button>
              )}
              <div style={{height:1,background:"#141414"}}/>
              <div style={{padding:"20px",marginTop:"auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:apiStatus==="live"?"#22c55e":"#f59e0b",display:"inline-block"}}/>
                  <span style={{fontSize:12,color:"#6b7280"}}>{apiStatus==="live"?"Live data connected":"Static data"}</span>
                </div>
                <div style={{fontSize:10,color:"#1f2937",marginTop:2}}>{competition.description}</div>
                <div style={{marginTop:16,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:10,padding:"12px 14px"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#f9fafb"}}>🔔 Match Reminders</div>
                    <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{notifEnabled?"You'll get notified before games":"Get notified before each game"}</div>
                  </div>
                  <button onClick={toggleNotifications} disabled={notifLoading} style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",background:notifEnabled?"#22c55e":"#374151",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                    <span style={{position:"absolute",top:2,left:notifEnabled?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                  </button>
                </div>
                <button onClick={onBack} style={{marginTop:12,width:"100%",background:"none",border:"1px solid #1f1f1f",color:"#6b7280",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600}}>← Back to Lobby</button>
              </div>
            </nav>
          </div>
        )}

        <header style={S.header}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <button style={{background:"none",border:"none",cursor:"pointer",padding:"5px 0",color:"#6b7280",fontSize:18,flexShrink:0}} onClick={onBack} title="Back to Lobby">←</button>
            <button style={{background:"none",border:"none",cursor:"pointer",padding:"5px 6px",display:"flex",flexDirection:"column",gap:5,flexShrink:0}} onClick={() => setMenuOpen(true)}>
              {[0,1,2].map(i => <span key={i} style={{display:"block",width:22,height:2,background:G,borderRadius:2}}/>)}
            </button>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:26,filter:`drop-shadow(0 0 8px ${G}66)`}}>{competition.emoji}</span>
              <div>
                <div style={{fontSize:17,fontWeight:800,letterSpacing:3,color:G}}>SCORACLE</div>
                <div style={{fontSize:9,color:"#374151",letterSpacing:0.5}}>{competition.shortName} · {user.name}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{background:"#0d0d0d",border:"1px solid #1f1f1f",borderRadius:10,padding:"5px 12px",textAlign:"center"}}>
                <span style={{display:"block",fontSize:16,fontWeight:800,color:G}}>{totalPts + myBonusPts}</span>
                <span style={{fontSize:9,color:"#6b7280",letterSpacing:1}}>PTS</span>
              </div>
              <span style={{width:8,height:8,borderRadius:"50%",background:apiStatus==="live"?"#22c55e":"#f59e0b",display:"inline-block",flexShrink:0}}/>
            </div>
          </div>
          <div style={{height:2,background:"#0f0f0f"}}>
            <div style={{height:"100%",background:`linear-gradient(90deg,${G},#22c55e)`,width:`${totalFix ? (predCount / totalFix) * 100 : 0}%`,transition:"width 0.6s",borderRadius:2}}/>
          </div>
        </header>

        <nav style={S.botNav}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => go(n.id)} style={{flex:1,background:"none",border:"none",color:tab===n.id?G:"#374151",padding:"10px 4px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>
              {tab===n.id && <div style={{position:"absolute",top:0,left:"12%",width:"76%",height:2,background:G,borderRadius:"0 0 3px 3px"}}/>}
              <span style={{fontSize:19}}>{n.icon}</span>
              <span style={{fontSize:9,fontWeight:600,letterSpacing:0.5}}>{n.label}</span>
            </button>
          ))}
        </nav>

        <main>
          {tab === "predict" && <PredTab/>}
          {tab === "standings" && <StandTab/>}
          {tab === "leaderboard" && <RankTab/>}
          {tab === "bonus" && <BonusTab/>}
          {tab === "leagues" && <MiniLeaguesTab/>}
          {tab === "stats" && <StatsTab/>}
          {tab === "rules" && <RulesTab/>}
          {tab === "bracket" && isWC && <BracketTab/>}
          {tab === "admin" && isAdmin && (
            <AdminTab
              profiles={profiles}
              allPreds={allPreds}
              allBonusAnswers={allBonusAnswers}
              allFix={allFix}
              live={live}
              matchdays={matchdays}
              apiIdMap={apiIdMap}
              onRecalcBonus={() => runBonusEngine(live, allFix)}
            />
          )}
        </main>
      </div>
    </CompetitionContext.Provider>
  );
}
