import { useState, useEffect } from "react";
import { useCompetition } from "../contexts/CompetitionContext";
import { pts, PTS_EXACT, PTS_RESULT, PTS_WINNER, PTS_BONUS } from "../utils/scoring";
import { localTime, localDate, locked } from "../utils/time";
import SPill from "../components/SPill";

const ADMIN_ID = "0c51030f-a4ce-4e6c-8c4c-87ffba2acae2";

export function RankTab(){
  const { accentColor: G, FLAGS, HOME_AWAY_TO_STATIC_ID, KO_LABEL, allFix, live, allPreds, profiles, allBonusAnswers, currentUser } = useCompetition();
  const medals=["🥇","🥈","🥉"];
  const[view,setView]=useState("leaderboard");
  const[filter,setFilter]=useState("live");
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});},[]);

  function calcBonusPoints(userId){
    const ub=(allBonusAnswers||[]).filter(b=>b.user_id===userId);
    const adminBonus=(allBonusAnswers||[]).filter(b=>b.user_id===ADMIN_ID);
    const adminGet=function(k){return adminBonus.find(b=>b.question_id===k)?.answer||"";};
    const get=function(k){return ub.find(b=>b.question_id===k)?.answer||"";};
    const getAdv=function(k){try{return JSON.parse(get(k)||"[]");}catch{return[];}};
    let bp=0,bBreakdown={winner:0,boot:0,goals:0,adv:0};
    const champResult=adminGet("champion_result");
    const bootResult=adminGet("topscorer_result");
    const goalsResult=adminGet("mostgoals_result");
    let goalsArr;try{goalsArr=JSON.parse(goalsResult);}catch{goalsArr=null;}
    const goalsMatch=goalsResult&&(Array.isArray(goalsArr)?goalsArr.includes(get("mostgoals")):get("mostgoals")===goalsResult);
    if(champResult&&get("champion")===champResult){bp+=PTS_WINNER;bBreakdown.winner=PTS_WINNER;}
    if(bootResult&&get("topscorer")===bootResult){bp+=PTS_BONUS;bBreakdown.boot=PTS_BONUS;}
    if(goalsMatch){bp+=PTS_BONUS;bBreakdown.goals=PTS_BONUS;}
    ["r32","r16","qf","sf","final"].forEach(function(rnd){
      const actual=adminGet("actual_adv_"+rnd);
      if(!actual)return;
      try{const actualTeams=JSON.parse(actual);const userPicks=getAdv("adv_"+rnd);const correct=userPicks.filter(function(t){return actualTeams.includes(t);}).length;bp+=correct*PTS_BONUS;bBreakdown.adv+=correct*PTS_BONUS;}catch{}
    });
    return{bp,bBreakdown};
  }
  function findPred(myP,fix){
    const staticId=HOME_AWAY_TO_STATIC_ID[(fix.home+"|"+fix.away).toLowerCase()];
    return myP.find(x=>x.fixture_id===fix.id)||(staticId&&myP.find(x=>x.fixture_id===staticId));
  }
  const userTotals=profiles.map(pr=>{
    const myP=allPreds.filter(p=>p.user_id===pr.id);let tp=0,exact=0,correct=0;
    allFix.forEach(fix=>{const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals,ftHome:fix.ftHome,ftAway:fix.ftAway,wentToET:fix.wentToET||false,wentToPens:fix.wentToPens||false,penHome:fix.penHome,penAway:fix.penAway,isKnockout:fix.isKnockout||false}:null);if(!r)return;const p=findPred(myP,fix);if(!p)return;const sc=pts({homeGoals:p.home_goals,awayGoals:p.away_goals,home_et:p.home_et,away_et:p.away_et,home_pens:p.home_pens,away_pens:p.away_pens},r);if(sc!=null&&sc>=PTS_EXACT){tp+=sc;exact++;}else if(sc!=null&&sc>0){tp+=sc;correct++;}});
    const{bp,bBreakdown}=calcBonusPoints(pr.id);
    return{id:pr.id,name:pr.name,pts:tp+bp,matchPts:tp,bonusPts:bp,bBreakdown,exact,correct,preds:myP};
  }).sort((a,b)=>b.pts-a.pts||b.exact-a.exact||b.correct-a.correct||a.name.localeCompare(b.name));

  const last5Fix=allFix.filter(f=>(f.isLive||f.isDone)&&(live[f.id]!=null||(f.isDone&&f.homeGoals!=null))).slice(-5);
  function getForm(u){
    return last5Fix.map(fix=>{
      const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals,ftHome:fix.ftHome,ftAway:fix.ftAway,wentToET:fix.wentToET||false,wentToPens:fix.wentToPens||false,penHome:fix.penHome,penAway:fix.penAway,isKnockout:fix.isKnockout||false}:null);
      const pred=findPred(u.preds,fix);
      if(!pred)return"n";
      const sc=pts({homeGoals:pred.home_goals,awayGoals:pred.away_goals,home_et:pred.home_et,away_et:pred.away_et,home_pens:pred.home_pens,away_pens:pred.away_pens},r);
      const maxPts=r?(r.wentToPens?PTS_EXACT*3:r.wentToET?PTS_EXACT*2:PTS_EXACT):PTS_EXACT;
      return sc===null?"n":sc===maxPts?"p":sc>0?"r":"w";
    });
  }

  const liveFix=allFix.filter(f=>f.isLive);
  const completedFix=allFix.filter(f=>f.isDone&&!f.isLive).sort((a,b)=>new Date(b.kickoffISO)-new Date(a.kickoffISO));
  const upcomingFix=allFix.filter(f=>!f.isLive&&!f.isDone);
  const filteredFix=filter==="live"?liveFix:filter==="completed"?completedFix:upcomingFix;
  useState(()=>{if(liveFix.length===0)setFilter("completed");},[]);

  function FormDot({type}){
    const cfg={p:{bg:"rgba(34,197,94,0.2)",border:"rgba(34,197,94,0.5)",c:"#22c55e",l:"P"},r:{bg:"rgba(245,158,11,0.2)",border:"rgba(245,158,11,0.5)",c:"#f59e0b",l:"R"},w:{bg:"rgba(239,68,68,0.15)",border:"rgba(239,68,68,0.4)",c:"#ef4444",l:"W"},n:{bg:"#111",border:"#222",c:"#374151",l:"–"}};
    const s=cfg[type]||cfg.n;
    return<div style={{width:14,height:14,borderRadius:"50%",background:s.bg,border:`1px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:s.c,flexShrink:0}}>{s.l}</div>;
  }

  function MatchCard({fix}){
    const result=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals,ftHome:fix.ftHome,ftAway:fix.ftAway,wentToET:fix.wentToET||false,wentToPens:fix.wentToPens||false,penHome:fix.penHome,penAway:fix.penAway,isKnockout:fix.isKnockout||false}:null);
    const isUpcoming=!locked(fix.kickoffISO)&&!fix.isLive&&!fix.isDone;
    return(
      <div style={{background:"#080808",border:`1px solid ${fix.isLive?"rgba(239,68,68,0.3)":"#141414"}`,borderRadius:16,padding:16,marginBottom:12,boxShadow:fix.isLive?"0 0 16px rgba(239,68,68,0.06)":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><span style={{fontSize:10,fontWeight:800,color:fix.isKnockout?"#a855f7":G,letterSpacing:1}}>{fix.isKnockout?(KO_LABEL[fix.group]||fix.group):`Group ${fix.group}`}</span><span style={{fontSize:11,color:"#4b5563"}}> · {localDate(fix.kickoffISO)} · {localTime(fix.kickoffISO)}</span></div>
          <SPill status={fix.status} elapsed={fix.elapsed}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{FLAGS[fix.home]||"🏳️"}</span><span style={{fontSize:13,fontWeight:600}}>{fix.home}</span></div>
          <div style={{textAlign:"center",minWidth:80}}>
            {result!=null?<><span style={{fontSize:26,fontWeight:800,display:"block",color:fix.isLive?"#ef4444":G}}>{result.homeGoals} – {result.awayGoals}</span>{result.wentToPens&&result.penHome!=null&&<div style={{fontSize:9,color:"#6b7280"}}>Pens: {result.penHome}–{result.penAway}</div>}</>:<span style={{fontSize:16,fontWeight:700,color:"#374151",display:"block"}}>vs</span>}
            {fix.isLive&&<div style={{fontSize:10,color:"#ef4444",fontWeight:700}}>{fix.elapsed}'</div>}
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}><span style={{fontSize:13,fontWeight:600,textAlign:"right"}}>{fix.away}</span><span style={{fontSize:20}}>{FLAGS[fix.away]||"🏳️"}</span></div>
        </div>
        {isUpcoming?(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"#0a0a0a",borderRadius:10,border:"1px dashed #1f1f1f",flexDirection:"column",gap:4}}>
            <span style={{fontSize:20}}>🔒</span>
            <div style={{fontSize:11,color:"#374151",fontWeight:600}}>Predictions hidden until match locks</div>
          </div>
        ):(
          <>
            {result!=null&&(()=>{
              const maxPts=result.wentToPens?PTS_EXACT*3:result.wentToET?PTS_EXACT*2:PTS_EXACT;
              const ex=userTotals.filter(u=>{const p=findPred(u.preds,fix);const s=p?pts({homeGoals:p.home_goals,awayGoals:p.away_goals,home_et:p.home_et,away_et:p.away_et,home_pens:p.home_pens,away_pens:p.away_pens},result):null;return s!=null&&s===maxPts;}).length;
              const res=userTotals.filter(u=>{const p=findPred(u.preds,fix);const s=p?pts({homeGoals:p.home_goals,awayGoals:p.away_goals,home_et:p.home_et,away_et:p.away_et,home_pens:p.home_pens,away_pens:p.away_pens},result):null;return s!=null&&s>0&&s<maxPts;}).length;
              const wrong=userTotals.filter(u=>{const p=findPred(u.preds,fix);const s=p?pts({homeGoals:p.home_goals,awayGoals:p.away_goals,home_et:p.home_et,away_et:p.away_et,home_pens:p.home_pens,away_pens:p.away_pens},result):null;return s!=null&&s===0;}).length;
              const none=userTotals.filter(u=>!findPred(u.preds,fix)).length;
              return(
                <div style={{display:"flex",gap:6,marginBottom:12}}>
                  {[{n:ex,l:"Perfect",c:"#22c55e"},{n:res,l:"Result",c:"#f59e0b"},{n:wrong,l:"Wrong",c:"#ef4444"},{n:none,l:"No pick",c:"#374151"}].map(s=>(
                    <div key={s.l} style={{flex:1,textAlign:"center",background:"#0f0f0f",borderRadius:8,padding:"5px 4px"}}>
                      <div style={{fontSize:14,fontWeight:800,color:s.c}}>{s.n}</div>
                      <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {userTotals.map(u=>{
                const pred=findPred(u.preds,fix);
                const sc=pred&&result?pts({homeGoals:pred.home_goals,awayGoals:pred.away_goals,home_et:pred.home_et,away_et:pred.away_et,home_pens:pred.home_pens,away_pens:pred.away_pens},result):null;
                const maxPts=result?(result.wentToPens?PTS_EXACT*3:result.wentToET?PTS_EXACT*2:PTS_EXACT):PTS_EXACT;
                const bg=sc!=null&&sc===maxPts?"rgba(34,197,94,0.1)":sc!=null&&sc>0?"rgba(245,158,11,0.1)":sc===0?"rgba(239,68,68,0.1)":"#111";
                const border=`1px solid ${sc!=null&&sc===maxPts?"rgba(34,197,94,0.3)":sc!=null&&sc>0?"rgba(245,158,11,0.3)":sc===0?"rgba(239,68,68,0.3)":"#1a1a1a"}`;
                const color=sc!=null&&sc===maxPts?"#22c55e":sc!=null&&sc>0?"#f59e0b":sc===0?"#ef4444":"#374151";
                return(
                  <div key={u.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,width:"calc(16.666% - 4px)"}}>
                    <div style={{fontSize:7,color:u.id===currentUser.id?G:"#6b7280",fontWeight:u.id===currentUser.id?800:600,textAlign:"center",width:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name.split(" ")[0]}</div>
                    <div style={{fontSize:fix.group!=="R32"&&fix.isKnockout?8:9,fontWeight:800,borderRadius:5,textAlign:"center",width:"100%",background:bg,border,color,...(fix.group!=="R32"&&fix.isKnockout?{height:52,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2px 1px"}:{padding:"3px 2px"})}}>
                      {pred?(fix.group!=="R32"&&fix.isKnockout&&pred.home_et!=null?<><span>{pred.home_goals}–{pred.away_goals}</span><span style={{display:"block",height:1,background:"currentColor",opacity:0.12,margin:"2px 4px",width:"calc(100% - 8px)"}}/><span>{pred.home_et}–{pred.away_et}</span>{pred.home_pens!=null&&<><span style={{display:"block",height:1,background:"currentColor",opacity:0.12,margin:"2px 4px",width:"calc(100% - 8px)"}}/><span>{pred.home_pens}–{pred.away_pens}</span></>}</>:`${pred.home_goals??"-"}–${pred.away_goals??"-"}`):"–"}
                    </div>
                  </div>
                );
              })}
            </div>
            {fix.isLive&&<div style={{fontSize:10,color:"#6b7280",textAlign:"center",marginTop:8}}>⚡ Updates every 30s</div>}
          </>
        )}
      </div>
    );
  }

  return(<div style={{padding:16}}>
    <div style={{fontSize:20,fontWeight:800,marginBottom:16,letterSpacing:0.3}}>Leaderboard</div>
    <div style={{display:"flex",background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:12,padding:4,gap:4,marginBottom:16}}>
      {[{id:"leaderboard",label:"🏆 Leaderboard"},{id:"breakdown",label:"⚽ Match Breakdown"}].map(t=>(
        <button key={t.id} onClick={()=>setView(t.id)} style={{flex:1,textAlign:"center",padding:"9px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",color:view===t.id?G:"#6b7280",border:"none",background:view===t.id?"#1a1a1a":"none",outline:"none",transition:"all 0.2s"}}>{t.label}</button>
      ))}
    </div>
    {view==="leaderboard"&&<>
      {userTotals.length>=1&&(
        <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:6,marginBottom:20,padding:"12px 0"}}>
          {[userTotals[1],userTotals[0],userTotals[2]].filter(Boolean).map((p,i)=>(
            <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
              <div style={{fontSize:22,marginBottom:4}}>👤</div>
              <div style={{fontSize:11,fontWeight:700,textAlign:"center",marginBottom:2,color:"#d1d5db"}}>{p.name}</div>
              <div style={{fontSize:14,fontWeight:800,color:G,marginBottom:6}}>{p.pts}<span style={{fontSize:10,color:"#6b7280"}}> pts</span></div>
              <div style={{width:"100%",height:["82px","104px","68px"][i],background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:"8px 8px 0 0",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:20}}>{medals[[1,0,2][i]]}</span></div>
            </div>
          ))}
        </div>
      )}
      {last5Fix.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"7px 12px",background:"#080808",border:"1px solid #141414",borderRadius:10,flexWrap:"wrap"}}>
          <div style={{fontSize:10,color:"#6b7280",fontWeight:700}}>Last 5:</div>
          {[{t:"p",l:"Perfect",c:"#22c55e"},{t:"r",l:"Result",c:"#f59e0b"},{t:"w",l:"Wrong",c:"#ef4444"},{t:"n",l:"No pick",c:"#374151"}].map(({t,l,c})=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:3}}><FormDot type={t}/><span style={{fontSize:10,color:"#6b7280"}}>{l}</span></div>
          ))}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:28}}>
        {userTotals.map((p,i)=>{
          const form=getForm(p);
          return(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,background:p.id===currentUser.id?`${G}0a`:"#080808",border:p.id===currentUser.id?`1px solid ${G}`:"1px solid #141414",borderRadius:12,padding:"10px 14px"}}>
              <div style={{fontSize:14,width:26,textAlign:"center",fontWeight:700,color:i>=3?"#6b7280":"inherit"}}>{i<3?medals[i]:`#${i+1}`}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13}}>{p.name}{p.id===currentUser.id&&" (You)"}</div>
                <div style={{fontSize:10,color:"#6b7280",marginTop:1}}>{p.exact} perfect · {p.correct} result</div>
                {(form.length>0||p.bonusPts>0)&&(
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                    {form.length>0&&<div style={{display:"flex",gap:3}}>{form.map((f,fi)=><FormDot key={fi} type={f}/>)}</div>}
                    {p.bonusPts>0&&<span style={{fontSize:9,fontWeight:800,color:"#a855f7",background:"rgba(168,85,247,0.1)",border:"1px solid rgba(168,85,247,0.2)",borderRadius:10,padding:"1px 6px"}}>⭐ +{p.bonusPts} bonus</span>}
                  </div>
                )}
              </div>
              <div style={{fontSize:18,fontWeight:800,color:G,flexShrink:0}}>{p.pts}<span style={{fontSize:10,color:"#6b7280"}}> pts</span></div>
            </div>
          );
        })}
        {userTotals.length===0&&<div style={{textAlign:"center",color:"#374151",padding:40,fontSize:14}}>No results yet — check back after June 11! ⚽</div>}
      </div>
    </>}
    {view==="breakdown"&&<>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {[{id:"live",label:`🔴 Live`,count:liveFix.length,onColor:"#ef4444",onBg:"#ef4444"},{id:"completed",label:`✅ Completed`,count:completedFix.length,onColor:"#fff",onBg:"#1f2937"},{id:"upcoming",label:`🕐 Upcoming`,count:upcomingFix.length,onColor:G,onBg:`${G}18`}].map(p=>(
          <button key={p.id} onClick={()=>setFilter(p.id)} style={{padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",border:filter===p.id?"none":`1px solid #1f1f1f`,background:filter===p.id?p.onBg:"#0f0f0f",color:filter===p.id?p.onColor:"#6b7280",outline:"none",transition:"all 0.2s"}}>
            {p.label} <span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 6px",fontSize:10,marginLeft:2}}>{p.count}</span>
          </button>
        ))}
      </div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>🟢 perfect · 🟡 result · 🔴 wrong{filter==="live"?" · Based on current score":""}</div>
      {filteredFix.length===0&&(
        <div style={{background:"#080808",border:"1px solid #141414",borderRadius:16,padding:32,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>{filter==="live"?"🔴":filter==="completed"?"✅":"🕐"}</div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{filter==="live"?"No live matches right now":filter==="completed"?"No completed matches yet":"No upcoming matches"}</div>
        </div>
      )}
      {filteredFix.map(fix=><MatchCard key={fix.id} fix={fix}/>)}
    </>}
  </div>);
}
