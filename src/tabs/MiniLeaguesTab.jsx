import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useCompetition } from "../contexts/CompetitionContext";
import { pts } from "../utils/scoring";

const ADMIN_ID = "0c51030f-a4ce-4e6c-8c4c-87ffba2acae2";

function calcMatchPts(userId, allPreds, allFix, live) {
  const pMap = Object.fromEntries(
    (allPreds || []).filter(p => p.user_id === userId)
      .map(p => [p.fixture_id, {homeGoals: p.home_goals, awayGoals: p.away_goals, home_et: p.home_et, away_et: p.away_et, home_pens: p.home_pens, away_pens: p.away_pens}])
  );
  return (allFix || []).reduce((sum, fix) => {
    const r = live[fix.id] || (fix.isDone ? {homeGoals: fix.homeGoals, awayGoals: fix.awayGoals, ftHome: fix.ftHome, ftAway: fix.ftAway, wentToET: fix.wentToET || false, wentToPens: fix.wentToPens || false, penHome: fix.penHome, penAway: fix.penAway, isKnockout: fix.isKnockout || false} : null);
    return sum + (pts(pMap[fix.id], r) || 0);
  }, 0);
}

export function MiniLeaguesTab() {
  const { accentColor: G, user, competition, allPreds, profiles, allFix, live } = useCompetition();
  const [myLeagues, setMyLeagues] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [err, setErr] = useState("");
  const [expandedLeague, setExpandedLeague] = useState(null);

  useEffect(() => { if (user) fetchMyLeagues(); }, [user]);

  async function fetchMyLeagues() {
    const { data: memberships } = await supabase.from("league_members").select("league_id").eq("user_id", user.id);
    if (!memberships?.length) { setMyLeagues([]); return; }
    const ids = memberships.map(m => m.league_id);
    const { data: leagues } = await supabase.from("leagues").select("*").in("id", ids).eq("competition_id", competition.id);
    setMyLeagues(leagues || []);
  }

  function genCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

  async function createLeague() {
    if (!createName.trim()) { setErr("Enter a league name"); return; }
    setCreating(true); setErr("");
    const code = genCode();
    const { data: league, error } = await supabase.from("leagues").insert({ competition_id: competition.id, name: createName.trim(), invite_code: code, created_by: user.id }).select().single();
    if (error) { setErr(error.message); setCreating(false); return; }
    await supabase.from("league_members").insert({ league_id: league.id, user_id: user.id });
    setCreateName(""); await fetchMyLeagues(); setCreating(false);
  }

  async function joinLeague() {
    if (!joinCode.trim()) { setErr("Enter an invite code"); return; }
    setJoining(true); setErr("");
    const { data: league } = await supabase.from("leagues").select("*").eq("invite_code", joinCode.trim().toUpperCase()).eq("competition_id", competition.id).single();
    if (!league) { setErr("League not found. Check the code and try again."); setJoining(false); return; }
    await supabase.from("league_members").upsert({ league_id: league.id, user_id: user.id }, { onConflict: "league_id,user_id", ignoreDuplicates: true });
    setJoinCode(""); await fetchMyLeagues(); setJoining(false);
  }

  return (
    <div style={{padding: 16}}>
      <div style={{fontSize: 20, fontWeight: 800, marginBottom: 16, letterSpacing: 0.3}}>👥 My Leagues</div>

      <div style={{background: "#080808", border: "1px solid #141414", borderRadius: 16, padding: 16, marginBottom: 12}}>
        <div style={{fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#f9fafb"}}>Create a League</div>
        <input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="League name..." style={{width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 10, color: "#f9fafb", fontSize: 15, padding: "12px 14px", outline: "none", boxSizing: "border-box", marginBottom: 10}}/>
        <button onClick={createLeague} disabled={creating} style={{width: "100%", background: `linear-gradient(90deg,${G},#f97316)`, border: "none", borderRadius: 12, color: "#000", fontWeight: 800, fontSize: 14, padding: "12px", cursor: "pointer", opacity: creating ? 0.6 : 1}}>
          {creating ? "Creating..." : "Create League"}
        </button>
      </div>

      <div style={{background: "#080808", border: "1px solid #141414", borderRadius: 16, padding: 16, marginBottom: 16}}>
        <div style={{fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#f9fafb"}}>Join a League</div>
        <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Invite code (e.g. ABC123)" style={{width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 10, color: "#f9fafb", fontSize: 15, padding: "12px 14px", outline: "none", boxSizing: "border-box", marginBottom: 10, letterSpacing: 2, fontFamily: "monospace"}}/>
        <button onClick={joinLeague} disabled={joining} style={{width: "100%", background: "#1a1a1a", border: `1px solid ${G}44`, borderRadius: 12, color: G, fontWeight: 800, fontSize: 14, padding: "12px", cursor: "pointer", opacity: joining ? 0.6 : 1}}>
          {joining ? "Joining..." : "Join League"}
        </button>
      </div>

      {err && <div style={{fontSize: 12, color: "#ef4444", marginBottom: 12, padding: "10px 12px", background: "#1f0000", borderRadius: 8, border: "1px solid #ef444433"}}>{err}</div>}

      {myLeagues.length === 0 && (
        <div style={{textAlign: "center", padding: "40px 20px", color: "#374151"}}>
          <div style={{fontSize: 40, marginBottom: 12}}>👥</div>
          <div style={{fontSize: 14, fontWeight: 600, color: "#6b7280"}}>No leagues yet</div>
          <div style={{fontSize: 12, marginTop: 6}}>Create one or ask a friend for an invite code</div>
        </div>
      )}

      {myLeagues.map(league => (
        <LeagueCard key={league.id} league={league} G={G} user={user} allPreds={allPreds} profiles={profiles} allFix={allFix} live={live} expanded={expandedLeague === league.id} onToggle={() => setExpandedLeague(expandedLeague === league.id ? null : league.id)}/>
      ))}
    </div>
  );
}

function LeagueCard({ league, G, user, allPreds, profiles, allFix, live, expanded, onToggle }) {
  const [memberIds, setMemberIds] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from("league_members").select("user_id").eq("league_id", league.id).then(({ data }) => {
      setMemberIds((data || []).map(m => m.user_id));
    });
  }, [league.id]);

  function copy() {
    navigator.clipboard?.writeText(league.invite_code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const leagueProfiles = profiles.filter(p => memberIds.includes(p.id));
  const ranked = leagueProfiles.map(p => ({
    ...p,
    pts: calcMatchPts(p.id, allPreds, allFix, live)
  })).sort((a, b) => b.pts - a.pts);

  return (
    <div style={{background: "#080808", border: "1px solid #141414", borderRadius: 16, padding: 16, marginBottom: 12}}>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8}}>
        <div>
          <div style={{fontWeight: 800, fontSize: 15}}>{league.name}</div>
          <div style={{fontSize: 11, color: "#6b7280", marginTop: 2}}>{memberIds.length} member{memberIds.length !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={copy} style={{background: `${G}22`, border: `1px solid ${G}44`, borderRadius: 8, color: G, fontWeight: 700, fontSize: 11, padding: "6px 12px", cursor: "pointer"}}>
          {copied ? "Copied!" : `${league.invite_code} 📋`}
        </button>
      </div>
      <button onClick={onToggle} style={{width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8, color: "#9ca3af", fontSize: 12, fontWeight: 600, padding: "8px", cursor: "pointer"}}>
        {expanded ? "▲ Hide Leaderboard" : "▼ Show Leaderboard"}
      </button>
      {expanded && (
        <div style={{marginTop: 12}}>
          {ranked.length === 0 ? (
            <div style={{fontSize: 12, color: "#374151", textAlign: "center", padding: 12}}>Loading...</div>
          ) : ranked.map((p, i) => (
            <div key={p.id} style={{display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < ranked.length - 1 ? "1px solid #111" : "none"}}>
              <span style={{fontSize: 14, fontWeight: 800, color: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : "#6b7280", width: 20, textAlign: "center"}}>{i + 1}</span>
              <span style={{flex: 1, fontSize: 13, fontWeight: p.id === user.id ? 700 : 500, color: p.id === user.id ? "#f9fafb" : "#9ca3af"}}>
                {p.name}{p.id === user.id ? " (you)" : ""}
              </span>
              <span style={{fontSize: 14, fontWeight: 800, color: G}}>{p.pts}</span>
              <span style={{fontSize: 9, color: "#4b5563"}}>pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
