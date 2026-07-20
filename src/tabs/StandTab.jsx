import { useState } from "react";
import { useCompetition } from "../contexts/CompetitionContext";
import { localTime, localDate } from "../utils/time";
import { groupTable } from "../utils/api";
import SPill from "../components/SPill";

export function StandTab(){
  const { accentColor: G, FLAGS, GROUPS_TEAMS, GROUPS_LIST, HOME_AWAY_TO_STATIC_ID, KO_LABEL, matchdays, selDay, setSelDay, predictions, live, onSave, savedId, allFix, allPreds, profiles, currentUser } = useCompetition();
  const[view,setView]=useState("mypicks");
  const[g,setG]=useState("A");
  const[round,setRound]=useState("r32");
  const isKnockoutPhase=allFix.some(function(f){return f.isKnockout&&(f.isDone||f.isLive);});
  const rows=groupTable(g,allFix,live,predictions,GROUPS_TEAMS);
  function liveGroupTable(gKey){
    const teams=GROUPS_TEAMS[gKey]||[];const t={};
    teams.forEach(function(tm){t[tm]={team:tm,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});
    allFix.filter(function(f){return(f.group||"").toUpperCase().replace(/GROUP/i,"").trim()===gKey&&(f.isDone||f.isLive)&&!f.isKnockout;}).forEach(function(fix){
      const src=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);if(!src||src.homeGoals==null)return;
      const hg=+src.homeGoals,ag=+src.awayGoals,h=t[fix.home],a=t[fix.away];if(!h||!a)return;
      h.mp++;a.mp++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;
      if(hg>ag){h.w++;h.pts+=3;a.l++;}else if(hg<ag){a.w++;a.pts+=3;h.l++;}else{h.d++;h.pts++;a.d++;a.pts++;}
    });
    return Object.values(t).sort(function(a,b){return b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf;});
  }
  const liveRows=liveGroupTable(g);
  const roundMap={"r32":"R32","r16":"R16","qf":"QF","sf":"SF","final":"Final"};
  const knockoutFix=allFix.filter(function(f){return f.isKnockout&&f.group===roundMap[round];});
  const liveFix=knockoutFix.filter(function(f){return f.isLive;});
  const doneFix=knockoutFix.filter(function(f){return f.isDone&&!f.isLive;});
  const upcomingFix=knockoutFix.filter(function(f){return !f.isLive&&!f.isDone;});
  function KOMatch({fix}){
    const result=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals,wentToET:fix.wentToET||false,wentToPens:fix.wentToPens||false,penHome:fix.penHome,penAway:fix.penAway}:null);
    const homeWon=result&&result.homeGoals>result.awayGoals;const awayWon=result&&result.awayGoals>result.homeGoals;
    return(<div style={{background:"#080808",border:fix.isLive?"1px solid rgba(239,68,68,0.3)":"1px solid #141414",borderRadius:14,padding:14,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:10,color:"#4b5563"}}>{localDate(fix.kickoffISO)} · {fix.venue||""}</span>
        <SPill status={fix.status} elapsed={fix.elapsed}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:20}}>{FLAGS[fix.home]||"🏳"}</span><span style={{fontSize:13,fontWeight:700,color:result?(homeWon?"#f59e0b":"#4b5563"):"#f9fafb"}}>{fix.home}</span></div>
        <div style={{textAlign:"center",minWidth:76}}>
          {result!=null?<><span style={{fontSize:24,fontWeight:800,display:"block",color:fix.isLive?"#ef4444":"#f9fafb"}}>{result.homeGoals} - {result.awayGoals}</span>{result.wentToPens&&result.penHome!=null&&<span style={{fontSize:9,color:"#6b7280",display:"block"}}>Pens: {result.penHome}–{result.penAway}</span>}</>:<span style={{fontSize:15,fontWeight:700,color:"#374151",display:"block"}}>vs</span>}
          {!result&&<span style={{fontSize:9,color:"#4b5563"}}>{localTime(fix.kickoffISO)}</span>}
          {fix.isLive&&<span style={{fontSize:9,color:"#ef4444",fontWeight:700}}>{fix.elapsed}'</span>}
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}><span style={{fontSize:13,fontWeight:700,textAlign:"right",color:result?(awayWon?"#f59e0b":"#4b5563"):"#f9fafb"}}>{fix.away}</span><span style={{fontSize:20}}>{FLAGS[fix.away]||"🏳"}</span></div>
      </div>
    </div>);
  }
  return(<div style={{padding:16}}>
    <div style={{fontSize:20,fontWeight:800,marginBottom:16,letterSpacing:0.3}}>Standings</div>
    <div style={{display:"flex",background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:12,padding:4,gap:4,marginBottom:16}}>
      {[{id:"mypicks",label:"My Predictions"},{id:"liveworld",label:"Live World Cup"}].map(function(t){return(
        <button key={t.id} onClick={function(){setView(t.id);}} style={{flex:1,textAlign:"center",padding:"9px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",color:view===t.id?G:"#6b7280",border:"none",background:view===t.id?"#1a1a1a":"none",outline:"none"}}>{t.label}</button>
      );})}
    </div>
    {view==="mypicks"&&<>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>{GROUPS_LIST.map(x=><button key={x} onClick={()=>setG(x)} style={{background:g===x?`${G}15`:"#0a0a0a",border:g===x?`1px solid ${G}`:"1px solid #1a1a1a",color:g===x?G:"#6b7280",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Group {x}</button>)}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>{GROUPS_TEAMS[g].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:5,background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:20,padding:"5px 12px",fontSize:12}}><span>{FLAGS[t]||"🏳️"}</span><span>{t}</span></div>)}</div>
      <div style={{background:"#080808",border:"1px solid #141414",borderRadius:16,overflow:"hidden",marginBottom:10}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#0f0f0f"}}><th style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:"#4b5563",textAlign:"left",width:24}}>#</th><th style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:"#4b5563",textAlign:"left"}}>Team</th>{["MP","W","D","L","GD","PTS"].map(h=><th key={h} style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:h==="PTS"?"#f59e0b":"#4b5563",textAlign:"center"}}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r,i)=>(<tr key={r.team} style={{borderTop:"1px solid #0f0f0f",...(i<2?{borderLeft:"3px solid #22c55e"}:{})}}><td style={{padding:"12px 8px",fontSize:13,color:i<2?"#22c55e":"#6b7280",fontWeight:800}}>{i+1}</td><td style={{padding:"12px 8px",fontSize:13,textAlign:"left"}}><span style={{marginRight:6}}>{FLAGS[r.team]||"🏳️"}</span><span style={{fontWeight:600,fontSize:13}}>{r.team}</span></td>{[r.mp,r.w,r.d,r.l,r.gf-r.ga>0?`+${r.gf-r.ga}`:r.gf-r.ga].map((v,j)=><td key={j} style={{padding:"12px 8px",fontSize:13,textAlign:"center",color:"#d1d5db"}}>{v}</td>)}<td style={{padding:"12px 8px",fontSize:16,textAlign:"center",fontWeight:800,color:"#f59e0b"}}>{r.pts}</td></tr>))}</tbody>
        </table>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#6b7280",marginBottom:6}}><span style={{width:10,height:10,background:"#22c55e",borderRadius:2,flexShrink:0,display:"inline-block"}}/>Top 2 qualify · Best 8 third-place teams also advance</div>
      <div style={{fontSize:11,color:"#374151",fontStyle:"italic"}}>Standings reflect live scores + your predictions for unplayed matches.</div>
    </>}
    {view==="liveworld"&&<>
      {!isKnockoutPhase&&<>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>{GROUPS_LIST.map(function(x){return(<button key={x} onClick={function(){setG(x);}} style={{background:g===x?"#f59e0b":"#0f0f0f",border:g===x?"none":"1px solid #1f1f1f",color:g===x?"#000":"#6b7280",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",outline:"none"}}>Group {x}</button>);})}</div>
        <div style={{background:"#080808",border:"1px solid #141414",borderRadius:16,overflow:"hidden",marginBottom:12}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#0f0f0f"}}><th style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:"#4b5563",textAlign:"left",width:24}}>#</th><th style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:"#4b5563",textAlign:"left"}}>Team</th>{["MP","W","D","L","GD","PTS"].map(function(h){return<th key={h} style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:h==="PTS"?"#f59e0b":"#4b5563",textAlign:"center"}}>{h}</th>;})}</tr></thead>
            <tbody>{liveRows.map(function(r,i){return(<tr key={r.team} style={{borderTop:"1px solid #0f0f0f",borderLeft:i<2?"3px solid #22c55e":i===2?"3px solid #f59e0b":"none"}}><td style={{padding:"12px 8px",fontSize:13,color:i<2?"#22c55e":i===2?"#f59e0b":"#6b7280",fontWeight:800}}>{i+1}</td><td style={{padding:"12px 8px",fontSize:13}}><span style={{marginRight:6}}>{FLAGS[r.team]||"🏳️"}</span><span style={{fontWeight:600}}>{r.team}</span></td>{[r.mp,r.w,r.d,r.l,r.gf-r.ga>0?`+${r.gf-r.ga}`:r.gf-r.ga].map(function(v,j){return<td key={j} style={{padding:"12px 8px",fontSize:13,textAlign:"center",color:"#d1d5db"}}>{v}</td>;})}<td style={{padding:"12px 8px",fontSize:16,textAlign:"center",fontWeight:800,color:"#f59e0b"}}>{r.pts}</td></tr>);})}</tbody>
          </table>
        </div>
        <div style={{display:"flex",gap:12,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#6b7280"}}><div style={{width:3,height:14,background:"#22c55e",borderRadius:2}}/>Advance to R32</div>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#6b7280"}}><div style={{width:3,height:14,background:"#f59e0b",borderRadius:2}}/>Potential best 3rd</div>
        </div>
        <div style={{fontSize:11,fontWeight:800,color:"#6b7280",letterSpacing:1,marginBottom:10}}>GROUP {g} MATCHES</div>
        {allFix.filter(function(f){return(f.group||"").toUpperCase().replace(/GROUP/i,"").trim()===g&&!f.isKnockout;}).map(function(fix){
          const result=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);
          return(<div key={fix.id} style={{background:"#080808",border:fix.isLive?"1px solid rgba(239,68,68,0.3)":"1px solid #141414",borderRadius:14,padding:14,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:10,color:"#4b5563"}}>{localDate(fix.kickoffISO)} · {fix.venue||""}</span>
              <SPill status={fix.status} elapsed={fix.elapsed}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:20}}>{FLAGS[fix.home]||"🏳"}</span><span style={{fontSize:13,fontWeight:700,color:result&&result.homeGoals>result.awayGoals?"#f59e0b":result?"#4b5563":"#f9fafb"}}>{fix.home}</span></div>
              <div style={{textAlign:"center",minWidth:76}}>
                {result!=null?<span style={{fontSize:24,fontWeight:800,display:"block",color:fix.isLive?"#ef4444":"#f9fafb"}}>{result.homeGoals} - {result.awayGoals}</span>:<span style={{fontSize:15,fontWeight:700,color:"#374151",display:"block"}}>vs</span>}
                {!fix.isLive&&!fix.isDone&&<span style={{fontSize:9,color:"#4b5563"}}>{localTime(fix.kickoffISO)}</span>}
                {fix.isLive&&<span style={{fontSize:9,color:"#ef4444",fontWeight:700}}>{fix.elapsed}'</span>}
              </div>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}><span style={{fontSize:13,fontWeight:700,textAlign:"right",color:result&&result.awayGoals>result.homeGoals?"#f59e0b":result?"#4b5563":"#f9fafb"}}>{fix.away}</span><span style={{fontSize:20}}>{FLAGS[fix.away]||"🏳"}</span></div>
            </div>
          </div>);
        })}
      </>}
      {isKnockoutPhase&&<>
        <div style={{display:"flex",gap:6,overflow:"auto",paddingBottom:4,marginBottom:14,scrollbarWidth:"none"}}>{[{id:"r32",label:"R32"},{id:"r16",label:"R16"},{id:"qf",label:"QF"},{id:"sf",label:"SF"},{id:"final",label:"Final"}].map(function(r){return(<button key={r.id} onClick={function(){setRound(r.id);}} style={{background:round===r.id?"#f59e0b":"#0f0f0f",border:round===r.id?"none":"1px solid #1f1f1f",color:round===r.id?"#000":"#6b7280",borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,outline:"none"}}>{r.label}</button>);})}</div>
        {liveFix.length>0&&<><div style={{fontSize:11,fontWeight:800,color:"#ef4444",letterSpacing:1,marginBottom:8}}>LIVE NOW</div>{liveFix.map(function(fix){return<KOMatch key={fix.id} fix={fix}/>;})}</>}
        {doneFix.length>0&&<><div style={{fontSize:11,fontWeight:800,color:"#6b7280",letterSpacing:1,marginBottom:8,marginTop:liveFix.length>0?12:0}}>COMPLETED</div>{doneFix.map(function(fix){return<KOMatch key={fix.id} fix={fix}/>;})}</>}
        {upcomingFix.length>0&&<><div style={{fontSize:11,fontWeight:800,color:"#6b7280",letterSpacing:1,marginBottom:8,marginTop:doneFix.length>0||liveFix.length>0?12:0}}>UPCOMING</div>{upcomingFix.map(function(fix){return<KOMatch key={fix.id} fix={fix}/>;})}</>}
        {knockoutFix.length===0&&<div style={{textAlign:"center",padding:40,color:"#374151",fontSize:14}}>No matches yet for this round</div>}
      </>}
    </>}
  </div>);
}
