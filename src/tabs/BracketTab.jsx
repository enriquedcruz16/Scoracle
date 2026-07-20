import { useState } from "react";
import { useCompetition } from "../contexts/CompetitionContext";
import { calcBracketStandings, getBest3rd, resolveSlot, assignBest3rd } from "../utils/api";
import { R32_BRACKET } from "../constants/wc2026/fixtures";

export function BracketTab() {
  const { accentColor: G, FLAGS, GROUPS_TEAMS, predictions, allFix, live } = useCompetition();
  const standings = calcBracketStandings(predictions, allFix, live, GROUPS_TEAMS);
  const allThirds = getBest3rd(standings);

  const resolvedBracket = assignBest3rd(
    R32_BRACKET.map(m => ({...m, home: resolveSlot(m.homeKey, standings), away: resolveSlot(m.awayKey, standings)})),
    standings, allThirds
  );
  const initR32 = resolvedBracket.map(m => ({id: m.id, label: m.label, home: m.home, away: m.away, winner: null}));

  const [r32, setR32] = useState(initR32);
  const R16_MAP = [[1,4],[0,2],[3,5],[6,7],[10,11],[8,9],[13,15],[12,14]];
  const QF_MAP = [[0,1],[2,3],[4,5],[6,7]];
  const SF_MAP = [[0,1],[2,3]];

  const [r16, setR16] = useState(Array(8).fill(null).map(() => ({home:'TBD',away:'TBD',winner:null})));
  const [qf, setQf] = useState(Array(4).fill(null).map(() => ({home:'TBD',away:'TBD',winner:null})));
  const [sf, setSf] = useState(Array(2).fill(null).map(() => ({home:'TBD',away:'TBD',winner:null})));
  const [final, setFinal] = useState({home:'TBD',away:'TBD',winner:null});
  const [resetKey, setResetKey] = useState(0);

  function advanceR32(matchIdx, winner) {
    const newR32 = [...r32]; newR32[matchIdx] = {...newR32[matchIdx], winner}; setR32(newR32);
    const r16Idx = R16_MAP.findIndex(p => p.includes(matchIdx));
    if (r16Idx > -1) {
      const slot = R16_MAP[r16Idx][0] === matchIdx ? 'home' : 'away';
      const newR16 = [...r16]; newR16[r16Idx] = {...newR16[r16Idx], [slot]: winner, winner: null}; setR16(newR16);
      const qfIdx = QF_MAP.findIndex(p => p.includes(r16Idx));
      if (qfIdx > -1) { const newQf = [...qf]; newQf[qfIdx] = {home:'TBD',away:'TBD',winner:null}; setQf(newQf); }
    }
    setFinal({home:'TBD',away:'TBD',winner:null});
  }

  function advanceR16(matchIdx, winner) {
    const newR16 = [...r16]; newR16[matchIdx] = {...newR16[matchIdx], winner}; setR16(newR16);
    const qfIdx = QF_MAP.findIndex(p => p.includes(matchIdx));
    if (qfIdx > -1) {
      const slot = QF_MAP[qfIdx][0] === matchIdx ? 'home' : 'away';
      const newQf = [...qf]; newQf[qfIdx] = {...newQf[qfIdx], [slot]: winner, winner: null}; setQf(newQf);
      const sfIdx = SF_MAP.findIndex(p => p.includes(qfIdx));
      if (sfIdx > -1) { const newSf = [...sf]; newSf[sfIdx] = {home:'TBD',away:'TBD',winner:null}; setSf(newSf); }
    }
    setFinal({home:'TBD',away:'TBD',winner:null});
  }

  function advanceQf(matchIdx, winner) {
    const newQf = [...qf]; newQf[matchIdx] = {...newQf[matchIdx], winner}; setQf(newQf);
    const sfIdx = SF_MAP.findIndex(p => p.includes(matchIdx));
    if (sfIdx > -1) {
      const slot = SF_MAP[sfIdx][0] === matchIdx ? 'home' : 'away';
      const newSf = [...sf]; newSf[sfIdx] = {...newSf[sfIdx], [slot]: winner, winner: null}; setSf(newSf);
    }
    setFinal({home:'TBD',away:'TBD',winner:null});
  }

  function advanceSf(matchIdx, winner) {
    const newSf = [...sf]; newSf[matchIdx] = {...newSf[matchIdx], winner}; setSf(newSf);
    const slot = matchIdx === 0 ? 'home' : 'away';
    setFinal(f => ({...f, [slot]: winner, winner: null}));
  }

  function reset() {
    setR32(initR32);
    setR16(Array(8).fill(null).map(() => ({home:'TBD',away:'TBD',winner:null})));
    setQf(Array(4).fill(null).map(() => ({home:'TBD',away:'TBD',winner:null})));
    setSf(Array(2).fill(null).map(() => ({home:'TBD',away:'TBD',winner:null})));
    setFinal({home:'TBD',away:'TBD',winner:null});
    setResetKey(k => k + 1);
  }

  function RoundTitle({children}) {
    return (
      <div style={{display:"flex",alignItems:"center",gap:8,margin:"20px 0 10px"}}>
        <div style={{fontSize:12,fontWeight:800,color:G,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</div>
        <div style={{flex:1,height:1,background:"#1a1a1a"}}/>
      </div>
    );
  }

  function MatchCard({match, onSelect, compact=false}) {
    const {home, away, winner} = match;
    const tbd = home === 'TBD' || away === 'TBD';
    return (
      <div style={{background:"#080808",border:`1px solid ${winner?"#f59e0b33":"#141414"}`,borderRadius:10,padding:compact?"8px 10px":"12px 14px",marginBottom:8}}>
        {match.label && !compact && <div style={{fontSize:8,color:"#374151",fontWeight:700,marginBottom:6,lineHeight:1.4}}>{match.label}</div>}
        {[home, away].map((team, i) => {
          const isWinner = winner === team;
          const isLoser = winner && winner !== team;
          return (
            <div key={i}>
              {i === 1 && <div style={{height:1,background:"#111",margin:"4px 0"}}/>}
              <button onClick={() => !tbd && team !== 'TBD' && onSelect(team)} disabled={tbd || team === 'TBD'}
                style={{width:"100%",background:"none",border:"none",cursor:tbd?"default":"pointer",padding:"3px 0",display:"flex",alignItems:"center",gap:6,borderRadius:6,transition:"background 0.15s"}}>
                <span style={{fontSize:compact?14:16}}>{FLAGS[team] || "🏳️"}</span>
                <span style={{flex:1,fontSize:compact?10:12,fontWeight:isWinner?800:isLoser?400:600,color:isWinner?G:isLoser?"#374151":"#f9fafb",textAlign:"left",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{team}</span>
                {isWinner && <span style={{fontSize:8,fontWeight:800,color:"#22c55e",background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:20,padding:"1px 5px"}}>✓</span>}
                {tbd && i === 0 && <span style={{fontSize:9,color:"#374151"}}>Pick above first</span>}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{padding:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:20,fontWeight:800}}>🗂 My Bracket</div>
        <button onClick={reset} style={{background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:8,color:"#6b7280",fontSize:11,fontWeight:700,padding:"6px 12px",cursor:"pointer"}}>↺ Reset</button>
      </div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:20}}>Tap a team to advance them · Based on your group predictions</div>

      <RoundTitle>Group Predictions</RoundTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
        {Object.entries(standings).map(([g, rows]) => (
          <div key={g} style={{background:"#080808",border:"1px solid #141414",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:9,fontWeight:800,color:G,letterSpacing:1,marginBottom:6}}>GROUP {g}</div>
            {rows.map((r, i) => (
              <div key={r.team} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                <span style={{fontSize:9,color:i<2?"#22c55e":"#4b5563",width:12,fontWeight:700}}>{i+1}</span>
                <span style={{fontSize:14}}>{FLAGS[r.team] || "🏳️"}</span>
                <span style={{fontSize:10,fontWeight:i<2?700:500,color:i<2?"#f9fafb":"#4b5563",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.team}</span>
                <span style={{fontSize:9,fontWeight:700,color:i<2?G:"#4b5563"}}>{r.pts}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <RoundTitle>Best 3rd Place Teams</RoundTitle>
      <div style={{background:"#0a0600",border:`1px solid ${G}22`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:800,color:G,marginBottom:8}}>8 of 12 third-place teams advance</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {allThirds.map((t, i) => (
            <div key={t.team} style={{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:20,background:i<8?"rgba(34,197,94,0.1)":"#111",border:i<8?"1px solid rgba(34,197,94,0.3)":"1px solid #1f1f1f",color:i<8?"#22c55e":"#4b5563",textDecoration:i>=8?"line-through":"none"}}>
              {FLAGS[t.team] || "🏳️"} {t.team} · {t.pts}pts
            </div>
          ))}
        </div>
      </div>

      <RoundTitle>Round of 32 · Tap a team to advance</RoundTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {r32.map((m, i) => <MatchCard key={`${resetKey}_r32_${i}`} match={m} onSelect={w => advanceR32(i, w)} compact/>)}
      </div>

      <RoundTitle>Round of 16</RoundTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {r16.map((m, i) => <MatchCard key={`${resetKey}_r16_${i}`} match={m} onSelect={w => advanceR16(i, w)} compact/>)}
      </div>

      <RoundTitle>Quarter-Finals</RoundTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {qf.map((m, i) => <MatchCard key={`${resetKey}_qf_${i}`} match={{...m,label:undefined}} onSelect={w => advanceQf(i, w)}/>)}
      </div>

      <RoundTitle>Semi-Finals</RoundTitle>
      {sf.map((m, i) => <MatchCard key={`${resetKey}_sf_${i}`} match={m} onSelect={w => advanceSf(i, w)}/>)}

      <RoundTitle>The Final · Jul 19 · MetLife Stadium</RoundTitle>
      {final.winner ? (
        <div style={{background:"linear-gradient(135deg,#1a0f00,#0a0a0a)",border:`1px solid ${G}44`,borderRadius:16,padding:20,textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:36,marginBottom:8}}>🏆</div>
          <div style={{fontSize:20,fontWeight:800,color:G,marginBottom:4}}>{FLAGS[final.winner] || "🏳️"} {final.winner}</div>
          <div style={{fontSize:11,color:"#6b7280"}}>Your predicted World Cup 2026 Champion</div>
        </div>
      ) : (
        <MatchCard key={`${resetKey}_final`} match={final} onSelect={w => setFinal(f => ({...f, winner: w}))}/>
      )}

      <div style={{fontSize:11,color:"#374151",textAlign:"center",fontStyle:"italic",marginTop:12,lineHeight:1.6}}>
        ⚠️ Third-place matchups are approximated — exact pairings are confirmed after all group games finish on Jun 28.
      </div>
    </div>
  );
}
