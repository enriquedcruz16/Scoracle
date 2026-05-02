import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_KEY = "b08f6877d56ad565b8dbb49558b764eb";
const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE_ID = 1;
const SEASON = 2026;
const LOCK_MINUTES_BEFORE = 15;

// ─── SCORING ──────────────────────────────────────────────────────────────────
const PTS_EXACT = 10;
const PTS_RESULT = 5;
const PTS_WRONG = 0;
const PTS_WINNER = 50;
const PTS_BONUS = 10;

// ─── GROUPS & TEAMS ───────────────────────────────────────────────────────────
const GROUPS_TEAMS = {
  A:["Mexico","South Korea","South Africa","Czechia"],
  B:["Canada","Switzerland","Qatar","Bosnia-Herzegovina"],
  C:["Brazil","Morocco","Haiti","Scotland"],
  D:["USA","Paraguay","Australia","Türkiye"],
  E:["Germany","Curaçao","Ivory Coast","Ecuador"],
  F:["Netherlands","Japan","Sweden","Tunisia"],
  G:["Belgium","Egypt","Iran","New Zealand"],
  H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I:["France","Senegal","Iraq","Norway"],
  J:["Argentina","Algeria","Austria","Jordan"],
  K:["Portugal","DR Congo","Uzbekistan","Colombia"],
  L:["England","Croatia","Ghana","Panama"],
};
const GROUPS_LIST = Object.keys(GROUPS_TEAMS);
const ALL_TEAMS = Object.values(GROUPS_TEAMS).flat();

const FLAGS = {
  Mexico:"🇲🇽","South Korea":"🇰🇷","South Africa":"🇿🇦",Czechia:"🇨🇿",
  Canada:"🇨🇦",Switzerland:"🇨🇭",Qatar:"🇶🇦","Bosnia-Herzegovina":"🇧🇦",
  Brazil:"🇧🇷",Morocco:"🇲🇦",Haiti:"🇭🇹",Scotland:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA:"🇺🇸",Paraguay:"🇵🇾",Australia:"🇦🇺","Türkiye":"🇹🇷",
  Germany:"🇩🇪","Curaçao":"🇨🇼","Ivory Coast":"🇨🇮",Ecuador:"🇪🇨",
  Netherlands:"🇳🇱",Japan:"🇯🇵",Sweden:"🇸🇪",Tunisia:"🇹🇳",
  Belgium:"🇧🇪",Egypt:"🇪🇬",Iran:"🇮🇷","New Zealand":"🇳🇿",
  Spain:"🇪🇸","Cape Verde":"🇨🇻","Saudi Arabia":"🇸🇦",Uruguay:"🇺🇾",
  France:"🇫🇷",Senegal:"🇸🇳",Iraq:"🇮🇶",Norway:"🇳🇴",
  Argentina:"🇦🇷",Algeria:"🇩🇿",Austria:"🇦🇹",Jordan:"🇯🇴",
  Portugal:"🇵🇹","DR Congo":"🇨🇩",Uzbekistan:"🇺🇿",Colombia:"🇨🇴",
  England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",Croatia:"🇭🇷",Ghana:"🇬🇭",Panama:"🇵🇦",
};

// ─── FIXTURES ─────────────────────────────────────────────────────────────────
const STATIC_MATCHDAYS = [
  { day:1, label:"Matchday 1", dates:"Jun 11–17", fixtures:[
    {id:"s_A1",group:"A",home:"Mexico",away:"South Africa",date:"Jun 11",time:"21:00",venue:"Estadio Azteca, Mexico City",kickoffISO:"2026-06-11T21:00:00-05:00"},
    {id:"s_A2",group:"A",home:"South Korea",away:"Czechia",date:"Jun 11",time:"21:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-11T21:00:00-06:00"},
    {id:"s_B1",group:"B",home:"Canada",away:"Bosnia-Herzegovina",date:"Jun 12",time:"20:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-12T20:00:00-04:00"},
    {id:"s_D1",group:"D",home:"USA",away:"Paraguay",date:"Jun 12",time:"21:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-12T21:00:00-07:00"},
    {id:"s_B2",group:"B",home:"Qatar",away:"Switzerland",date:"Jun 13",time:"20:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-13T20:00:00-07:00"},
    {id:"s_C1",group:"C",home:"Brazil",away:"Morocco",date:"Jun 13",time:"23:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-13T23:00:00-04:00"},
    {id:"s_C2",group:"C",home:"Haiti",away:"Scotland",date:"Jun 14",time:"02:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-14T02:00:00-04:00"},
    {id:"s_D2",group:"D",home:"Australia",away:"Türkiye",date:"Jun 14",time:"02:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-14T02:00:00-07:00"},
    {id:"s_E1",group:"E",home:"Germany",away:"Curaçao",date:"Jun 14",time:"18:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-14T18:00:00-05:00"},
    {id:"s_F1",group:"F",home:"Netherlands",away:"Japan",date:"Jun 14",time:"21:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-14T21:00:00-05:00"},
    {id:"s_E2",group:"E",home:"Ivory Coast",away:"Ecuador",date:"Jun 15",time:"00:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-15T00:00:00-04:00"},
    {id:"s_F2",group:"F",home:"Tunisia",away:"Sweden",date:"Jun 15",time:"03:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-15T03:00:00-06:00"},
    {id:"s_H1",group:"H",home:"Spain",away:"Cape Verde",date:"Jun 15",time:"18:00",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-15T18:00:00-04:00"},
    {id:"s_G1",group:"G",home:"Belgium",away:"Egypt",date:"Jun 15",time:"21:00",venue:"Lumen Field, Seattle",kickoffISO:"2026-06-15T21:00:00-07:00"},
    {id:"s_H2",group:"H",home:"Saudi Arabia",away:"Uruguay",date:"Jun 16",time:"00:00",venue:"Hard Rock Stadium, Miami",kickoffISO:"2026-06-16T00:00:00-04:00"},
    {id:"s_G2",group:"G",home:"Iran",away:"New Zealand",date:"Jun 16",time:"03:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-16T03:00:00-07:00"},
    {id:"s_I1",group:"I",home:"France",away:"Senegal",date:"Jun 16",time:"20:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-16T20:00:00-04:00"},
    {id:"s_I2",group:"I",home:"Iraq",away:"Norway",date:"Jun 16",time:"23:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-16T23:00:00-04:00"},
    {id:"s_J1",group:"J",home:"Argentina",away:"Algeria",date:"Jun 17",time:"02:00",venue:"Arrowhead Stadium, Kansas City",kickoffISO:"2026-06-17T02:00:00-05:00"},
    {id:"s_J2",group:"J",home:"Austria",away:"Jordan",date:"Jun 17",time:"05:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-17T05:00:00-07:00"},
    {id:"s_K1",group:"K",home:"Portugal",away:"DR Congo",date:"Jun 17",time:"18:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-17T18:00:00-05:00"},
    {id:"s_L1",group:"L",home:"England",away:"Croatia",date:"Jun 17",time:"21:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-17T21:00:00-05:00"},
    {id:"s_L2",group:"L",home:"Ghana",away:"Panama",date:"Jun 18",time:"00:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-18T00:00:00-04:00"},
    {id:"s_K2",group:"K",home:"Uzbekistan",away:"Colombia",date:"Jun 18",time:"03:00",venue:"Estadio Azteca, Mexico City",kickoffISO:"2026-06-18T03:00:00-05:00"},
  ]},
  { day:2, label:"Matchday 2", dates:"Jun 18–23", fixtures:[
    {id:"s_A3",group:"A",home:"South Africa",away:"Czechia",date:"Jun 18",time:"18:00",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-18T18:00:00-04:00"},
    {id:"s_B3",group:"B",home:"Switzerland",away:"Bosnia-Herzegovina",date:"Jun 18",time:"20:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-18T20:00:00-07:00"},
    {id:"s_B4",group:"B",home:"Canada",away:"Qatar",date:"Jun 18",time:"23:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-18T23:00:00-07:00"},
    {id:"s_A4",group:"A",home:"Mexico",away:"South Korea",date:"Jun 19",time:"02:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-19T02:00:00-06:00"},
    {id:"s_D3",group:"D",home:"USA",away:"Australia",date:"Jun 19",time:"20:00",venue:"Lumen Field, Seattle",kickoffISO:"2026-06-19T20:00:00-07:00"},
    {id:"s_C3",group:"C",home:"Scotland",away:"Morocco",date:"Jun 19",time:"23:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-19T23:00:00-04:00"},
    {id:"s_C4",group:"C",home:"Brazil",away:"Haiti",date:"Jun 20",time:"02:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-20T02:00:00-04:00"},
    {id:"s_D4",group:"D",home:"Türkiye",away:"Paraguay",date:"Jun 20",time:"05:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-20T05:00:00-07:00"},
    {id:"s_F3",group:"F",home:"Netherlands",away:"Sweden",date:"Jun 20",time:"18:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-20T18:00:00-05:00"},
    {id:"s_E3",group:"E",home:"Germany",away:"Ivory Coast",date:"Jun 20",time:"21:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-20T21:00:00-04:00"},
    {id:"s_E4",group:"E",home:"Ecuador",away:"Curaçao",date:"Jun 21",time:"00:00",venue:"Arrowhead Stadium, Kansas City",kickoffISO:"2026-06-21T00:00:00-05:00"},
    {id:"s_F4",group:"F",home:"Tunisia",away:"Japan",date:"Jun 21",time:"03:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-21T03:00:00-06:00"},
    {id:"s_H3",group:"H",home:"Spain",away:"Saudi Arabia",date:"Jun 21",time:"18:00",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-21T18:00:00-04:00"},
    {id:"s_G3",group:"G",home:"Belgium",away:"Iran",date:"Jun 21",time:"20:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-21T20:00:00-07:00"},
    {id:"s_H4",group:"H",home:"Uruguay",away:"Cape Verde",date:"Jun 21",time:"23:00",venue:"Hard Rock Stadium, Miami",kickoffISO:"2026-06-21T23:00:00-04:00"},
    {id:"s_G4",group:"G",home:"New Zealand",away:"Egypt",date:"Jun 22",time:"02:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-22T02:00:00-07:00"},
    {id:"s_J3",group:"J",home:"Argentina",away:"Austria",date:"Jun 22",time:"18:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-22T18:00:00-05:00"},
    {id:"s_I3",group:"I",home:"France",away:"Iraq",date:"Jun 22",time:"22:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-22T22:00:00-04:00"},
    {id:"s_I4",group:"I",home:"Norway",away:"Senegal",date:"Jun 23",time:"01:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-23T01:00:00-04:00"},
    {id:"s_J4",group:"J",home:"Jordan",away:"Algeria",date:"Jun 23",time:"04:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-23T04:00:00-07:00"},
    {id:"s_K3",group:"K",home:"Portugal",away:"Uzbekistan",date:"Jun 23",time:"18:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-23T18:00:00-05:00"},
    {id:"s_L3",group:"L",home:"England",away:"Ghana",date:"Jun 23",time:"21:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-23T21:00:00-04:00"},
    {id:"s_L4",group:"L",home:"Panama",away:"Croatia",date:"Jun 24",time:"00:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-24T00:00:00-04:00"},
    {id:"s_K4",group:"K",home:"Colombia",away:"DR Congo",date:"Jun 24",time:"03:00",venue:"Estadio Azteca, Mexico City",kickoffISO:"2026-06-24T03:00:00-05:00"},
  ]},
  { day:3, label:"Matchday 3", dates:"Jun 24–28", fixtures:[
    {id:"s_B5",group:"B",home:"Switzerland",away:"Canada",date:"Jun 24",time:"20:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-24T20:00:00-07:00"},
    {id:"s_B6",group:"B",home:"Bosnia-Herzegovina",away:"Qatar",date:"Jun 24",time:"20:00",venue:"Lumen Field, Seattle",kickoffISO:"2026-06-24T20:00:00-07:00"},
    {id:"s_C5",group:"C",home:"Scotland",away:"Brazil",date:"Jun 24",time:"23:00",venue:"Hard Rock Stadium, Miami",kickoffISO:"2026-06-24T23:00:00-04:00"},
    {id:"s_C6",group:"C",home:"Morocco",away:"Haiti",date:"Jun 24",time:"23:00",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-24T23:00:00-04:00"},
    {id:"s_A5",group:"A",home:"Czechia",away:"Mexico",date:"Jun 25",time:"02:00",venue:"Estadio Azteca, Mexico City",kickoffISO:"2026-06-25T02:00:00-05:00"},
    {id:"s_A6",group:"A",home:"South Africa",away:"South Korea",date:"Jun 25",time:"02:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-25T02:00:00-06:00"},
    {id:"s_E5",group:"E",home:"Ecuador",away:"Germany",date:"Jun 25",time:"21:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-25T21:00:00-04:00"},
    {id:"s_E6",group:"E",home:"Curaçao",away:"Ivory Coast",date:"Jun 25",time:"21:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-25T21:00:00-04:00"},
    {id:"s_F5",group:"F",home:"Japan",away:"Sweden",date:"Jun 26",time:"00:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-26T00:00:00-05:00"},
    {id:"s_F6",group:"F",home:"Tunisia",away:"Netherlands",date:"Jun 26",time:"00:00",venue:"Arrowhead Stadium, Kansas City",kickoffISO:"2026-06-26T00:00:00-05:00"},
    {id:"s_D5",group:"D",home:"Türkiye",away:"USA",date:"Jun 26",time:"03:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-26T03:00:00-07:00"},
    {id:"s_D6",group:"D",home:"Paraguay",away:"Australia",date:"Jun 26",time:"03:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-26T03:00:00-07:00"},
    {id:"s_I5",group:"I",home:"Norway",away:"France",date:"Jun 26",time:"20:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-26T20:00:00-04:00"},
    {id:"s_I6",group:"I",home:"Senegal",away:"Iraq",date:"Jun 26",time:"20:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-26T20:00:00-04:00"},
    {id:"s_H5",group:"H",home:"Cape Verde",away:"Saudi Arabia",date:"Jun 27",time:"00:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-27T00:00:00-05:00"},
    {id:"s_H6",group:"H",home:"Uruguay",away:"Spain",date:"Jun 27",time:"00:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-27T00:00:00-06:00"},
    {id:"s_G5",group:"G",home:"Egypt",away:"Iran",date:"Jun 27",time:"03:00",venue:"Lumen Field, Seattle",kickoffISO:"2026-06-27T03:00:00-07:00"},
    {id:"s_G6",group:"G",home:"New Zealand",away:"Belgium",date:"Jun 27",time:"03:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-27T03:00:00-07:00"},
    {id:"s_L5",group:"L",home:"Panama",away:"England",date:"Jun 27",time:"22:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-27T22:00:00-04:00"},
    {id:"s_L6",group:"L",home:"Croatia",away:"Ghana",date:"Jun 27",time:"22:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-27T22:00:00-04:00"},
    {id:"s_K5",group:"K",home:"Colombia",away:"Portugal",date:"Jun 28",time:"00:30",venue:"Hard Rock Stadium, Miami",kickoffISO:"2026-06-28T00:30:00-04:00"},
    {id:"s_K6",group:"K",home:"DR Congo",away:"Uzbekistan",date:"Jun 28",time:"00:30",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-28T00:30:00-04:00"},
    {id:"s_J5",group:"J",home:"Algeria",away:"Austria",date:"Jun 28",time:"03:00",venue:"Arrowhead Stadium, Kansas City",kickoffISO:"2026-06-28T03:00:00-05:00"},
    {id:"s_J6",group:"J",home:"Jordan",away:"Argentina",date:"Jun 28",time:"03:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-28T03:00:00-05:00"},
  ]},
];

const LEADERBOARD_MOCK = [
  {name:"Carlos M.",avatar:"🧑",pts:142,correct:31,streak:5},
  {name:"Priya S.",avatar:"👩",pts:138,correct:29,streak:3},
  {name:"James T.",avatar:"🧔",pts:125,correct:27,streak:1},
  {name:"Sofia R.",avatar:"👩‍🦰",pts:119,correct:25,streak:4},
  {name:"Amir K.",avatar:"🧑‍🦱",pts:104,correct:22,streak:0},
  {name:"Yuki N.",avatar:"👩‍🦳",pts:98,correct:20,streak:2},
  {name:"Marco D.",avatar:"🧑‍🦲",pts:87,correct:18,streak:1},
];

const PLAYERS = [
  "Lionel Messi","Kylian Mbappé","Erling Haaland","Vinicius Jr","Jude Bellingham",
  "Harry Kane","Cristiano Ronaldo","Neymar Jr","Mohamed Salah","Kevin De Bruyne",
  "Lamine Yamal","Pedri","Bukayo Saka","Phil Foden","Rodri","Antoine Griezmann",
  "Bernardo Silva","Bruno Fernandes","Raphinha","Leroy Sané",
];

const NAV_ITEMS = [
  {id:"predict",icon:"🎯",label:"Predictions"},
  {id:"standings",icon:"📋",label:"Standings"},
  {id:"leaderboard",icon:"🏆",label:"Rankings"},
  {id:"bonus",icon:"⭐",label:"Bonus"},
  {id:"stats",icon:"📊",label:"My Stats"},
  {id:"rules",icon:"📖",label:"Rules"},
];

// ─── SCORING LOGIC ────────────────────────────────────────────────────────────
function calcPoints(pred, result) {
  if (!pred || !result) return null;
  const {homeGoals:ph,awayGoals:pa} = pred;
  const {homeGoals:rh,awayGoals:ra} = result;
  if ([ph,pa,rh,ra].some(v=>v==null)) return null;
  if (Number(ph)===Number(rh)&&Number(pa)===Number(ra)) return PTS_EXACT;
  const po=ph>pa?"H":ph<pa?"A":"D", ro=rh>ra?"H":rh<ra?"A":"D";
  return po===ro ? PTS_RESULT : PTS_WRONG;
}

function isLocked(kickoffISO) {
  if (!kickoffISO) return false;
  const kickoff = new Date(kickoffISO);
  const lockTime = new Date(kickoff.getTime() - LOCK_MINUTES_BEFORE * 60 * 1000);
  return new Date() >= lockTime;
}

function timeUntilLock(kickoffISO) {
  if (!kickoffISO) return null;
  const kickoff = new Date(kickoffISO);
  const lockTime = new Date(kickoff.getTime() - LOCK_MINUTES_BEFORE * 60 * 1000);
  const diff = lockTime - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return null;
  if (h > 0) return `Locks in ${h}h ${m}m`;
  return `Locks in ${m}m`;
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function apiFetch(path) {
  const r = await fetch(`${API_BASE}${path}`,{headers:{"x-apisports-key":API_KEY}});
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

function parseFixtures(data) {
  return data.map(f=>{
    const s=f.fixture.status.short;
    const isLive=["1H","HT","2H","ET","BT","P","SUSP","INT"].includes(s);
    const isDone=["FT","AET","PEN"].includes(s);
    const dt=new Date(f.fixture.date);
    const roundNum=parseInt(((f.league.round||"").match(/(\d+)/)||[0,1])[1]);
    return {
      id:String(f.fixture.id), apiId:f.fixture.id, roundNum,
      group:(f.league.round||"").replace(/Group Stage - /i,"").trim(),
      home:f.teams.home.name, away:f.teams.away.name,
      homeLogo:f.teams.home.logo, awayLogo:f.teams.away.logo,
      date:dt.toLocaleDateString("en-GB",{month:"short",day:"numeric"}),
      time:dt.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
      kickoffISO:f.fixture.date,
      status:s, elapsed:f.fixture.status.elapsed,
      venue:f.fixture.venue?.name,
      isLive, isDone,
      homeGoals:f.goals.home, awayGoals:f.goals.away,
    };
  });
}

function buildMatchdays(fixtures) {
  const byRound={};
  fixtures.forEach(f=>{const r=f.roundNum||1;(byRound[r]=byRound[r]||[]).push(f);});
  return Object.entries(byRound).sort(([a],[b])=>+a-+b).map(([,fxs],i)=>{
    const s=[...fxs].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
    return {day:i+1,label:`Matchday ${i+1}`,dates:s[0]?.date+(s.length>1?` – ${s[s.length-1]?.date}`:""),fixtures:s};
  });
}

function calcGroupStandings(gKey,allFixtures,liveResults,predictions) {
  const teams=GROUPS_TEAMS[gKey]||[];
  const table={};
  teams.forEach(t=>{table[t]={team:t,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});
  allFixtures.filter(f=>(f.group||"").toUpperCase().replace(/GROUP\s*/,"").trim()===gKey).forEach(fix=>{
    const src=liveResults[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null)||predictions[fix.id];
    if(!src||src.homeGoals==null) return;
    const hg=+src.homeGoals,ag=+src.awayGoals,h=table[fix.home],a=table[fix.away];
    if(!h||!a) return;
    h.mp++;a.mp++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;
    if(hg>ag){h.w++;h.pts+=3;a.l++;}else if(hg<ag){a.w++;a.pts+=3;h.l++;}else{h.d++;h.pts++;a.d++;a.pts++;}
  });
  return Object.values(table).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
}

function StatusPill({status,elapsed}) {
  if(["1H","2H","ET"].includes(status)) return <span style={{...S.pill,background:"#ef4444",animation:"pulse 1.5s infinite"}}>🔴 {elapsed}'</span>;
  if(status==="HT") return <span style={{...S.pill,background:"#f59e0b",color:"#000"}}>HT</span>;
  if(["FT","AET","PEN"].includes(status)) return <span style={{...S.pill,background:"#1f2937"}}>FT</span>;
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({onLogin}) {
  const [mode,setMode]=useState("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");

  function handle() {
    if(mode==="signup"&&!name.trim()){setError("Please enter your name.");return;}
    if(!email.includes("@")){setError("Please enter a valid email.");return;}
    if(password.length<6){setError("Password must be at least 6 characters.");return;}
    setError("");
    onLogin({name:name||email.split("@")[0], email, avatar:"👤"});
  }

  return (
    <div style={S.authWrap}>
      <div style={S.authCard}>
        <div style={S.authLogo}>
          <span style={S.authLogoIcon}>⚽</span>
          <div style={S.authBrand}>SCORACLE</div>
          <div style={S.authTagline}>FIFA World Cup 2026 · Prediction Game</div>
        </div>

        <div style={S.authToggleRow}>
          <button onClick={()=>setMode("login")} style={{...S.authToggle,...(mode==="login"?S.authToggleOn:{})}}>Sign In</button>
          <button onClick={()=>setMode("signup")} style={{...S.authToggle,...(mode==="signup"?S.authToggleOn:{})}}>Create Account</button>
        </div>

        {mode==="signup"&&(
          <div style={S.authField}>
            <label style={S.authLabel}>Your Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. John Smith" style={S.authInput}/>
          </div>
        )}
        <div style={S.authField}>
          <label style={S.authLabel}>Email Address</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={S.authInput}/>
        </div>
        <div style={S.authField}>
          <label style={S.authLabel}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={S.authInput}/>
        </div>

        {error&&<div style={S.authError}>{error}</div>}

        <button onClick={handle} style={S.authBtn}>
          {mode==="login"?"Sign In to Scoracle":"Join Scoracle"}
        </button>

        <div style={S.authNote}>
          🔒 Your predictions are saved to your account and visible on the leaderboard.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("predict");
  const [menuOpen,setMenuOpen]=useState(false);
  const [matchdays,setMatchdays]=useState(STATIC_MATCHDAYS);
  const [selDay,setSelDay]=useState(1);
  const [predictions,setPredictions]=useState({});
  const [liveResults,setLiveResults]=useState({});
  const [bonusAnswers,setBonusAnswers]=useState({});
  const [champion,setChampion]=useState("");
  const [savedId,setSavedId]=useState(null);
  const [confetti,setConfetti]=useState(false);
  const [apiStatus,setApiStatus]=useState("loading");
  const [lastUpdated,setLastUpdated]=useState(null);
  const pollRef=useRef(null);

  const fetchData=useCallback(async()=>{
    try {
      const data=await apiFetch(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`);
      if(!data.response?.length){setApiStatus("fallback");return;}
      const parsed=parseFixtures(data.response);
      const mds=buildMatchdays(parsed);
      if(mds.length) setMatchdays(mds);
      const newLive={};
      parsed.forEach(f=>{
        if((f.isLive||f.isDone)&&f.homeGoals!=null)
          newLive[f.id]={homeGoals:f.homeGoals,awayGoals:f.awayGoals,isLive:f.isLive,elapsed:f.elapsed};
      });
      setLiveResults(newLive);
      setApiStatus("live");
      setLastUpdated(new Date());
    } catch { setApiStatus("fallback"); }
  },[]);

  useEffect(()=>{
    fetchData();
    pollRef.current=setInterval(fetchData,30000);
    return ()=>clearInterval(pollRef.current);
  },[fetchData]);

  const allFixtures=matchdays.flatMap(m=>m.fixtures);
  const totalPts=allFixtures.reduce((s,fix)=>{
    const r=liveResults[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);
    return s+(calcPoints(predictions[fix.id],r)||0);
  },0);
  const predictedCount=Object.keys(predictions).length;
  const totalFixtures=allFixtures.length||48;
  const correctExact=allFixtures.filter(fix=>{
    const r=liveResults[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);
    return calcPoints(predictions[fix.id],r)===PTS_EXACT;
  }).length;

  function savePred(id,h,a){
    const hg=parseInt(h),ag=parseInt(a);
    if(isNaN(hg)||isNaN(ag)) return;
    setPredictions(p=>({...p,[id]:{homeGoals:hg,awayGoals:ag}}));
    setSavedId(id);setConfetti(true);
    setTimeout(()=>setConfetti(false),1400);
    setTimeout(()=>setSavedId(null),2200);
  }
  function go(t){setTab(t);setMenuOpen(false);}

  if(!user) return <AuthScreen onLogin={setUser}/>;

  return (
    <div style={S.root}>
      <style>{CSS}</style>
      {confetti&&<Confetti/>}

      {/* ── Side Menu ── */}
      {menuOpen&&(
        <div style={S.overlay} onClick={()=>setMenuOpen(false)}>
          <nav style={S.menuPanel} onClick={e=>e.stopPropagation()}>
            <div style={S.menuTop}>
              <div>
                <div style={S.menuBrand}>⚽ SCORACLE</div>
                <div style={S.menuSubBrand}>FIFA World Cup 2026</div>
              </div>
              <button style={S.closeBtn} onClick={()=>setMenuOpen(false)}>✕</button>
            </div>
            <div style={S.menuUser}>
              <div style={S.menuUserAv}>{user.avatar}</div>
              <div>
                <div style={S.menuUserName}>{user.name}</div>
                <div style={S.menuUserEmail}>{user.email}</div>
              </div>
            </div>
            <div style={S.divider}/>
            {NAV_ITEMS.map(n=>(
              <button key={n.id} onClick={()=>go(n.id)}
                style={{...S.menuItem,...(tab===n.id?S.menuItemOn:{})}}>
                <span style={S.menuIcon}>{n.icon}</span><span>{n.label}</span>
                {tab===n.id&&<span style={S.menuDot}>●</span>}
              </button>
            ))}
            <div style={S.divider}/>
            <div style={S.menuFooter}>
              <div style={S.statusRow}>
                <span style={{...S.dot,background:apiStatus==="live"?"#22c55e":apiStatus==="fallback"?"#f59e0b":"#374151"}}/>
                <span style={S.statusTxt}>{apiStatus==="live"?"Live data connected":"Static data (pre-tournament)"}</span>
              </div>
              {lastUpdated&&<div style={S.updTxt}>Updated {lastUpdated.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>}
              <div style={S.menuHint}>48 teams · 12 groups · 104 matches</div>
              <button onClick={()=>setUser(null)} style={S.signOutBtn}>Sign Out</button>
            </div>
          </nav>
        </div>
      )}

      {/* ── Header ── */}
      <header style={S.header}>
        <div style={S.headerRow}>
          <button style={S.burger} onClick={()=>setMenuOpen(true)}>
            <span style={S.burgerBar}/><span style={S.burgerBar}/><span style={S.burgerBar}/>
          </button>
          <div style={S.brand}>
            <span style={S.brandIcon}>⚽</span>
            <div>
              <div style={S.brandName}>SCORACLE</div>
              <div style={S.brandSub}>World Cup 2026 · {user.name}</div>
            </div>
          </div>
          <div style={S.headerRight}>
            <div style={S.ptsBubble}>
              <span style={S.ptsNum}>{totalPts}</span>
              <span style={S.ptsLbl}>PTS</span>
            </div>
            <span style={{...S.dot,width:8,height:8,flexShrink:0,background:apiStatus==="live"?"#22c55e":apiStatus==="fallback"?"#f59e0b":"#374151"}}/>
          </div>
        </div>
        <div style={S.prog}><div style={{...S.progFill,width:`${totalFixtures?(predictedCount/totalFixtures)*100:0}%`}}/></div>
      </header>

      {/* ── Bottom Nav ── */}
      <nav style={S.botNav}>
        {[
          {id:"predict",icon:"🎯",label:"Predict"},
          {id:"standings",icon:"📋",label:"Standings"},
          {id:"leaderboard",icon:"🏆",label:"Rankings"},
          {id:"bonus",icon:"⭐",label:"Bonus"},
          {id:"stats",icon:"📊",label:"Stats"},
        ].map(n=>(
          <button key={n.id} onClick={()=>go(n.id)} style={{...S.navBtn,...(tab===n.id?S.navBtnOn:{})}}>
            {tab===n.id&&<div style={S.navBar}/>}
            <span style={S.navIco}>{n.icon}</span>
            <span style={S.navLbl}>{n.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Pages ── */}
      <main style={S.main}>
        {tab==="predict"&&<PredictTab matchdays={matchdays} selDay={selDay} setSelDay={setSelDay}
          predictions={predictions} liveResults={liveResults} onSave={savePred} savedId={savedId}/>}
        {tab==="standings"&&<StandingsTab allFixtures={allFixtures} liveResults={liveResults} predictions={predictions}/>}
        {tab==="leaderboard"&&<LeaderboardTab userPts={totalPts} userCorrect={correctExact} userName={user.name}/>}
        {tab==="bonus"&&<BonusTab answers={bonusAnswers} setAnswers={setBonusAnswers}
          champion={champion} setChampion={setChampion} players={PLAYERS} teams={ALL_TEAMS}/>}
        {tab==="stats"&&<StatsTab allFixtures={allFixtures} predictions={predictions} liveResults={liveResults}
          totalPts={totalPts} predictedCount={predictedCount} totalFixtures={totalFixtures}/>}
        {tab==="rules"&&<RulesTab/>}
      </main>
    </div>
  );
}

// ══════════════════ PREDICT TAB ══════════════════════════════════════
function PredictTab({matchdays,selDay,setSelDay,predictions,liveResults,onSave,savedId}) {
  const [drafts,setDrafts]=useState({});
  const md=matchdays.find(m=>m.day===selDay)||matchdays[0];
  const fixes=md?.fixtures||[];

  function inp(id,side,v){setDrafts(p=>({...p,[id]:{...p[id],[side]:v}}));}
  function val(id,side){
    const d=drafts[id],pr=predictions[id];
    if(d?.[side]!==undefined) return d[side];
    if(side==="home"&&pr?.homeGoals!==undefined) return String(pr.homeGoals);
    if(side==="away"&&pr?.awayGoals!==undefined) return String(pr.awayGoals);
    return "";
  }

  return (
    <div>
      <div style={S.mdWrap}>
        {matchdays.map(m=>(
          <button key={m.day} onClick={()=>setSelDay(m.day)} style={{...S.mdTab,...(selDay===m.day?S.mdTabOn:{})}}>
            <div style={S.mdLabel}>{m.label}</div>
            <div style={S.mdDates}>{m.dates}</div>
          </button>
        ))}
      </div>
      <div style={S.sec}>
        {fixes.map(fix=>{
          const live=liveResults[fix.id];
          const result=live||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);
          const pred=predictions[fix.id];
          const pts=calcPoints(pred,result);
          const locked=isLocked(fix.kickoffISO)||fix.isLive||fix.isDone;
          const isSaved=savedId===fix.id;
          const hv=val(fix.id,"home"), av=val(fix.id,"away");
          const lockMsg=timeUntilLock(fix.kickoffISO);

          return (
            <div key={fix.id} style={{...S.card,...(isSaved?S.cardSaved:{}),...(fix.isLive?S.cardLive:{})}}>
              <div style={S.cardMeta}>
                <div>
                  <span style={S.grpTag}>Group {fix.group}</span>
                  <span style={S.dateTxt}> · {fix.date} · {fix.time}</span>
                  {fix.venue&&<div style={S.venueTxt}>📍 {fix.venue}</div>}
                  {lockMsg&&<div style={S.lockWarn}>⏱ {lockMsg}</div>}
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  <StatusPill status={fix.status} elapsed={fix.elapsed}/>
                  {pts!==null&&(
                    <span style={{...S.ptsPill,background:pts===PTS_EXACT?"#22c55e":pts===PTS_RESULT?"#f59e0b":"#ef4444"}}>
                      {pts===PTS_EXACT?`✓ +${PTS_EXACT}`:pts===PTS_RESULT?`~ +${PTS_RESULT}`:`✗ +0`}
                    </span>
                  )}
                </div>
              </div>

              <div style={S.matchRow}>
                <div style={S.team}>
                  {fix.homeLogo?<img src={fix.homeLogo} alt="" style={S.logo}/>:<span style={S.flag}>{FLAGS[fix.home]||"🏳️"}</span>}
                  <span style={S.teamName}>{fix.home}</span>
                </div>
                <div style={S.scoreZone}>
                  {result!=null&&(
                    <div style={{textAlign:"center"}}>
                      <span style={{...S.liveNum,color:fix.isLive?"#ef4444":"#f59e0b"}}>{result.homeGoals} – {result.awayGoals}</span>
                      <div style={S.livMin}>{fix.isLive?`${fix.elapsed}'`:"FT"}</div>
                    </div>
                  )}
                  <div style={S.inputRow}>
                    <input type="number" min="0" max="20" value={hv}
                      onChange={e=>inp(fix.id,"home",e.target.value)}
                      style={{...S.sInput,...(locked?S.sInputLocked:{})}} disabled={locked} placeholder="–"/>
                    <span style={S.colon}>:</span>
                    <input type="number" min="0" max="20" value={av}
                      onChange={e=>inp(fix.id,"away",e.target.value)}
                      style={{...S.sInput,...(locked?S.sInputLocked:{})}} disabled={locked} placeholder="–"/>
                  </div>
                  {pred&&!locked&&<div style={S.hint}>Pick: {pred.homeGoals}–{pred.awayGoals}</div>}
                </div>
                <div style={{...S.team,...S.teamR}}>
                  <span style={S.teamName}>{fix.away}</span>
                  {fix.awayLogo?<img src={fix.awayLogo} alt="" style={S.logo}/>:<span style={S.flag}>{FLAGS[fix.away]||"🏳️"}</span>}
                </div>
              </div>

              <button onClick={()=>onSave(fix.id,hv,av)} disabled={locked}
                style={{...S.saveBtn,...(locked?S.saveLocked:{}),...(isSaved?S.saveDone:{})}}>
                {isSaved?"✓ Saved!":locked?(fix.isLive?"🔴 Live — Locked":fix.isDone?"✓ Final Result":"🔒 Locked"):pred?"Update Pick":"Save Pick"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════ STANDINGS TAB ════════════════════════════════════
function StandingsTab({allFixtures,liveResults,predictions}) {
  const [selG,setSelG]=useState("A");
  const rows=calcGroupStandings(selG,allFixtures,liveResults,predictions);
  return (
    <div style={S.sec}>
      <div style={S.pageTitle}>Group Standings</div>
      <div style={S.pillRow}>
        {GROUPS_LIST.map(g=>(
          <button key={g} onClick={()=>setSelG(g)} style={{...S.gpill,...(selG===g?S.gpillOn:{})}}>Grp {g}</button>
        ))}
      </div>
      <div style={S.teamChips}>
        {GROUPS_TEAMS[selG].map(t=>(
          <div key={t} style={S.teamChip}><span>{FLAGS[t]||"🏳️"}</span><span style={{fontSize:12}}>{t}</span></div>
        ))}
      </div>
      <div style={S.tblWrap}>
        <table style={S.tbl}>
          <thead><tr style={S.thead}>
            <th style={{...S.th,textAlign:"left",width:24}}>#</th>
            <th style={{...S.th,textAlign:"left"}}>Team</th>
            <th style={S.th}>MP</th><th style={S.th}>W</th><th style={S.th}>D</th><th style={S.th}>L</th>
            <th style={S.th}>GD</th><th style={{...S.th,color:"#f59e0b"}}>PTS</th>
          </tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.team} style={{...S.tr,...(i<2?S.trQ:{})}}>
                <td style={{...S.td,color:i<2?"#22c55e":"#6b7280",fontWeight:800}}>{i+1}</td>
                <td style={{...S.td,textAlign:"left"}}><span style={{marginRight:6}}>{FLAGS[r.team]||"🏳️"}</span><span style={{fontWeight:600,fontSize:13}}>{r.team}</span></td>
                <td style={S.td}>{r.mp}</td><td style={S.td}>{r.w}</td><td style={S.td}>{r.d}</td><td style={S.td}>{r.l}</td>
                <td style={S.td}>{r.gf-r.ga>0?`+${r.gf-r.ga}`:r.gf-r.ga}</td>
                <td style={{...S.td,fontWeight:800,color:"#f59e0b",fontSize:16}}>{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={S.legend}><span style={S.legendDot}/>Top 2 qualify · Best 8 third-place teams also advance</div>
      <div style={S.note}>Standings reflect live scores + your predictions for unplayed matches.</div>
    </div>
  );
}

// ══════════════════ LEADERBOARD TAB ══════════════════════════════════
function LeaderboardTab({userPts,userCorrect,userName}) {
  const board=[{name:userName||"You",avatar:"👤",pts:userPts,correct:userCorrect,streak:0},...LEADERBOARD_MOCK]
    .sort((a,b)=>b.pts-a.pts).map((p,i)=>({...p,rank:i+1}));
  const medals=["🥇","🥈","🥉"];
  const top3=[board[1],board[0],board[2]].filter(Boolean);
  const heights=["82px","104px","68px"],ord=[1,0,2];
  return (
    <div style={S.sec}>
      <div style={S.pageTitle}>Rankings</div>
      <div style={S.podium}>
        {top3.map((p,i)=>(
          <div key={p.name} style={S.podSlot}>
            <div style={{fontSize:30,marginBottom:4}}>{p.avatar}</div>
            <div style={S.podName}>{p.name}</div>
            <div style={S.podPts}>{p.pts}<span style={{fontSize:10,color:"#6b7280"}}> pts</span></div>
            <div style={{...S.podBase,height:heights[i]}}><span style={{fontSize:24}}>{medals[ord[i]]}</span></div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {board.map(p=>(
          <div key={p.name} style={{...S.lRow,...(p.name===userName||p.name==="You"?S.lRowYou:{})}}>
            <div style={S.lRank}>{p.rank<=3?medals[p.rank-1]:`#${p.rank}`}</div>
            <div style={{fontSize:24}}>{p.avatar}</div>
            <div style={{flex:1}}>
              <div style={S.lName}>{p.name}{(p.name===userName||p.name==="You")&&" (You)"}</div>
              <div style={S.lSub}>{p.correct} exact{p.streak>0?` · 🔥${p.streak}`:""}</div>
            </div>
            <div style={S.lPts}>{p.pts}<span style={{fontSize:11,color:"#6b7280"}}> pts</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════ BONUS TAB ═════════════════════════════════════════
function BonusTab({answers,setAnswers,champion,setChampion,players,teams}) {
  const set=(id,v)=>setAnswers(p=>({...p,[id]:v}));
  const [advTab,setAdvTab]=useState("r32");

  const advRounds=[
    {id:"r32",label:"Round of 32",count:32,desc:"Pick all 32 teams you think will advance from the group stage"},
    {id:"qf",label:"Quarter-Finals",count:8,desc:"Pick the 8 teams you think will reach the QFs"},
    {id:"sf",label:"Semi-Finals",count:4,desc:"Pick your 4 semi-finalists"},
    {id:"final",label:"The Final",count:2,desc:"Pick the 2 teams that will contest the Final"},
  ];

  return (
    <div style={S.sec}>
      <div style={S.pageTitle}>Bonus Questions</div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:20}}>Lock in all answers before Jun 11 · Each correct answer = {PTS_BONUS} pts</div>

      {/* Tournament Winner */}
      <div style={S.champCard}>
        <div style={S.champTitle}>🏆 Who will WIN the World Cup?</div>
        <div style={S.champSub}>Worth {PTS_WINNER} points · The biggest call of the competition</div>
        <div style={S.champGrid}>
          {teams.map(t=>(
            <button key={t} onClick={()=>setChampion(t)} style={{...S.champBtn,...(champion===t?S.champBtnOn:{})}}>
              <span style={{fontSize:18}}>{FLAGS[t]||"🏳️"}</span>
              <span style={{fontSize:10,fontWeight:600,textAlign:"center",lineHeight:1.3}}>{t}</span>
            </button>
          ))}
        </div>
        {champion&&<div style={S.bonusLocked}>✓ Your pick: {FLAGS[champion]} {champion}</div>}
      </div>

      {/* Individual Bonus Questions */}
      <div style={S.bonusSectionTitle}>🌟 Individual Awards</div>
      {[
        {id:"topscorer",q:"Who will win the Golden Boot (Top Scorer)?",type:"player"},
        {id:"glove",q:"Who will win the Golden Glove (Best Goalkeeper)?",type:"player"},
        {id:"surprise",q:"Which team will be the biggest surprise of the tournament?",type:"team"},
        {id:"mostgoals",q:"Which team will score the most goals in the group stage?",type:"team"},
        {id:"finalgoals",q:"How many total goals will be scored in the Final?",type:"number"},
      ].map(q=>(
        <div key={q.id} style={S.bonusCard}>
          <div style={S.bonusQ}>⭐ {q.q}</div>
          {q.type==="number"&&<input type="number" min="0" value={answers[q.id]||""} onChange={e=>set(q.id,e.target.value)} placeholder="Enter a number" style={S.bonusInp}/>}
          {q.type==="player"&&(<select value={answers[q.id]||""} onChange={e=>set(q.id,e.target.value)} style={S.bonusSel}>
            <option value="">Choose a player…</option>
            {players.map(p=><option key={p} value={p}>{p}</option>)}
          </select>)}
          {q.type==="team"&&(<select value={answers[q.id]||""} onChange={e=>set(q.id,e.target.value)} style={S.bonusSel}>
            <option value="">Choose a team…</option>
            {teams.map(t=><option key={t} value={t}>{FLAGS[t]} {t}</option>)}
          </select>)}
          {answers[q.id]&&<div style={S.bonusLocked}>✓ Locked: {answers[q.id]}</div>}
        </div>
      ))}

      {/* Advancement Picks */}
      <div style={S.bonusSectionTitle}>🗓 Pick Teams to Advance</div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:12}}>Select teams before Jun 11 — {PTS_BONUS} pts for each correct pick</div>
      <div style={S.advTabRow}>
        {advRounds.map(r=>(
          <button key={r.id} onClick={()=>setAdvTab(r.id)} style={{...S.advTab,...(advTab===r.id?S.advTabOn:{})}}>
            {r.label}
          </button>
        ))}
      </div>
      {advRounds.filter(r=>r.id===advTab).map(round=>{
        const key=`adv_${round.id}`;
        const selected=answers[key]||[];
        const max=round.count;
        function toggle(t){
          const curr=answers[key]||[];
          if(curr.includes(t)) set(key,curr.filter(x=>x!==t));
          else if(curr.length<max) set(key,[...curr,t]);
        }
        return (
          <div key={round.id}>
            <div style={S.advDesc}>{round.desc}</div>
            <div style={S.advProgress}>
              <div style={{...S.advProgressFill,width:`${(selected.length/max)*100}%`}}/>
            </div>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:12,textAlign:"right"}}>{selected.length}/{max} selected</div>
            <div style={S.champGrid}>
              {teams.map(t=>(
                <button key={t} onClick={()=>toggle(t)}
                  style={{...S.champBtn,...(selected.includes(t)?S.champBtnOn:{}),...(!selected.includes(t)&&selected.length>=max?S.champBtnDisabled:{})}}>
                  <span style={{fontSize:18}}>{FLAGS[t]||"🏳️"}</span>
                  <span style={{fontSize:10,fontWeight:600,textAlign:"center",lineHeight:1.3}}>{t}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════ STATS TAB ═════════════════════════════════════════
function StatsTab({allFixtures,predictions,liveResults,totalPts,predictedCount,totalFixtures}) {
  const resMap=allFixtures.reduce((acc,fix)=>{
    const r=liveResults[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);
    if(r) acc[fix.id]=r; return acc;
  },{});
  const played=Object.keys(resMap).length;
  const exact=Object.keys(predictions).filter(id=>calcPoints(predictions[id],resMap[id])===PTS_EXACT).length;
  const correct=Object.keys(predictions).filter(id=>(calcPoints(predictions[id],resMap[id])||0)>=PTS_RESULT).length;
  const acc=predictedCount>0?Math.round((exact/Math.min(predictedCount,played||1))*100):0;

  return (
    <div style={S.sec}>
      <div style={S.pageTitle}>My Stats</div>
      <div style={S.statsGrid}>
        {[
          {label:"Total Points",value:totalPts,icon:"🏅",color:"#f59e0b"},
          {label:"Exact Scores",value:exact,icon:"🎯",color:"#22c55e"},
          {label:"Correct Results",value:correct,icon:"✅",color:"#3b82f6"},
          {label:"Accuracy",value:`${acc}%`,icon:"📈",color:"#a855f7"},
          {label:"Picks Made",value:`${predictedCount}/${totalFixtures}`,icon:"✍️",color:"#ec4899"},
          {label:"Avg / Match",value:played>0?(totalPts/played).toFixed(1):"0.0",icon:"⚡",color:"#06b6d4"},
        ].map(c=>(
          <div key={c.label} style={S.statCard}>
            <div style={{...S.statIco,background:c.color+"22",color:c.color}}>{c.icon}</div>
            <div style={S.statVal}>{c.value}</div>
            <div style={S.statLbl}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════ RULES TAB ═════════════════════════════════════════
function RulesTab() {
  return (
    <div style={S.sec}>
      <div style={S.pageTitle}>📖 How to Play</div>

      {/* Intro */}
      <div style={S.rulesIntro}>
        Welcome to <strong style={{color:"#f59e0b"}}>Scoracle</strong> — the official prediction game for the FIFA World Cup 2026. 
        Predict scores, rack up points, and climb the leaderboard. Good luck! ⚽
      </div>

      {/* Section: Predicting */}
      <div style={S.rulesSectionTitle}>🎯 How Predictions Work</div>
      <div style={S.rulesCard}>
        <p style={S.rulesPara}>For every match, simply predict the final score. Enter your scoreline before the deadline and earn points based on how accurate you are.</p>
        <p style={S.rulesPara}>Predictions lock <strong style={{color:"#f59e0b"}}>15 minutes before kick-off</strong> — so don't leave it too late!</p>
        <p style={S.rulesPara}>For knockout games that go to penalties, enter the score <strong style={{color:"#f59e0b"}}>including penalty shootout goals</strong>.</p>
      </div>

      {/* Section: Scoring */}
      <div style={S.rulesSectionTitle}>⚡ Scoring System</div>

      <div style={S.rulesExample}>
        <div style={S.rulesExampleTitle}>Example: Mexico vs South Africa — Final score <span style={{color:"#f59e0b"}}>2–1</span></div>
        {[
          {pred:"2 – 1",pts:15,label:"Exact score + correct result",breakdown:"+10 scoreline, +5 result",color:"#22c55e"},
          {pred:"1 – 0",pts:5,label:"Correct result (Mexico win), wrong score",breakdown:"+5 result only",color:"#f59e0b"},
          {pred:"1 – 2",pts:0,label:"Wrong result (South Africa win)",breakdown:"+0 points",color:"#ef4444"},
          {pred:"1 – 1",pts:0,label:"Wrong result (draw predicted)",breakdown:"+0 points",color:"#ef4444"},
        ].map(e=>(
          <div key={e.pred} style={S.rulesExRow}>
            <div style={S.rulesExPred}>{e.pred}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:e.color}}>{e.label}</div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{e.breakdown}</div>
            </div>
            <div style={{...S.rulesExPts,color:e.color}}>+{e.pts}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
        {[
          {pts:10,label:"Exact Scoreline",desc:"You predicted the exact final score",color:"#22c55e"},
          {pts:5,label:"Correct Result",desc:"Right outcome (win/draw/loss) but wrong score",color:"#f59e0b"},
          {pts:0,label:"Wrong Result",desc:"Incorrect outcome — no points awarded",color:"#ef4444"},
        ].map(r=>(
          <div key={r.pts} style={S.ruleRow}>
            <div style={{...S.rulePts,color:r.color}}>+{r.pts}</div>
            <div><div style={S.ruleTitle}>{r.label}</div><div style={S.ruleSub}>{r.desc}</div></div>
          </div>
        ))}
      </div>

      {/* Section: Knockout */}
      <div style={S.rulesSectionTitle}>🏟 Knockout Stages</div>
      <div style={S.rulesCard}>
        <p style={S.rulesPara}>The same scoring system applies in all knockout rounds (Round of 32, Round of 16, Quarter-Finals, Semi-Finals, Final).</p>
        <p style={S.rulesPara}>If a match goes to extra time or penalties, enter the <strong style={{color:"#f59e0b"}}>total score including all goals</strong> — penalty shootout goals count.</p>
      </div>

      {/* Section: Bonus */}
      <div style={S.rulesSectionTitle}>⭐ Bonus Points</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[
          {pts:50,label:"Tournament Winner",desc:"Correctly predict the World Cup champion",color:"#f59e0b"},
          {pts:10,label:"Advancement Picks",desc:"Each team correctly picked to advance per round (R32, QF, SF, Final)",color:"#a855f7"},
          {pts:10,label:"Golden Boot",desc:"Correctly predict the tournament top scorer",color:"#22c55e"},
          {pts:10,label:"Golden Glove",desc:"Correctly predict the best goalkeeper",color:"#22c55e"},
          {pts:10,label:"Other Bonus Questions",desc:"Biggest surprise team, most group stage goals, Final total goals",color:"#06b6d4"},
        ].map(r=>(
          <div key={r.label} style={S.ruleRow}>
            <div style={{...S.rulePts,color:r.color}}>+{r.pts}</div>
            <div><div style={S.ruleTitle}>{r.label}</div><div style={S.ruleSub}>{r.desc}</div></div>
          </div>
        ))}
      </div>

      {/* Section: Deadline */}
      <div style={S.rulesSectionTitle}>🔒 Deadlines</div>
      <div style={S.rulesCard}>
        <p style={S.rulesPara}><strong style={{color:"#f59e0b"}}>Match predictions</strong> lock 15 minutes before each individual kick-off.</p>
        <p style={S.rulesPara}><strong style={{color:"#f59e0b"}}>All bonus questions</strong> (including advancement picks and tournament winner) must be submitted before the opening match on <strong>June 11, 2026</strong>.</p>
        <p style={S.rulesPara}>Once locked, predictions cannot be changed. Make sure yours are in!</p>
      </div>

      <div style={{...S.rulesCard,marginTop:16,textAlign:"center",fontSize:16}}>
        Good luck everyone! ⚽🏆
      </div>
    </div>
  );
}

function Confetti() {
  const cols=["#f59e0b","#22c55e","#3b82f6","#ef4444","#a855f7","#fff","#06b6d4"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {Array.from({length:22},(_,i)=>(
        <div key={i} className="cp" style={{position:"absolute",top:-10,borderRadius:2,
          left:`${Math.random()*100}%`,width:`${5+Math.random()*7}px`,height:`${5+Math.random()*7}px`,
          background:cols[i%cols.length],animationDelay:`${Math.random()*0.5}s`}}/>
      ))}
    </div>
  );
}

// ══════════════════ STYLES ════════════════════════════════════════════
const G="#f59e0b";
const S={
  root:{minHeight:"100vh",background:"#000",color:"#f9fafb",fontFamily:"'DM Sans','Segoe UI',sans-serif",maxWidth:960,margin:"0 auto",paddingBottom:72},
  // Auth
  authWrap:{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",padding:20},
  authCard:{background:"#0a0a0a",border:"1px solid #1f1f1f",borderRadius:24,padding:32,width:"100%",maxWidth:420},
  authLogo:{textAlign:"center",marginBottom:28},
  authLogoIcon:{fontSize:40,filter:`drop-shadow(0 0 12px ${G}88)`},
  authBrand:{fontSize:28,fontWeight:800,letterSpacing:4,color:G,marginTop:8},
  authTagline:{fontSize:11,color:"#6b7280",letterSpacing:1,marginTop:4},
  authToggleRow:{display:"flex",background:"#111",borderRadius:12,padding:4,marginBottom:24,gap:4},
  authToggle:{flex:1,background:"none",border:"none",color:"#6b7280",padding:"10px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.2s"},
  authToggleOn:{background:"#1f1f1f",color:G},
  authField:{marginBottom:16},
  authLabel:{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:0.5,marginBottom:6},
  authInput:{width:"100%",background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"},
  authError:{fontSize:12,color:"#ef4444",marginBottom:12,padding:"10px 12px",background:"#1f0000",borderRadius:8,border:"1px solid #ef444433"},
  authBtn:{width:"100%",background:`linear-gradient(90deg,${G},#f97316)`,border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:15,padding:"14px",cursor:"pointer",marginTop:4,letterSpacing:0.5},
  authNote:{fontSize:11,color:"#374151",textAlign:"center",marginTop:16,lineHeight:1.5},
  // Header
  header:{background:"#000",borderBottom:"1px solid #141414",padding:"14px 16px 0",position:"sticky",top:0,zIndex:100},
  headerRow:{display:"flex",alignItems:"center",gap:12,marginBottom:12},
  burger:{background:"none",border:"none",cursor:"pointer",padding:"5px 6px",display:"flex",flexDirection:"column",gap:5,borderRadius:6,flexShrink:0},
  burgerBar:{display:"block",width:22,height:2,background:G,borderRadius:2},
  brand:{flex:1,display:"flex",alignItems:"center",gap:10},
  brandIcon:{fontSize:26,filter:`drop-shadow(0 0 8px ${G}66)`},
  brandName:{fontSize:17,fontWeight:800,letterSpacing:3,color:G},
  brandSub:{fontSize:9,color:"#374151",letterSpacing:0.5},
  headerRight:{display:"flex",alignItems:"center",gap:8},
  ptsBubble:{background:"#0d0d0d",border:"1px solid #1f1f1f",borderRadius:10,padding:"5px 12px",textAlign:"center"},
  ptsNum:{display:"block",fontSize:16,fontWeight:800,color:G},
  ptsLbl:{fontSize:9,color:"#6b7280",letterSpacing:1},
  dot:{borderRadius:"50%",display:"inline-block"},
  prog:{height:2,background:"#0f0f0f"},
  progFill:{height:"100%",background:`linear-gradient(90deg,${G},#22c55e)`,transition:"width 0.6s ease",borderRadius:2},
  // Menu
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:500,backdropFilter:"blur(6px)"},
  menuPanel:{position:"fixed",top:0,left:0,bottom:0,width:290,background:"#080808",borderRight:"1px solid #1a1a1a",display:"flex",flexDirection:"column",zIndex:501,overflowY:"auto"},
  menuTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"24px 20px 16px"},
  menuBrand:{fontSize:18,fontWeight:800,letterSpacing:3,color:G},
  menuSubBrand:{fontSize:10,color:"#374151",letterSpacing:1,marginTop:2},
  closeBtn:{background:"none",border:"1px solid #222",color:"#6b7280",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:14,flexShrink:0},
  menuUser:{display:"flex",alignItems:"center",gap:10,padding:"12px 20px",background:"#0f0f0f",margin:"0 0 0"},
  menuUserAv:{fontSize:28},
  menuUserName:{fontWeight:700,fontSize:14,color:"#f9fafb"},
  menuUserEmail:{fontSize:11,color:"#6b7280"},
  divider:{height:1,background:"#141414"},
  menuItem:{display:"flex",alignItems:"center",gap:14,padding:"15px 20px",background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:14,fontWeight:500,width:"100%",textAlign:"left",borderLeft:"3px solid transparent",transition:"all 0.15s"},
  menuItemOn:{color:G,background:"#0d0d0d",borderLeftColor:G},
  menuIcon:{fontSize:18,width:24,textAlign:"center"},
  menuDot:{marginLeft:"auto",color:G,fontSize:8},
  menuFooter:{padding:"20px",marginTop:"auto"},
  statusRow:{display:"flex",alignItems:"center",gap:8,marginBottom:6},
  statusTxt:{fontSize:12,color:"#6b7280"},
  updTxt:{fontSize:11,color:"#374151",marginBottom:4},
  menuHint:{fontSize:10,color:"#1f2937",marginTop:2},
  signOutBtn:{marginTop:16,width:"100%",background:"none",border:"1px solid #1f1f1f",color:"#6b7280",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600},
  // Nav
  botNav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:960,background:"#040404",borderTop:"1px solid #141414",display:"flex",zIndex:200},
  navBtn:{flex:1,background:"none",border:"none",color:"#374151",padding:"10px 4px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative",transition:"color 0.2s"},
  navBtnOn:{color:G},
  navBar:{position:"absolute",top:0,left:"12%",width:"76%",height:2,background:G,borderRadius:"0 0 3px 3px"},
  navIco:{fontSize:19},
  navLbl:{fontSize:9,fontWeight:600,letterSpacing:0.5},
  main:{},
  sec:{padding:"16px"},
  pageTitle:{fontSize:20,fontWeight:800,marginBottom:16,letterSpacing:0.3},
  // Matchday
  mdWrap:{overflowX:"auto",padding:"14px 16px 0",display:"flex",gap:8,borderBottom:"1px solid #0f0f0f",paddingBottom:14},
  mdTab:{background:"#0a0a0a",border:"1px solid #1a1a1a",color:"#6b7280",borderRadius:12,padding:"9px 16px",cursor:"pointer",transition:"all 0.2s",textAlign:"left",flexShrink:0,minWidth:120},
  mdTabOn:{background:`${G}12`,border:`1px solid ${G}`,color:G},
  mdLabel:{fontSize:13,fontWeight:700},
  mdDates:{fontSize:10,marginTop:3,opacity:0.6},
  // Cards
  card:{background:"#080808",border:"1px solid #141414",borderRadius:16,padding:16,marginBottom:12,transition:"border-color 0.3s,box-shadow 0.3s"},
  cardSaved:{borderColor:"#22c55e",boxShadow:"0 0 18px #22c55e2a"},
  cardLive:{borderColor:"#ef444440",boxShadow:"0 0 18px #ef44441a"},
  cardMeta:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8},
  grpTag:{fontSize:10,fontWeight:800,color:G,letterSpacing:1},
  dateTxt:{fontSize:11,color:"#4b5563"},
  venueTxt:{fontSize:10,color:"#374151",marginTop:2},
  lockWarn:{fontSize:10,color:"#f59e0b",marginTop:3,fontWeight:600},
  pill:{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,color:"#fff"},
  ptsPill:{fontSize:11,fontWeight:700,color:"#fff",padding:"3px 8px",borderRadius:20},
  matchRow:{display:"flex",alignItems:"center",gap:8,marginBottom:12},
  team:{flex:1,display:"flex",alignItems:"center",gap:8},
  teamR:{justifyContent:"flex-end"},
  logo:{width:32,height:32,objectFit:"contain",borderRadius:4},
  flag:{fontSize:26},
  teamName:{fontSize:12,fontWeight:600,lineHeight:1.3},
  scoreZone:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:110},
  liveNum:{fontSize:22,fontWeight:800},
  livMin:{fontSize:10,color:"#6b7280",fontWeight:700,textAlign:"center"},
  inputRow:{display:"flex",alignItems:"center",gap:6},
  sInput:{width:44,height:44,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:20,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none"},
  sInputLocked:{opacity:0.35,cursor:"not-allowed"},
  colon:{fontSize:20,fontWeight:700,color:"#374151"},
  hint:{fontSize:10,color:"#374151"},
  saveBtn:{width:"100%",background:`linear-gradient(90deg,${G},#f97316)`,border:"none",borderRadius:10,color:"#000",fontWeight:800,fontSize:13,padding:"11px",cursor:"pointer",letterSpacing:0.5,transition:"all 0.2s"},
  saveLocked:{background:"#0f0f0f",color:"#374151",cursor:"not-allowed",border:"1px solid #1a1a1a"},
  saveDone:{background:"linear-gradient(90deg,#22c55e,#16a34a)"},
  // Standings
  pillRow:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14},
  gpill:{background:"#0a0a0a",border:"1px solid #1a1a1a",color:"#6b7280",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s"},
  gpillOn:{background:`${G}15`,border:`1px solid ${G}`,color:G},
  teamChips:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14},
  teamChip:{display:"flex",alignItems:"center",gap:5,background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:20,padding:"5px 12px",fontSize:12},
  tblWrap:{background:"#080808",border:"1px solid #141414",borderRadius:16,overflow:"hidden",marginBottom:10},
  tbl:{width:"100%",borderCollapse:"collapse"},
  thead:{background:"#0f0f0f"},
  th:{padding:"10px 8px",fontSize:11,fontWeight:700,color:"#4b5563",letterSpacing:0.5,textAlign:"center"},
  tr:{borderTop:"1px solid #0f0f0f"},
  trQ:{borderLeft:"3px solid #22c55e"},
  td:{padding:"12px 8px",fontSize:13,textAlign:"center",color:"#d1d5db"},
  legend:{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#6b7280",marginBottom:6},
  legendDot:{width:10,height:10,background:"#22c55e",borderRadius:2,flexShrink:0},
  note:{fontSize:11,color:"#374151",fontStyle:"italic"},
  // Leaderboard
  podium:{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:6,marginBottom:20,padding:"12px 0"},
  podSlot:{display:"flex",flexDirection:"column",alignItems:"center",flex:1},
  podName:{fontSize:11,fontWeight:700,textAlign:"center",marginBottom:2,color:"#d1d5db"},
  podPts:{fontSize:15,fontWeight:800,color:G,marginBottom:6},
  podBase:{width:"100%",background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:"8px 8px 0 0",display:"flex",alignItems:"center",justifyContent:"center"},
  lRow:{display:"flex",alignItems:"center",gap:12,background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px"},
  lRowYou:{border:`1px solid ${G}`,background:`${G}0a`},
  lRank:{fontSize:16,width:28,textAlign:"center",fontWeight:700},
  lName:{fontWeight:700,fontSize:14},
  lSub:{fontSize:11,color:"#6b7280",marginTop:2},
  lPts:{fontSize:20,fontWeight:800,color:G},
  // Bonus
  bonusSectionTitle:{fontSize:15,fontWeight:800,color:"#f9fafb",marginBottom:12,marginTop:24,letterSpacing:0.3},
  bonusCard:{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:16,marginBottom:12},
  bonusQ:{fontWeight:600,fontSize:14,marginBottom:10,lineHeight:1.4},
  bonusInp:{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"10px 12px",outline:"none",boxSizing:"border-box"},
  bonusSel:{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"},
  bonusLocked:{fontSize:11,color:"#22c55e",marginTop:8,fontWeight:700},
  champCard:{background:"#0a0600",border:`1px solid ${G}25`,borderRadius:16,padding:18,marginBottom:8},
  champTitle:{fontSize:18,fontWeight:800,color:G,marginBottom:4},
  champSub:{fontSize:12,color:"#6b7280",marginBottom:14},
  champGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))",gap:8,marginBottom:8},
  champBtn:{background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#9ca3af",padding:"10px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all 0.2s"},
  champBtnOn:{background:`${G}18`,border:`1px solid ${G}`,color:G},
  champBtnDisabled:{opacity:0.3,cursor:"not-allowed"},
  advTabRow:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12},
  advTab:{background:"#0a0a0a",border:"1px solid #1a1a1a",color:"#6b7280",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.2s"},
  advTabOn:{background:`${G}15`,border:`1px solid ${G}`,color:G},
  advDesc:{fontSize:12,color:"#6b7280",marginBottom:10},
  advProgress:{height:3,background:"#1a1a1a",borderRadius:2,marginBottom:6},
  advProgressFill:{height:"100%",background:`linear-gradient(90deg,${G},#22c55e)`,borderRadius:2,transition:"width 0.4s"},
  // Stats
  statsGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  statCard:{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:16,textAlign:"center"},
  statIco:{width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,margin:"0 auto 10px"},
  statVal:{fontSize:26,fontWeight:800,marginBottom:4},
  statLbl:{fontSize:11,color:"#6b7280"},
  // Rules
  rulesIntro:{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:14,padding:16,fontSize:13,color:"#9ca3af",lineHeight:1.7,marginBottom:20},
  rulesSectionTitle:{fontSize:14,fontWeight:800,color:G,letterSpacing:1,textTransform:"uppercase",marginTop:24,marginBottom:12},
  rulesCard:{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:16,marginBottom:12},
  rulesPara:{fontSize:13,color:"#9ca3af",lineHeight:1.7,marginBottom:8},
  rulesExample:{background:"#080808",border:`1px solid ${G}22`,borderRadius:14,padding:16,marginBottom:12},
  rulesExampleTitle:{fontSize:12,fontWeight:700,color:"#6b7280",marginBottom:12,letterSpacing:0.3},
  rulesExRow:{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #111"},
  rulesExPred:{fontSize:18,fontWeight:800,color:"#f9fafb",width:60,textAlign:"center",flexShrink:0},
  rulesExPts:{fontSize:20,fontWeight:800,flexShrink:0,width:36,textAlign:"right"},
  ruleRow:{display:"flex",alignItems:"flex-start",gap:14,background:"#080808",border:"1px solid #141414",borderRadius:12,padding:16,marginBottom:8},
  rulePts:{fontSize:22,fontWeight:800,width:40,flexShrink:0,textAlign:"center"},
  ruleTitle:{fontWeight:700,fontSize:14,marginBottom:4},
  ruleSub:{fontSize:12,color:"#6b7280"},
};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#000;-webkit-tap-highlight-color:transparent;}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
input[type=number]{-moz-appearance:textfield;}
input:focus,select:focus{border-color:#f59e0b!important;box-shadow:0 0 0 2px #f59e0b18!important;}
button:active{transform:scale(0.97);}
tr:hover td{background:#0c0c0c;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
.cp{animation:fall 1.4s ease-in forwards;}
@keyframes fall{0%{transform:translateY(0) rotate(0);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}
`;
