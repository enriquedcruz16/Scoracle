import { useState } from "react";
import { useCompetition } from "../contexts/CompetitionContext";
import { PTS_WINNER, PTS_BONUS } from "../utils/scoring";
import { ADV_ROUNDS, BONUS_LOCK_ISO, BONUS_QUESTIONS } from "../constants/wc2026/bonus";

const ADMIN_ID = "0c51030f-a4ce-4e6c-8c4c-87ffba2acae2";

function AdvRound({round,bonus,onSave,bonusLocked,downstreamIds}){
  const{FLAGS,ALL_TEAMS}=useCompetition();
  const key="adv_"+round.id;
  const saved=bonus[key]?JSON.parse(bonus[key]):[];
  const[draft,setDraft]=useState(saved);
  const isDirty=JSON.stringify([...draft].sort())!==JSON.stringify([...saved].sort());
  const prevKey=round.prevId?"adv_"+round.prevId:null;
  const pool=prevKey&&bonus[prevKey]?JSON.parse(bonus[prevKey]):null;
  const displayTeams=pool||ALL_TEAMS;
  function toggle(t){if(bonusLocked)return;setDraft(function(c){return c.includes(t)?c.filter(function(x){return x!==t;}):c.length<round.count?[...c,t]:c;});}
  function handleSave(){onSave(key,JSON.stringify(draft));if(isDirty&&downstreamIds){downstreamIds.forEach(function(did){onSave("adv_"+did,JSON.stringify([]));});}}
  var validDraft=pool?draft.filter(function(t){return pool.includes(t);}):draft;
  return(<div>
    <div style={{fontSize:12,color:"#6b7280",marginBottom:6}}>{round.desc}</div>
    {pool&&<div style={{fontSize:11,color:"#374151",marginBottom:10}}>Showing your {pool.length} picks from previous round</div>}
    <div style={{height:3,background:"#1a1a1a",borderRadius:2,marginBottom:6}}><div style={{height:"100%",background:bonusLocked?"linear-gradient(90deg,#374151,#4b5563)":"linear-gradient(90deg,#f59e0b,#22c55e)",width:(validDraft.length/round.count*100)+"%",borderRadius:2,transition:"width 0.4s"}}/></div>
    <div style={{fontSize:11,color:bonusLocked?"#4b5563":"#6b7280",marginBottom:12,textAlign:"right"}}>{validDraft.length}/{round.count} selected</div>
    {pool&&pool.length===0&&(<div style={{textAlign:"center",padding:"20px",background:"#0a0a0a",borderRadius:10,border:"1px solid #1f1f1f",marginBottom:12}}><div style={{fontSize:20,marginBottom:6}}>⚠️</div><div style={{fontSize:12,color:"#6b7280"}}>Save your previous round picks first</div></div>)}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))",gap:8,marginBottom:16}}>
      {displayTeams.map(function(t){return(<button key={t} onClick={function(){toggle(t);}} style={{background:validDraft.includes(t)?"rgba(245,158,11,0.12)":"#0f0f0f",border:validDraft.includes(t)?"1px solid #f59e0b":"1px solid #1f1f1f",borderRadius:10,color:validDraft.includes(t)?"#f59e0b":"#9ca3af",padding:"10px 6px",cursor:bonusLocked?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,opacity:(!validDraft.includes(t)&&validDraft.length>=round.count)||bonusLocked?0.4:1,transition:"all 0.15s",outline:"none"}}><span style={{fontSize:18}}>{FLAGS[t]||"🏳"}</span><span style={{fontSize:10,fontWeight:600,textAlign:"center",lineHeight:1.3}}>{t}</span></button>);})}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:12,borderTop:"1px solid #111"}}>
      <div style={{flex:1,fontSize:11,fontWeight:isDirty||saved.length>0?700:400,color:bonusLocked?"#4b5563":isDirty?"#f59e0b":saved.length>0?"#22c55e":"#374151"}}>{bonusLocked?"Locked":isDirty?"Unsaved changes — downstream picks will reset":saved.length>0?"All picks saved":"No picks yet"}</div>
      <button onClick={handleSave} disabled={bonusLocked||!isDirty} style={{background:bonusLocked?"#0f0f0f":!isDirty&&saved.length>0?"linear-gradient(90deg,#22c55e,#16a34a)":isDirty?"linear-gradient(90deg,#f59e0b,#f97316)":"#0f0f0f",border:isDirty||(!isDirty&&saved.length>0)?"none":"1px solid #1f1f1f",borderRadius:10,color:bonusLocked?"#374151":!isDirty&&saved.length>0?"#fff":isDirty?"#000":"#374151",fontWeight:800,fontSize:12,padding:"10px 18px",cursor:bonusLocked||!isDirty?"default":"pointer",whiteSpace:"nowrap",outline:"none",transition:"all 0.2s"}}>{bonusLocked?"Locked":!isDirty&&saved.length>0?"Saved":"Save Picks"}</button>
    </div>
  </div>);
}

function BonusQuestion({q,saved,onSave,bonusLocked}){
  const{FLAGS,PLAYERS,ALL_TEAMS}=useCompetition();
  const[draft,setDraft]=useState(saved||"");
  const isDirty=draft&&draft!==saved;
  return(<div style={{background:"#080808",border:"1px solid "+(saved?"#22c55e33":"#141414"),borderRadius:14,padding:16,marginBottom:12,transition:"border-color 0.3s"}}>
    <div style={{fontWeight:600,fontSize:14,marginBottom:10}}>{q.q}</div>
    {q.type==="player"&&<select value={draft} onChange={function(e){if(!bonusLocked)setDraft(e.target.value);}} disabled={bonusLocked} style={{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box",marginBottom:10,opacity:bonusLocked?0.5:1,cursor:bonusLocked?"default":"pointer"}}><option value="">Choose a player...</option>{PLAYERS.map(function(p){return <option key={p} value={p}>{p}</option>;})}</select>}
    {q.type==="team"&&<select value={draft} onChange={function(e){if(!bonusLocked)setDraft(e.target.value);}} disabled={bonusLocked} style={{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box",marginBottom:10,opacity:bonusLocked?0.5:1,cursor:bonusLocked?"default":"pointer"}}><option value="">Choose a team...</option>{ALL_TEAMS.map(function(t){return <option key={t} value={t}>{FLAGS[t]||""} {t}</option>;})}</select>}
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,fontSize:11,color:bonusLocked?"#4b5563":saved?"#22c55e":"#374151",fontWeight:saved?700:400}}>{bonusLocked?"Locked":saved?"Saved: "+saved:"No answer yet"}</div>
      <button onClick={function(){if(draft&&!bonusLocked)onSave(q.id,draft);}} disabled={bonusLocked||!draft||!isDirty} style={{background:bonusLocked?"#0f0f0f":saved&&!isDirty?"linear-gradient(90deg,#22c55e,#16a34a)":draft&&isDirty?"linear-gradient(90deg,#f59e0b,#f97316)":"#0f0f0f",border:!bonusLocked&&(draft&&isDirty||saved&&!isDirty)?"none":"1px solid #1f1f1f",borderRadius:9,color:bonusLocked?"#374151":saved&&!isDirty?"#fff":draft&&isDirty?"#000":"#374151",fontWeight:800,fontSize:12,padding:"9px 16px",cursor:bonusLocked||!isDirty?"default":"pointer",whiteSpace:"nowrap",transition:"all 0.2s",outline:"none"}}>{bonusLocked?"Locked":saved&&!isDirty?"Saved":"Save Pick"}</button>
    </div>
  </div>);
}

export function BonusTab(){
  const{accentColor:G,FLAGS,PLAYER_FLAGS,ALL_TEAMS,bonus,champion,setChampion,saveBonus:onSave,allBonusAnswers,profiles,currentUser,isAdmin}=useCompetition();
  const bonusLocked=new Date()>=new Date(BONUS_LOCK_ISO);
  const[bonusView,setBonusView]=useState("mypicks"); // mypicks | everyone
  const[advTab,setAdvTab]=useState("r32");
  const sortedProfiles=[...(profiles||[])].sort(function(a,b){return a.name.localeCompare(b.name);});
  const ADV_COUNTS_B={"adv_r32":32,"adv_r16":16,"adv_qf":8,"adv_sf":4,"adv_final":2};
  function getBonusStatusB(p){
    const ub=(allBonusAnswers||[]).filter(b=>b.user_id===p.id);
    const KEYS=["champion","topscorer","mostgoals","adv_r32","adv_r16","adv_qf","adv_sf","adv_final"];
    const done=KEYS.filter(function(k){
      const rec=ub.find(b=>b.question_id===k);if(!rec)return false;
      if(ADV_COUNTS_B[k]!==undefined){try{return JSON.parse(rec.answer||"[]").length===ADV_COUNTS_B[k];}catch{return false;}}
      return rec.answer&&rec.answer.trim()!=="";
    }).length;
    return{done,complete:done===8,partial:done>0&&done<8,none:done===0};
  }

  function EveryonePicks(){
    const[expanded,setExpanded]=useState({});
    const adminBonus=(allBonusAnswers||[]).filter(function(b){return b.user_id===ADMIN_ID;});
    const adminGet=function(k){return(adminBonus.find(function(b){return b.question_id===k;})||{}).answer||"";};
    return(<div>
      {sortedProfiles.map(function(p){
        const ub=(allBonusAnswers||[]).filter(b=>b.user_id===p.id);
        const get=function(k){return ub.find(b=>b.question_id===k)?.answer||"";};
        const getAdv=function(k){try{return JSON.parse(get(k)||"[]");}catch{return[];}};
        const st=getBonusStatusB(p);
        const isMe=p.id===currentUser?.id;
        const isExp=!!expanded[p.id];
        const borderC=isMe?"#f59e0b":st.complete?"rgba(34,197,94,0.25)":st.partial?"rgba(245,158,11,0.2)":"#141414";
        const statusC=isMe?"#f59e0b":st.complete?"#22c55e":st.partial?"#f59e0b":"#ef4444";
        const statusL=st.complete?"Complete":st.partial?(st.done+"/8"):"Not started";
        return(
          <div key={p.id} style={{background:isMe?"rgba(245,158,11,0.04)":"#080808",border:"1px solid "+borderC,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
            <div style={{padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontWeight:700,fontSize:14,color:isMe?"#f59e0b":"#f9fafb"}}>{p.name}{isMe?" (You)":""}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:isMe?"rgba(245,158,11,0.15)":st.complete?"rgba(34,197,94,0.15)":st.partial?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.1)",color:statusC}}>{statusL}</div>
                  <button onClick={function(){setExpanded(function(e){return{...e,[p.id]:!e[p.id]};});}} style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,color:"#6b7280",fontSize:11,fontWeight:700,padding:"4px 10px",cursor:"pointer",outline:"none"}}>{isExp?"Hide ▲":"See picks ▼"}</button>
                </div>
              </div>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>
                <span style={{color:isMe?"#f59e0b":"#f9fafb",fontWeight:600}}>Champion: </span>{get("champion")||"–"} &nbsp;·&nbsp;
                <span style={{color:isMe?"#f59e0b":"#f9fafb",fontWeight:600}}>Top Scorer: </span>{get("topscorer")||"–"} &nbsp;·&nbsp;
                <span style={{color:isMe?"#f59e0b":"#f9fafb",fontWeight:600}}>Most Goals: </span>{get("mostgoals")||"–"}
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[{l:"R32",k:"adv_r32",t:32},{l:"R16",k:"adv_r16",t:16},{l:"QF",k:"adv_qf",t:8},{l:"SF",k:"adv_sf",t:4},{l:"Final",k:"adv_final",t:2}].map(function(r){
                  const arr=getAdv(r.k);const empty=arr.length===0;
                  const ae=(allBonusAnswers||[]).find(function(b){return b.question_id===r.k.replace('adv_','actual_adv_');});let at=null;try{at=ae?JSON.parse(ae.answer):null;}catch{}
                  const correct=at?arr.filter(function(t){return at.includes(t);}).length:null;
                  const color=correct!==null?(correct===arr.length&&arr.length>0?"#22c55e":correct>0?"#f59e0b":"#ef4444"):empty?"#374151":"#f59e0b";
                  return(<span key={r.l} style={{fontSize:10,fontWeight:700,color:color}}>{r.l}: {correct!==null?correct+"/"+arr.length+" · +"+correct*PTS_BONUS:arr.length+"/"+r.t}</span>);
                })}
              </div>
            </div>
            {isExp&&(
              <div style={{borderTop:"1px solid #111",padding:"12px 14px",background:"#050505"}}>
                <div style={{fontSize:9,fontWeight:800,color:"#6b7280",letterSpacing:1,marginBottom:8}}>SPECIAL PICKS</div>
                {[{label:"🏆 Champion",k:"champion",rk:"champion_result",pts:PTS_WINNER},{label:"👟 Top Scorer",k:"topscorer",rk:"topscorer_result",pts:PTS_BONUS},{label:"⚽ Most Group Goals",k:"mostgoals",rk:"mostgoals_result",pts:PTS_BONUS}].map(function(s){
                  const pick=get(s.k);const result=adminGet(s.rk);
                  let ok=false;if(result){if(s.rk==="mostgoals_result"){let a;try{a=JSON.parse(result);}catch{a=null;}ok=Array.isArray(a)?a.includes(pick):pick===result;}else{ok=pick===result;}}
                  return(<div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div><div style={{fontSize:10,color:"#6b7280"}}>{s.label}</div><div style={{fontSize:12,fontWeight:700,color:pick?"#f9fafb":"#374151"}}>{pick||"No pick"}</div></div>
                    {result?<span style={{fontSize:11,fontWeight:700,color:ok?"#22c55e":"#ef4444",background:ok?"#052e16":"#1f0707",padding:"3px 8px",borderRadius:8}}>{ok?`✓ +${s.pts}`:"✗ +0"}</span>:<span style={{fontSize:10,color:"#374151"}}>—</span>}
                  </div>);
                })}
                <div style={{borderTop:"1px solid #111",paddingTop:10,marginBottom:8,fontSize:9,fontWeight:800,color:"#6b7280",letterSpacing:1}}>ADVANCEMENT PICKS</div>
                {[{l:"R32",k:"adv_r32",t:32},{l:"R16",k:"adv_r16",t:16},{l:"QF",k:"adv_qf",t:8},{l:"SF",k:"adv_sf",t:4},{l:"Final",k:"adv_final",t:2}].map(function(r){
                  const arr=getAdv(r.k);
                  return(<div key={r.l} style={{marginBottom:10}}>
                    {(()=>{const ae=(allBonusAnswers||[]).find(function(b){return b.question_id===r.k.replace('adv_','actual_adv_');});let at=null;try{at=ae?JSON.parse(ae.answer):null;}catch{}
                    const correct=at?arr.filter(function(t){return at.includes(t);}).length:null;
                    return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div style={{fontSize:10,fontWeight:800,color:"#6b7280",letterSpacing:1}}>{r.l} PICKS ({arr.length}/{r.t})</div>
                      {at&&<span style={{fontSize:11,fontWeight:700,color:G}}>{correct}/{arr.length} correct · +{correct*PTS_BONUS}</span>}
                    </div>);})()}
                    {arr.length===0?<div style={{fontSize:11,color:"#374151"}}>No picks saved</div>:
                    (()=>{const ae=(allBonusAnswers||[]).find(function(b){return b.question_id===r.k.replace('adv_','actual_adv_');});let at=null;try{at=ae?JSON.parse(ae.answer):null;}catch{}return(
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {arr.map(function(t){const scored=at&&at.includes(t);const wrong=at&&!at.includes(t);return(
                        <div key={t} style={{display:"flex",alignItems:"center",gap:4,background:scored?"#052e16":wrong?"#1f0707":"#111",border:"1px solid "+(scored?"#22c55e33":wrong?"#ef444433":"#1f1f1f"),borderRadius:8,padding:"4px 8px"}}>
                          <span style={{fontSize:13}}>{FLAGS[t]||"🏳"}</span>
                          <span style={{fontSize:10,fontWeight:600,color:scored?"#22c55e":wrong?"#ef4444":"#f9fafb"}}>{t}</span>
                        </div>
                      );})}
                    </div>);})()}
                  </div>);
                })}
              </div>
            )}
          </div>
        );
      })}
      {/* Hidden reveal card for html2canvas (used by AdminTab image capture) */}
      <div id="bonusRevealCard2" style={{position:"fixed",left:"-9999px",top:0,width:540,background:"#0d0d0d",borderRadius:20,overflow:"hidden",fontFamily:"sans-serif"}}>
        <div style={{background:"linear-gradient(135deg,#1a0f00,#080808)",padding:"14px",textAlign:"center",borderBottom:"1px solid #1f1f1f"}}>
          <div style={{fontSize:16,fontWeight:800,letterSpacing:4,color:"#f59e0b",marginBottom:2}}>SCORACLE</div>
          <div style={{fontSize:11,fontWeight:700,color:"#f9fafb",marginBottom:1}}>Bonus Picks Revealed!</div>
          <div style={{fontSize:9,color:"#6b7280"}}>{"World Cup 2026 - "+sortedProfiles.length+" players"}</div>
        </div>
        <div style={{padding:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:5}}>
            {[0,1].map(function(col){return(
              <div key={col} style={{display:"grid",gridTemplateColumns:"58px 1fr 1fr 1fr",gap:3,padding:"0 3px"}}>
                <div style={{fontSize:7,fontWeight:800,color:"#6b7280"}}>PLAYER</div>
                <div style={{fontSize:7,fontWeight:800,color:"#f59e0b",textAlign:"center"}}>WIN</div>
                <div style={{fontSize:7,fontWeight:800,color:"#22c55e",textAlign:"center"}}>BOOT</div>
                <div style={{fontSize:7,fontWeight:800,color:"#3b82f6",textAlign:"center"}}>GOALS</div>
              </div>
            );})}
          </div>
          {(function(){
            const half=Math.ceil(sortedProfiles.length/2);
            const left=sortedProfiles.slice(0,half);const right=sortedProfiles.slice(half);
            function renderPRow(p){
              if(!p)return <div/>;
              const ub=(allBonusAnswers||[]).filter(function(b){return b.user_id===p.id;});
              const get=function(k){return ub.find(function(b){return b.question_id===k;})?.answer||"";};
              const champ=get("champion");const boot=get("topscorer");const goals=get("mostgoals");
              const isMe=p.id===currentUser?.id;
              const firstName=p.name.split(" ")[0];
              const bootSurname=boot?boot.split(" ").slice(-1)[0].substring(0,5):"";
              return(
                <div style={{display:"grid",gridTemplateColumns:"58px 1fr 1fr 1fr",gap:3,background:isMe?"rgba(245,158,11,0.06)":"#111",borderRadius:6,padding:"4px 5px",border:isMe?"1px solid rgba(245,158,11,0.2)":"none",alignItems:"center",opacity:champ||boot||goals?1:0.3}}>
                  <div style={{fontSize:9,fontWeight:700,color:isMe?"#f59e0b":"#f9fafb",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{firstName}{isMe?" *":""}</div>
                  <div style={{textAlign:"center"}}>{champ?<div><div style={{fontSize:11}}>{FLAGS[champ]||"🏳"}</div><div style={{fontSize:6,color:isMe?"#f59e0b":"#d1d5db",marginTop:1,lineHeight:1}}>{champ.split(" ")[0].substring(0,6)}</div></div>:<div style={{fontSize:8,color:"#374151"}}>-</div>}</div>
                  <div style={{textAlign:"center"}}>{boot?<div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{fontSize:11}}>{PLAYER_FLAGS[boot]||"🌍"}</span><span style={{fontSize:6,color:isMe?"#f59e0b":"#d1d5db",lineHeight:1,marginTop:1}}>{bootSurname}</span></div>:<div style={{fontSize:8,color:"#374151"}}>-</div>}</div>
                  <div style={{textAlign:"center"}}>{goals?<div><div style={{fontSize:11}}>{FLAGS[goals]||"🏳"}</div><div style={{fontSize:6,color:isMe?"#f59e0b":"#d1d5db",marginTop:1,lineHeight:1}}>{goals.split(" ")[0].substring(0,6)}</div></div>:<div style={{fontSize:8,color:"#374151"}}>-</div>}</div>
                </div>
              );
            }
            return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>{left.map(function(p){return renderPRow(p);})}</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>{right.map(function(p){return renderPRow(p);})}</div>
            </div>);
          })()}
          <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #111",textAlign:"center",fontSize:8,color:"#374151"}}>scoracle.live - World Cup 2026 - Bonus Picks Revealed</div>
        </div>
      </div>
    </div>);
  }

  return(<div style={{padding:16}}>
    <div style={{fontSize:20,fontWeight:800,marginBottom:16,letterSpacing:0.3}}>Bonus Questions</div>
    {(bonusLocked||isAdmin)&&(
      <div style={{display:"flex",background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:12,padding:4,gap:4,marginBottom:16}}>
        {[{id:"mypicks",label:"My Picks"},{id:"everyone",label:"Everyone's Picks"}].map(function(t){return(
          <button key={t.id} onClick={function(){setBonusView(t.id);}} style={{flex:1,textAlign:"center",padding:"9px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",color:bonusView===t.id?"#f59e0b":"#6b7280",border:"none",background:bonusView===t.id?"#1a1a1a":"none",outline:"none"}}>{t.label}</button>
        );})}
      </div>
    )}
    {bonusView==="everyone"&&(bonusLocked||isAdmin)&&<EveryonePicks/>}
    {bonusView==="mypicks"&&<>
    {bonusLocked
      ?<div style={{background:"#0f0f00",border:"1px solid #f59e0b44",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>🔒</span><div><div style={{fontSize:13,fontWeight:800,color:"#f59e0b",marginBottom:2}}>Bonus questions are locked</div><div style={{fontSize:11,color:"#6b7280"}}>Competition has started</div></div></div>
      :<div style={{fontSize:12,color:"#6b7280",marginBottom:20}}>Lock in all answers before Jun 11 · Each correct = {PTS_BONUS} pts</div>
    }
    <div style={{background:"#0a0600",border:"1px solid rgba(245,158,11,0.15)",borderRadius:16,padding:18,marginBottom:12}}>
      <div style={{fontSize:18,fontWeight:800,color:"#f59e0b",marginBottom:4}}>🏆 Who will WIN the World Cup?</div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>Worth {PTS_WINNER} points</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))",gap:8,marginBottom:12}}>
        {ALL_TEAMS.map(function(t){return(
          <button key={t} onClick={function(){if(!bonusLocked)setChampion(t);}}
            style={{background:champion===t?"rgba(245,158,11,0.12)":"#0f0f0f",border:champion===t?"1px solid #f59e0b":"1px solid #1f1f1f",borderRadius:10,color:champion===t?"#f59e0b":"#9ca3af",padding:"10px 6px",cursor:bonusLocked?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,opacity:bonusLocked&&champion!==t?0.4:1,transition:"all 0.2s",outline:"none"}}>
            <span style={{fontSize:18}}>{FLAGS[t]||"🏳"}</span>
            <span style={{fontSize:10,fontWeight:600,textAlign:"center",lineHeight:1.3}}>{t}</span>
          </button>
        );})}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:12,borderTop:"1px solid #111",marginTop:4}}>
        <div style={{flex:1,fontSize:11,color:champion?"#22c55e":"#374151",fontWeight:champion?700:400}}>
          {champion?"Saved: "+(FLAGS[champion]||"")+" "+champion:"No team selected yet"}
        </div>
        {champion&&<div style={{fontSize:11,fontWeight:700,color:"#22c55e",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:8,padding:"6px 14px"}}>Saved</div>}
      </div>
    </div>
    {BONUS_QUESTIONS.map(function(q){
      return <BonusQuestion key={q.id} q={q} saved={bonus[q.id]||""} onSave={onSave} bonusLocked={bonusLocked}/>;
    })}
    <div style={{fontSize:15,fontWeight:800,marginBottom:12,marginTop:24}}>Pick Teams to Advance</div>
    {bonusLocked&&<div style={{background:"#0f0f00",border:"1px solid #f59e0b33",borderRadius:10,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>🔒</span><span style={{fontSize:12,color:"#f59e0b",fontWeight:600}}>Bonus questions are locked</span></div>}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {ADV_ROUNDS.map(function(r){return(
        <button key={r.id} onClick={function(){setAdvTab(r.id);}} style={{background:advTab===r.id?"rgba(245,158,11,0.15)":"#0a0a0a",border:advTab===r.id?"1px solid #f59e0b":"1px solid #1a1a1a",color:advTab===r.id?"#f59e0b":"#6b7280",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer",outline:"none"}}>{r.label}</button>
      );})}
    </div>
    {ADV_ROUNDS.filter(function(r){return r.id===advTab;}).map(function(round){
      return <AdvRound key={round.id} round={round} bonus={bonus} onSave={onSave} bonusLocked={bonusLocked} downstreamIds={round.downstream}/>;
    })}
    </>}
  </div>);
}
