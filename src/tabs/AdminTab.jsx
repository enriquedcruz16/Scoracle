import { useState } from "react";
import { supabase } from "../supabase";
import { pts, PTS_EXACT, PTS_WINNER, PTS_BONUS } from "../utils/scoring";
import { localDate, localTime } from "../utils/time";
import { FLAGS, ALL_TEAMS } from "../constants/wc2026/teams";
import { PLAYER_FLAGS } from "../constants/wc2026/bonus";
import { HOME_AWAY_TO_STATIC_ID } from "../constants/wc2026/fixtures";

const G = "#f59e0b";
const ADMIN_ID = "0c51030f-a4ce-4e6c-8c4c-87ffba2acae2";

const S = {
  pageTitle:{fontSize:20,fontWeight:800,marginBottom:16,letterSpacing:0.3},
  pill:{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,color:"#fff"},
};

function SPill({status,elapsed}){if(["1H","2H","ET"].includes(status))return <span style={{...S.pill,background:"#ef4444",animation:"pulse 1.5s infinite"}}>🔴 {elapsed}'</span>;if(status==="HT")return <span style={{...S.pill,background:"#f59e0b",color:"#000"}}>HT</span>;if(status==="PEN")return <span style={{...S.pill,background:"#1f2937"}}>PEN</span>;if(["FT","AET"].includes(status))return <span style={{...S.pill,background:"#1f2937"}}>FT</span>;return null;}

function AdminResultsSetter({allBonusAnswers,teams}){
  const adminBonus=(allBonusAnswers||[]).filter(function(b){return b.user_id===ADMIN_ID;});
  const getResult=function(k){return(adminBonus.find(function(b){return b.question_id===k;})||{}).answer||"";};
  const[champSel,setChampSel]=useState(getResult("champion_result")||"");
  const[champSaving,setChampSaving]=useState(false);
  const[champSaved,setChampSaved]=useState(false);
  async function saveChamp(){if(!champSel)return;setChampSaving(true);await supabase.from("bonus_answers").upsert({user_id:ADMIN_ID,question_id:"champion_result",answer:champSel},{onConflict:"user_id,question_id"});setChampSaving(false);setChampSaved(true);setTimeout(function(){setChampSaved(false);},2000);}
  const[bootSel,setBootSel]=useState(getResult("topscorer_result")||"");
  const[bootSaving,setBootSaving]=useState(false);
  const[bootSaved,setBootSaved]=useState(false);
  async function saveBoots(){if(!bootSel.trim())return;setBootSaving(true);await supabase.from("bonus_answers").upsert({user_id:ADMIN_ID,question_id:"topscorer_result",answer:bootSel.trim()},{onConflict:"user_id,question_id"});setBootSaving(false);setBootSaved(true);setTimeout(function(){setBootSaved(false);},2000);}
  const goalsRaw=getResult("mostgoals_result");
  function parseGoals(raw){try{const a=JSON.parse(raw);return Array.isArray(a)?a:(raw?[raw]:[]);}catch{return raw?[raw]:[];}}
  const[goalsSel,setGoalsSel]=useState(function(){return parseGoals(goalsRaw);});
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  async function saveGoals(){setSaving(true);await supabase.from("bonus_answers").upsert({user_id:ADMIN_ID,question_id:"mostgoals_result",answer:JSON.stringify(goalsSel)},{onConflict:"user_id,question_id"});setSaving(false);setSaved(true);setTimeout(function(){setSaved(false);},2000);}
  return(
    <div>
      <div style={{background:"#080808",border:"1px solid #1f1f1f",borderRadius:14,padding:"14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:800,color:G,letterSpacing:1,marginBottom:4}}>SET WORLD CUP CHAMPION</div>
        <div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>Worth 50 pts — select the tournament winner</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:6,marginBottom:10}}>
          {teams.map(function(t){const sel=champSel===t;return(
            <button key={t} onClick={function(){setChampSel(t);}} style={{background:sel?"rgba(245,158,11,0.12)":"#111",border:sel?"1px solid #f59e0b":"1px solid #1f1f1f",borderRadius:8,color:sel?"#f59e0b":"#9ca3af",padding:"8px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,outline:"none"}}>
              <span style={{fontSize:16}}>{FLAGS[t]||"🏳"}</span>
              <span style={{fontSize:9,fontWeight:600,textAlign:"center",lineHeight:1.2}}>{t}</span>
            </button>
          );})}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,fontSize:10,color:champSel?"#f9fafb":"#374151"}}>{champSel?(FLAGS[champSel]||"")+" "+champSel:"No team selected"}</div>
          <button onClick={saveChamp} disabled={champSaving||!champSel} style={{background:champSaved?"#22c55e":G,border:"none",borderRadius:8,color:"#000",fontSize:11,fontWeight:800,padding:"8px 16px",cursor:"pointer",outline:"none",opacity:!champSel?0.4:1}}>{champSaving?"Saving…":champSaved?"Saved ✓":"Save"}</button>
        </div>
      </div>
      <div style={{background:"#080808",border:"1px solid #1f1f1f",borderRadius:14,padding:"14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:800,color:G,letterSpacing:1,marginBottom:4}}>SET GOLDEN BOOT WINNER</div>
        <div style={{fontSize:10,color:"#6b7280",marginBottom:8}}>Worth 10 pts — enter the player's name exactly as submitted</div>
        <div style={{display:"flex",gap:8}}>
          <input value={bootSel} onChange={function(e){setBootSel(e.target.value);}} placeholder="e.g. Kylian Mbappe" style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:8,color:"#f9fafb",fontSize:13,padding:"8px 12px",outline:"none"}}/>
          <button onClick={saveBoots} disabled={bootSaving||!bootSel.trim()} style={{background:bootSaved?"#22c55e":G,border:"none",borderRadius:8,color:"#000",fontSize:11,fontWeight:800,padding:"8px 16px",cursor:"pointer",outline:"none",opacity:!bootSel.trim()?0.4:1}}>{bootSaving?"Saving…":bootSaved?"Saved ✓":"Save"}</button>
        </div>
      </div>
      <div style={{background:"#080808",border:"1px solid #1f1f1f",borderRadius:14,padding:"14px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:800,color:G,letterSpacing:1,marginBottom:4}}>SET MOST GROUP GOALS RESULT</div>
        <div style={{fontSize:10,color:"#6b7280",marginBottom:8}}>Select all teams tied for most group stage goals — all pickers of any selected team receive +10 pts</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
          {teams.map(function(t){const sel=goalsSel.includes(t);return(
            <button key={t} onClick={function(){setGoalsSel(function(s){return sel?s.filter(function(x){return x!==t;}):[...s,t];});}} style={{display:"flex",alignItems:"center",gap:4,background:sel?"#052e16":"#111",border:"1px solid "+(sel?"#22c55e44":"#1f1f1f"),borderRadius:8,padding:"4px 8px",cursor:"pointer",outline:"none"}}>
              <span style={{fontSize:13}}>{FLAGS[t]||"🏳"}</span>
              <span style={{fontSize:10,fontWeight:600,color:sel?"#22c55e":"#9ca3af"}}>{t}</span>
            </button>
          );})}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,fontSize:10,color:goalsSel.length?"#f9fafb":"#374151"}}>{goalsSel.length?"Selected: "+goalsSel.join(", "):"No teams selected"}</div>
          <button onClick={saveGoals} disabled={saving} style={{background:saved?"#22c55e":G,border:"none",borderRadius:8,color:"#000",fontSize:11,fontWeight:800,padding:"8px 16px",cursor:"pointer",outline:"none"}}>{saving?"Saving…":saved?"Saved ✓":"Save"}</button>
        </div>
      </div>
    </div>
  );
}

export function AdminTab({profiles,allPreds,allBonusAnswers,allFix,live,matchdays,apiIdMap,onRecalcBonus}){
  const[view,setView]=useState("overview");
  const[recalcState,setRecalcState]=useState("idle");
  const[expanded,setExpanded]=useState({});
  const[previewImg,setPreviewImg]=useState(null);const[previewName,setPreviewName]=useState("scoracle.png");
  function captureImage(cardId,filename){var card=document.getElementById(cardId);if(!card||typeof html2canvas==="undefined"){alert("Image generation not available");return;}card.style.left="0";card.style.top="0";card.style.zIndex="9999";setTimeout(function(){html2canvas(card,{backgroundColor:"#0d0d0d",scale:2,useCORS:true,logging:false}).then(function(canvas){card.style.left="-9999px";card.style.zIndex="auto";setPreviewName(filename);setPreviewImg(canvas.toDataURL("image/png"));}).catch(function(){card.style.left="-9999px";card.style.zIndex="auto";alert("Could not generate image.");});},100);}
  const totalFix=allFix.length,totalUsers=profiles.length,totalPreds=allPreds.length;
  const stats=profiles.map(p=>{const my=allPreds.filter(x=>x.user_id===p.id);let tp=0,exact=0;allFix.forEach(fix=>{const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);if(!r)return;const pred=my.find(x=>x.fixture_id===fix.id);if(!pred)return;const sc=pts({homeGoals:pred.home_goals,awayGoals:pred.away_goals},r);if(sc)tp+=sc;if(sc===PTS_EXACT)exact++;});return{...p,predCount:my.length,pts:tp,exact,missing:totalFix-my.length};}).sort((a,b)=>b.pts-a.pts||b.exact-a.exact||b.correct-a.correct||a.name.localeCompare(b.name));
  return(<div style={{padding:16}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><div style={S.pageTitle}>⚙️ Admin Dashboard</div><span style={{fontSize:9,fontWeight:800,color:"#000",background:G,borderRadius:4,padding:"2px 6px"}}>ADMIN</span><button onClick={async()=>{setRecalcState("loading");try{await onRecalcBonus();setRecalcState("done");}catch{setRecalcState("idle");}setTimeout(()=>setRecalcState("idle"),3000);}} disabled={recalcState==="loading"} style={{marginLeft:"auto",background:recalcState==="done"?"#052e16":"#0a0a0a",border:recalcState==="done"?"1px solid #22c55e":"1px solid #1a1a1a",color:recalcState==="done"?"#22c55e":"#f59e0b",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer",opacity:recalcState==="loading"?0.5:1}}>{recalcState==="loading"?"Recalculating...":recalcState==="done"?"✓ Done":"Recalculate Bonus"}</button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>{[{label:"Players",value:totalUsers,icon:"👥",color:"#3b82f6"},{label:"Predictions",value:totalPreds,icon:"✍️",color:"#22c55e"},{label:"Avg Picks",value:totalUsers>0?(totalPreds/totalUsers).toFixed(1):0,icon:"📊",color:"#f59e0b"}].map(c=>(<div key={c.label} style={{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:12,textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>{c.icon}</div><div style={{fontSize:22,fontWeight:800,color:c.color}}>{c.value}</div><div style={{fontSize:10,color:"#6b7280"}}>{c.label}</div></div>))}</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{[{id:"overview",label:"👥 Players"},{id:"missing",label:"⚠️ Missing"},{id:"matches",label:"⚽ Matches"},{id:"bonus",label:"⭐ Bonus"},{id:"noshows",label:"🚫 No-Shows"},{id:"bonusreview",label:"🔍 Bonus Review"},{id:"results",label:"🏅 Set Results"}].map(t=><button key={t.id} onClick={()=>setView(t.id)} style={{background:view===t.id?`${G}15`:"#0a0a0a",border:view===t.id?`1px solid ${G}`:"1px solid #1a1a1a",color:view===t.id?G:"#6b7280",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.label}</button>)}</div>
    {view==="overview"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>{stats.map((u,i)=>(<div key={u.id} style={{display:"flex",alignItems:"center",gap:12,background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px"}}><div style={{fontWeight:700,fontSize:13,color:"#6b7280",width:24}}>#{i+1}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{u.name}</div><div style={{fontSize:11,color:"#6b7280"}}>{u.predCount}/{totalFix} picks · {u.exact} perfect</div></div><div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,color:G}}>{u.pts}<span style={{fontSize:11,color:"#6b7280"}}> pts</span></div>{u.missing>0&&<div style={{fontSize:10,color:"#ef4444"}}>{u.missing} missing</div>}</div></div>))}</div>}
    {view==="missing"&&<div>
      {stats.filter(u=>u.missing>0).length===0
        ?<div style={{textAlign:"center",color:"#22c55e",padding:32,fontWeight:600}}>🎉 Everyone has submitted all picks!</div>
        :stats.filter(u=>u.missing>0).map(u=>{
          const submittedIds=allPreds.filter(p=>p.user_id===u.id).map(p=>p.fixture_id);
          const missingFixes=allFix.filter(function(f){
            const apiId=(apiIdMap||{})[(f.home+"|"+f.away).toLowerCase()];
            return !submittedIds.includes(f.id)&&(!apiId||!submittedIds.includes(apiId));
          });
          return(<div key={u.id} style={{background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:missingFixes.length>0?10:0}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{u.name}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>{u.predCount}/{totalFix} submitted</div>
              </div>
              <div style={{background:"#1f0000",border:"1px solid #ef444433",color:"#ef4444",fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:20}}>{u.missing} missing</div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {missingFixes.map(f=>(
                <div key={f.id} style={{fontSize:10,fontWeight:600,background:"#111",border:"1px solid #1f1f1f",borderRadius:6,padding:"3px 8px",color:"#6b7280"}}>
                  {f.home} vs {f.away} · {f.date}
                </div>
              ))}
            </div>
          </div>);
        })
      }
    </div>}
    {view==="matches"&&<div>{matchdays.map(md=>(<div key={md.day}><div style={{fontSize:13,fontWeight:800,color:"#6b7280",letterSpacing:1,marginBottom:8,marginTop:16}}>{md.label.toUpperCase()}</div>{md.fixtures.map(fix=>{
      const result=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals,wentToET:fix.wentToET||false,wentToPens:fix.wentToPens||false,penHome:fix.penHome,penAway:fix.penAway}:null);
      const predsForMatch=allPreds.filter(p=>p.fixture_id===fix.id);
      const missingUsers=profiles.filter(p=>!predsForMatch.find(x=>x.user_id===p.id));
      const lockTime=new Date(new Date(fix.kickoffISO).getTime()-15*60000);
      const lockStr=lockTime.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
      function copyReminder(){
        const msg=`⚽ Scoracle reminder — ${fix.home} vs ${fix.away} kicks off at ${localTime(fix.kickoffISO)} UK Time on ${fix.date}! Get your prediction in before ${lockStr} UK Time when it locks. scoracle.live`;
        navigator.clipboard.writeText(msg);
      }
      function copyMissing(){
        if(missingUsers.length===0){navigator.clipboard.writeText("Everyone has submitted their prediction for this match! ✅");return;}
        const names=missingUsers.map(u=>u.name).join(", ");
        const msg=`⚽ Still waiting on: ${names} — get your ${fix.home} vs ${fix.away} prediction in before ${lockStr}! scoracle.live`;
        navigator.clipboard.writeText(msg);
      }
      return(<div key={fix.id} style={{background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700}}>{fix.home} vs {fix.away}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{localDate(fix.kickoffISO)} · {localTime(fix.kickoffISO)} · Group {fix.group}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{predsForMatch.length}/{totalUsers} predictions · {missingUsers.length} missing</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            {result!=null?<><div style={{fontSize:16,fontWeight:800,color:G}}>{result.homeGoals}–{result.awayGoals}</div>{result.wentToPens&&result.penHome!=null&&<div style={{fontSize:9,color:"#6b7280"}}>Pens: {result.penHome}–{result.penAway}</div>}</>:<div style={{fontSize:11,color:"#374151"}}>No result yet</div>}
            <SPill status={fix.status} elapsed={fix.elapsed}/>
          </div>
        </div>
        {missingUsers.length>0&&(
          <div style={{marginTop:10,padding:"8px 10px",background:"#0f0f0f",borderRadius:8,border:"1px solid #1f1f1f"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#ef4444",marginBottom:4}}>Missing: {missingUsers.map(u=>u.name).join(", ")}</div>
          </div>
        )}
        <div style={{display:"flex",gap:6,marginTop:10}}>
          <button onClick={copyReminder} style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:8,color:"#f59e0b",fontSize:11,fontWeight:700,padding:"8px",cursor:"pointer"}}>📋 Copy Reminder</button>
          <button onClick={copyMissing} style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:8,color:"#6b7280",fontSize:11,fontWeight:700,padding:"8px",cursor:"pointer"}}>👥 Copy Missing</button>
        </div>
      </div>);})}</div>))}</div>}
    {view==="bonus"&&<div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:12}}>Everyone's bonus question picks · Sorted alphabetically</div>
      {/* Copy buttons */}
      {(()=>{
        const BONUS_KEYS=["champion","topscorer","mostgoals","adv_r32","adv_r16","adv_qf","adv_sf","adv_final"];
        const sorted=[...profiles].sort((a,b)=>a.name.localeCompare(b.name));
        function getStatus(p){
          const ub=allBonusAnswers.filter(b=>b.user_id===p.id);
          const ADV_COUNTS={"adv_r32":32,"adv_r16":16,"adv_qf":8,"adv_sf":4,"adv_final":2};
          const done=BONUS_KEYS.filter(k=>{
            const rec=ub.find(b=>b.question_id===k);
            if(!rec)return false;
            // For advancement keys, check array is non-empty and has enough picks
            if(ADV_COUNTS[k]!==undefined){
              try{const arr=JSON.parse(rec.answer||"[]");return arr.length===ADV_COUNTS[k];}
              catch{return false;}
            }
            return rec.answer&&rec.answer.trim()!=="";
          }).length;
          return{done,total:BONUS_KEYS.length,complete:done===BONUS_KEYS.length,partial:done>0&&done<BONUS_KEYS.length,none:done===0};
        }
        function copyMessage(){
          var complete=sorted.filter(function(p){return getStatus(p).complete;}).map(function(p){return p.name;});
          var partial=sorted.filter(function(p){return getStatus(p).partial;}).map(function(p){var s=getStatus(p);return p.name+" ("+s.done+"/8)";});
          var none=sorted.filter(function(p){return getStatus(p).none;}).map(function(p){return p.name;});
          var lines=[];
          lines.push("Scoracle - Bonus Questions Status");
          lines.push("Deadline: Midnight, June 11");
          lines.push("");
          if(complete.length){lines.push("Complete ("+complete.length+"):");complete.forEach(function(n){lines.push("- "+n);});lines.push("");}
          if(partial.length){lines.push("Partial ("+partial.length+"):");partial.forEach(function(n){lines.push("- "+n);});lines.push("");}
          if(none.length){lines.push("Not started ("+none.length+"):");none.forEach(function(n){lines.push("- "+n);});lines.push("");}
          lines.push("Get picks in before midnight! scoracle.live");
          navigator.clipboard.writeText(lines.join("\n"));
        }
        function saveAdminRevealImage(){captureImage("bonusRevealCard2","scoracle-bonus-picks-reveal.png");}
        function saveImage(){captureImage("bonusStatusCard","scoracle-bonus-status.png");}
        function copyReminder(){
          const incomplete=sorted.filter(p=>!getStatus(p).complete).map(p=>p.name);
          const msg="Scoracle reminder - bonus questions close at midnight June 11! Still waiting on: "+incomplete.join(", ")+". Get picks in at scoracle.live";
          navigator.clipboard.writeText(msg);
        }
        function saveLeaderboardImage(){captureImage("leaderboardRevealCard","scoracle-leaderboard.png");}
        return(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <button onClick={copyReminder} style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:G,fontSize:11,fontWeight:700,padding:"10px",cursor:"pointer",outline:"none"}}>Copy Reminder</button>
              <button onClick={copyMessage} style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#6b7280",fontSize:11,fontWeight:700,padding:"10px",cursor:"pointer",outline:"none"}}>Copy Status</button>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <button onClick={saveImage} style={{flex:1,background:"linear-gradient(90deg,#f59e0b,#f97316)",border:"none",borderRadius:10,color:"#000",fontSize:11,fontWeight:700,padding:"10px",cursor:"pointer",outline:"none"}}>Status Image</button>
              <button onClick={saveAdminRevealImage} style={{flex:1,background:"linear-gradient(90deg,#22c55e,#16a34a)",border:"none",borderRadius:10,color:"#fff",fontSize:11,fontWeight:700,padding:"10px",cursor:"pointer",outline:"none"}}>Picks Reveal Image</button>
            </div>
            {/* Hidden reveal card for admin - always in DOM */}
            <div id="bonusRevealCard2" style={{position:"fixed",left:"-9999px",top:0,width:540,background:"#0d0d0d",borderRadius:20,overflow:"hidden",fontFamily:"sans-serif"}}>
        <div style={{background:"linear-gradient(135deg,#1a0f00,#080808)",padding:"14px",textAlign:"center",borderBottom:"1px solid #1f1f1f"}}>
          <div style={{fontSize:16,fontWeight:800,letterSpacing:4,color:"#f59e0b",marginBottom:2}}>SCORACLE</div>
          <div style={{fontSize:11,fontWeight:700,color:"#f9fafb",marginBottom:1}}>Bonus Picks Revealed!</div>
          <div style={{fontSize:9,color:"#6b7280"}}>{"World Cup 2026 - "+sorted.length+" players"}</div>
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
            );} )}
          </div>
          {(function(){
            const half=Math.ceil(sorted.length/2);
            const left=sorted.slice(0,half);const right=sorted.slice(half);
            function renderPRow(p){
              if(!p)return <div/>;
              const ub=(allBonusAnswers||[]).filter(function(b){return b.user_id===p.id;});
              const get=function(k){return ub.find(function(b){return b.question_id===k;})?.answer||"";};
              const champ=get("champion");const boot=get("topscorer");const goals=get("mostgoals");
              const isMe=p.id===ADMIN_ID;
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
            {/* Hidden image card for html2canvas - 2 column layout */}
            <div id="bonusStatusCard" style={{position:"fixed",left:"-9999px",top:0,width:480,background:"#0d0d0d",borderRadius:20,overflow:"hidden",fontFamily:"sans-serif"}}>
              <div style={{background:"linear-gradient(135deg,#1a0f00,#080808)",padding:"20px",textAlign:"center",borderBottom:"1px solid #1f1f1f"}}>
                <div style={{fontSize:36,marginBottom:6}}>⚽</div>
                <div style={{fontSize:20,fontWeight:800,letterSpacing:4,color:"#f59e0b",marginBottom:4}}>SCORACLE</div>
                <div style={{fontSize:11,color:"#6b7280"}}>Bonus Questions Status · Deadline Midnight, Jun 11</div>
              </div>
              <div style={{padding:16}}>
                {/* Summary strip */}
                <div style={{display:"flex",gap:6,marginBottom:16}}>
                  {[
                    {n:sorted.filter(function(p){return getStatus(p).complete;}).length,l:"Complete",c:"#22c55e"},
                    {n:sorted.filter(function(p){return getStatus(p).partial;}).length,l:"Partial",c:"#f59e0b"},
                    {n:sorted.filter(function(p){return getStatus(p).none;}).length,l:"Not started",c:"#ef4444"},
                    {n:sorted.length,l:"Total",c:"#6b7280"}
                  ].map(function(s){return(
                    <div key={s.l} style={{flex:1,background:"#111",borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
                      <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.n}</div>
                      <div style={{fontSize:9,color:"#6b7280",marginTop:2}}>{s.l}</div>
                    </div>
                  );})}
                </div>
                {/* 2-column grid grouped by status */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                  {/* Complete */}
                  {sorted.filter(function(p){return getStatus(p).complete;}).length>0&&(
                    <div style={{gridColumn:"1/-1",fontSize:10,fontWeight:800,color:"#22c55e",letterSpacing:1,padding:"6px 0 2px"}}>
                      {"COMPLETE ("+sorted.filter(function(p){return getStatus(p).complete;}).length+")"}
                    </div>
                  )}
                  {sorted.filter(function(p){return getStatus(p).complete;}).map(function(p){return(
                    <div key={p.id} style={{display:"flex",alignItems:"center",padding:"5px 8px",background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:8}}>
                      <span style={{fontSize:11,color:"#f9fafb",fontWeight:600}}>{p.name}</span>
                    </div>
                  );})}
                  {/* Partial */}
                  {sorted.filter(function(p){return getStatus(p).partial;}).length>0&&(
                    <div style={{gridColumn:"1/-1",fontSize:10,fontWeight:800,color:"#f59e0b",letterSpacing:1,padding:"10px 0 2px"}}>
                      {"PARTIAL ("+sorted.filter(function(p){return getStatus(p).partial;}).length+")"}
                    </div>
                  )}
                  {sorted.filter(function(p){return getStatus(p).partial;}).map(function(p){
                    const st=getStatus(p);
                    return(
                      <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:8}}>
                        <span style={{fontSize:11,color:"#f9fafb",fontWeight:600}}>{p.name}</span>
                        <span style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>{st.done+"/8"}</span>
                      </div>
                    );
                  })}
                  {/* Not started */}
                  {sorted.filter(function(p){return getStatus(p).none;}).length>0&&(
                    <div style={{gridColumn:"1/-1",fontSize:10,fontWeight:800,color:"#ef4444",letterSpacing:1,padding:"10px 0 2px"}}>
                      {"NOT STARTED ("+sorted.filter(function(p){return getStatus(p).none;}).length+")"}
                    </div>
                  )}
                  {sorted.filter(function(p){return getStatus(p).none;}).map(function(p){return(
                    <div key={p.id} style={{display:"flex",alignItems:"center",padding:"5px 8px",background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.12)",borderRadius:8}}>
                      <span style={{fontSize:11,color:"#6b7280",fontWeight:600}}>{p.name}</span>
                    </div>
                  );})}
                </div>
                <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid #111",textAlign:"center",fontSize:10,color:"#374151"}}>scoracle.live · World Cup 2026 Prediction Game</div>
              </div>
            </div>

            {/* Leaderboard Image Button */}
            <div style={{display:"flex",gap:8,marginBottom:8,marginTop:8}}>
              <button onClick={saveLeaderboardImage} style={{flex:1,background:"linear-gradient(90deg,#3b82f6,#6366f1)",border:"none",borderRadius:10,color:"#fff",fontSize:11,fontWeight:700,padding:"10px",cursor:"pointer",outline:"none"}}>🏆 Leaderboard Image</button>
            </div>

            {/* Hidden leaderboard reveal card */}
            {(function(){
              const lbSorted=[...profiles].map(function(pr){
                const myP=allPreds.filter(function(p){return p.user_id===pr.id;});
                let tp=0,exact=0,correct=0;
                allFix.forEach(function(fix){
                  const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals,ftHome:fix.ftHome,ftAway:fix.ftAway,wentToET:fix.wentToET||false,wentToPens:fix.wentToPens||false,penHome:fix.penHome??null,penAway:fix.penAway??null,isKnockout:fix.isKnockout||false}:null);
                  const staticId=HOME_AWAY_TO_STATIC_ID[(fix.home+"|"+fix.away).toLowerCase()];
                  const pred=myP.find(function(x){return x.fixture_id===fix.id;})||(staticId&&myP.find(function(x){return x.fixture_id===staticId;}));
                  if(!r||!pred)return;
                  const sc=pts({homeGoals:pred.home_goals,awayGoals:pred.away_goals,home_et:pred.home_et,away_et:pred.away_et,home_pens:pred.home_pens,away_pens:pred.away_pens},r);
                  if(sc!=null&&sc>=PTS_EXACT){tp+=sc;exact++;}else if(sc!=null&&sc>0){tp+=sc;correct++;}
                });
                const ub=(allBonusAnswers||[]).filter(function(b){return b.user_id===pr.id;});
                const adminBonus=(allBonusAnswers||[]).filter(function(b){return b.user_id===ADMIN_ID;});
                const adminGet=function(k){return(adminBonus.find(function(b){return b.question_id===k;})||{}).answer||"";};
                const get=function(k){return(ub.find(function(b){return b.question_id===k;})||{}).answer||"";};
                let bp=0;const champResult=adminGet("champion_result");const bootResult=adminGet("topscorer_result");const goalsResult=adminGet("mostgoals_result");let goalsArr;try{goalsArr=JSON.parse(goalsResult);}catch(e){goalsArr=null;}const goalsMatch=goalsResult&&(Array.isArray(goalsArr)?goalsArr.includes(get("mostgoals")):get("mostgoals")===goalsResult);if(champResult&&get("champion")===champResult)bp+=PTS_WINNER;if(bootResult&&get("topscorer")===bootResult)bp+=PTS_BONUS;if(goalsMatch)bp+=PTS_BONUS;["r32","r16","qf","sf","final"].forEach(function(rnd){const actual=adminGet("actual_adv_"+rnd);if(!actual)return;try{const actualTeams=JSON.parse(actual);const userPicks=JSON.parse(get("adv_"+rnd)||"[]");const correct=userPicks.filter(function(t){return actualTeams.includes(t);}).length;bp+=correct*PTS_BONUS;}catch(e){}});
                return{id:pr.id,name:pr.name,pts:tp+bp,exact,correct};
              }).sort(function(a,b){return b.pts-a.pts||b.exact-a.exact||b.correct-a.correct||a.name.localeCompare(b.name);});
              const half=Math.ceil(lbSorted.length/2);
              const left=lbSorted.slice(0,half);
              const right=lbSorted.slice(half);
              function renderLBRow(p,idx){
                if(!p)return <div/>;
                const isMe=p.id===ADMIN_ID;
                const rank=lbSorted.indexOf(p)+1;
                const rankColor=rank===1?"#f59e0b":rank===2?"#9ca3af":rank===3?"#b45309":"#4b5563";
                return(
                  <div key={p.id} style={{display:"grid",gridTemplateColumns:"32px 1fr 36px 28px",gap:3,background:isMe?"rgba(245,158,11,0.06)":"#111",borderRadius:6,padding:"5px 6px",border:isMe?"1px solid rgba(245,158,11,0.2)":"none",alignItems:"center"}}>
                    <div style={{fontSize:9,fontWeight:700,color:rankColor}}>{"#"+rank}</div>
                    <div style={{fontSize:9,fontWeight:700,color:isMe?"#f59e0b":"#f9fafb",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.name}{isMe?" *":""}</div>
                    <div style={{fontSize:10,fontWeight:800,color:"#f59e0b",textAlign:"right"}}>{p.pts}</div>
                    <div style={{fontSize:9,fontWeight:700,color:p.exact>0?"#22c55e":"#374151",textAlign:"right"}}>{p.exact>0?"🎯"+p.exact:"-"}</div>
                  </div>
                );
              }
              return(
                <div id="leaderboardRevealCard" style={{position:"fixed",left:"-9999px",top:0,width:540,background:"#0d0d0d",borderRadius:20,overflow:"hidden",fontFamily:"sans-serif"}}>
                  <div style={{background:"linear-gradient(135deg,#1a0f00,#080808)",padding:"14px",textAlign:"center",borderBottom:"1px solid #1f1f1f"}}>
                    <div style={{fontSize:16,fontWeight:800,letterSpacing:4,color:"#f59e0b",marginBottom:2}}>SCORACLE</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#f9fafb",marginBottom:1}}>Leaderboard Update</div>
                    <div style={{fontSize:9,color:"#6b7280"}}>{"World Cup 2026 · "+lbSorted.length+" players"}</div>
                  </div>
                  <div style={{padding:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:5}}>
                      {[0,1].map(function(col){return(
                        <div key={col} style={{display:"grid",gridTemplateColumns:"32px 1fr 36px 28px",gap:3,padding:"0 3px"}}>
                          <div style={{fontSize:7,fontWeight:800,color:"#6b7280"}}>#</div>
                          <div style={{fontSize:7,fontWeight:800,color:"#6b7280"}}>PLAYER</div>
                          <div style={{fontSize:7,fontWeight:800,color:"#f59e0b",textAlign:"right"}}>PTS</div>
                          <div style={{fontSize:7,fontWeight:800,color:"#22c55e",textAlign:"right"}}>🎯</div>
                        </div>
                      );})}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>{left.map(function(p){return renderLBRow(p);})}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>{right.map(function(p){return renderLBRow(p);})}</div>
                    </div>
                    <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #111",textAlign:"center",fontSize:8,color:"#374151"}}>scoracle.live - World Cup 2026 - Leaderboard</div>
                  </div>
                </div>
              );
            })()}

          </div>
        );
      })()}
      {(()=>{
        const ADV_COUNTS={"adv_r32":32,"adv_r16":16,"adv_qf":8,"adv_sf":4,"adv_final":2};
        function getBonusStatus(p){
          const ub=allBonusAnswers.filter(b=>b.user_id===p.id);
          const KEYS=["champion","topscorer","mostgoals","adv_r32","adv_r16","adv_qf","adv_sf","adv_final"];
          const done=KEYS.filter(k=>{
            const rec=ub.find(b=>b.question_id===k);
            if(!rec)return false;
            if(ADV_COUNTS[k]!==undefined){try{return JSON.parse(rec.answer||"[]").length===ADV_COUNTS[k];}catch{return false;}}
            return rec.answer&&rec.answer.trim()!=="";
          }).length;
          return{done,total:8,complete:done===8,partial:done>0&&done<8,none:done===0};
        }
        return profiles.map(function(p){
          const ub=allBonusAnswers.filter(b=>b.user_id===p.id);
          const get=function(id){return ub.find(b=>b.question_id===id)?.answer||"";};
          const getAdv=function(k){try{return JSON.parse(get(k)||"[]");}catch{return[];}};
          const st=getBonusStatus(p);
          const isExp=!!expanded[p.id];
          const rows=[
            {l:"🏆 Champion",v:get("champion")||null},
            {l:"⚽ Top Scorer",v:get("topscorer")||null},
            {l:"📊 Most Group Goals",v:get("mostgoals")||null},
            {l:"R32",v:getAdv("adv_r32"),total:32},
            {l:"R16",v:getAdv("adv_r16"),total:16},
            {l:"QF",v:getAdv("adv_qf"),total:8},
            {l:"SF",v:getAdv("adv_sf"),total:4},
            {l:"Final",v:getAdv("adv_final"),total:2},
          ];
          const borderC=st.complete?"rgba(34,197,94,0.25)":st.partial?"rgba(245,158,11,0.2)":"#141414";
          const statusC=st.complete?"#22c55e":st.partial?"#f59e0b":"#ef4444";
          const statusL=st.complete?"Complete":st.partial?(st.done+"/8"):"Not started";
          return(
            <div key={p.id} style={{background:"#080808",border:`1px solid ${borderC}`,borderRadius:12,marginBottom:8,overflow:"hidden"}}>
              {/* Header row */}
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{fontSize:10,color:statusC,fontWeight:700,background:`${statusC}18`,padding:"2px 8px",borderRadius:20}}>{statusL}</div>
                    <button onClick={function(){setExpanded(function(e){return{...e,[p.id]:!e[p.id]};});}}
                      style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,color:"#6b7280",fontSize:11,fontWeight:700,padding:"4px 10px",cursor:"pointer",outline:"none"}}>
                      {isExp?"Hide picks ▲":"See picks ▼"}
                    </button>
                  </div>
                </div>
                {/* Summary row */}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[{l:"Champion",v:get("champion")},{l:"Top Scorer",v:get("topscorer")},{l:"Most Goals",v:get("mostgoals")}].map(function(r){return(
                    <div key={r.l} style={{fontSize:10,color:r.v?"#f9fafb":"#374151"}}>
                      <span style={{color:"#6b7280"}}>{r.l}: </span>{r.v||"–"}
                    </div>
                  );})}
                </div>
                <div style={{display:"flex",gap:8,marginTop:6}}>
                  {[{l:"R32",k:"adv_r32",t:32},{l:"R16",k:"adv_r16",t:16},{l:"QF",k:"adv_qf",t:8},{l:"SF",k:"adv_sf",t:4},{l:"Final",k:"adv_final",t:2}].map(function(r){
                    const arr=getAdv(r.k);const done=arr.length===r.t;
                    return(<div key={r.l} style={{fontSize:10,fontWeight:700,color:done?"#22c55e":arr.length>0?"#f59e0b":"#374151"}}>{r.l}: {arr.length}/{r.t}</div>);
                  })}
                </div>
              </div>
              {/* Expandable picks */}
              {isExp&&(
                <div style={{borderTop:"1px solid #111",padding:"12px 14px",background:"#050505"}}>
                  {[{l:"R32",k:"adv_r32",t:32},{l:"R16",k:"adv_r16",t:16},{l:"QF",k:"adv_qf",t:8},{l:"SF",k:"adv_sf",t:4},{l:"Final",k:"adv_final",t:2}].map(function(r){
                    const arr=getAdv(r.k);
                    return(
                      <div key={r.l} style={{marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:800,color:"#6b7280",letterSpacing:1,marginBottom:6}}>{r.l} PICKS ({arr.length}/{r.t})</div>
                        {arr.length===0
                          ?<div style={{fontSize:11,color:"#374151"}}>No picks saved</div>
                          :<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                            {arr.map(function(t){return(
                              <div key={t} style={{display:"flex",alignItems:"center",gap:4,background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:"4px 8px"}}>
                                <span style={{fontSize:13}}>{FLAGS[t]||"🏳"}</span>
                                <span style={{fontSize:10,fontWeight:600,color:"#f9fafb"}}>{t}</span>
                              </div>
                            );})}
                          </div>
                        }
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        });
      })()}
    </div>}
    {view==="noshows"&&(()=>{
      const completedFix=allFix.filter(fix=>{const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);return r!=null;});
      const noShowStats=[...profiles].map(p=>{const submittedIds=allPreds.filter(x=>x.user_id===p.id).map(x=>x.fixture_id);const missed=completedFix.filter(f=>{const apiId=(apiIdMap||{})[(f.home+"|"+f.away).toLowerCase()];return!submittedIds.includes(f.id)&&(!apiId||!submittedIds.includes(apiId));});return{...p,missedCount:missed.length,missedGames:missed};}).sort((a,b)=>b.missedCount-a.missedCount||a.name.localeCompare(b.name));
      function saveNoShowsImage(){captureImage("noShowsCard","scoracle-no-shows.png");}
      return(<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,color:"#6b7280"}}>{completedFix.length} games completed</div>
          <button onClick={saveNoShowsImage} style={{background:"linear-gradient(90deg,#ef4444,#dc2626)",border:"none",borderRadius:10,color:"#fff",fontSize:11,fontWeight:700,padding:"8px 14px",cursor:"pointer",outline:"none"}}>📸 Save Image</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {noShowStats.map((u,i)=>{const c=u.missedCount===0?"#22c55e":u.missedCount<=2?"#f59e0b":"#ef4444";return(<div key={u.id} style={{display:"flex",alignItems:"center",gap:12,background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#6b7280",width:24}}>#{i+1}</div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{u.name}</div>{u.missedCount>0&&<div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{u.missedGames.map(f=>`${f.home} vs ${f.away}`).join(", ")}</div>}</div>
            <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,color:c}}>{u.missedCount===0?"✓":u.missedCount}</div><div style={{fontSize:10,color:"#6b7280"}}>missed</div></div>
          </div>);})}
        </div>
        <div id="noShowsCard" style={{position:"fixed",left:"-9999px",top:0,width:540,background:"#0d0d0d",borderRadius:20,overflow:"hidden",fontFamily:"sans-serif"}}>
          <div style={{background:"linear-gradient(135deg,#1a0f00,#080808)",padding:"14px",textAlign:"center",borderBottom:"1px solid #1f1f1f"}}>
            <div style={{fontSize:16,fontWeight:800,letterSpacing:4,color:"#f59e0b",marginBottom:2}}>SCORACLE</div>
            <div style={{fontSize:11,fontWeight:700,color:"#f9fafb",marginBottom:1}}>No-Shows Report</div>
            <div style={{fontSize:9,color:"#6b7280"}}>{"World Cup 2026 · "+completedFix.length+" games completed"}</div>
          </div>
          <div style={{padding:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:5}}>{[0,1].map(function(col){return(<div key={col} style={{display:"grid",gridTemplateColumns:"24px 1fr 48px",gap:3,padding:"0 3px"}}><div style={{fontSize:7,fontWeight:800,color:"#6b7280"}}>#</div><div style={{fontSize:7,fontWeight:800,color:"#6b7280"}}>PLAYER</div><div style={{fontSize:7,fontWeight:800,color:"#ef4444",textAlign:"right"}}>MISSED</div></div>);})}</div>
            {(()=>{const half=Math.ceil(noShowStats.length/2);const left=noShowStats.slice(0,half);const right=noShowStats.slice(half);function renderRow(u,rank){if(!u)return<div/>;const c=u.missedCount===0?"#22c55e":u.missedCount<=2?"#f59e0b":"#ef4444";return(<div key={u.id} style={{display:"grid",gridTemplateColumns:"24px 1fr 48px",gap:3,background:"#111",borderRadius:6,padding:"4px 5px",alignItems:"center",marginBottom:3}}><div style={{fontSize:8,fontWeight:700,color:"#6b7280"}}>{"#"+rank}</div><div style={{fontSize:9,fontWeight:700,color:"#f9fafb",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{u.name.split(" ")[0]}</div><div style={{fontSize:10,fontWeight:800,color:c,textAlign:"right"}}>{u.missedCount===0?"✓":u.missedCount}</div></div>);}return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><div>{left.map(function(u,i){return renderRow(u,i+1);})}</div><div>{right.map(function(u,i){return renderRow(u,half+i+1);})}</div></div>);})()}
            <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #111",textAlign:"center",fontSize:8,color:"#374151"}}>scoracle.live · World Cup 2026 · No-Shows Report</div>
          </div>
        </div>
      </div>);
    })()}
    {view==="results"&&<AdminResultsSetter allBonusAnswers={allBonusAnswers} teams={ALL_TEAMS}/>}
    {view==="bonusreview"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {profiles.map(function(p){
        const ub=(allBonusAnswers||[]).filter(function(b){return b.user_id===p.id;});
        const get=function(k){return ub.find(function(b){return b.question_id===k;})?.answer||"";};
        const getAdv=function(k){try{return JSON.parse(get(k)||"[]");}catch{return[];}};
        const champResult=(allBonusAnswers||[]).find(function(b){return b.question_id==="champion_result";})?.answer||"";
        const bootResult=(allBonusAnswers||[]).find(function(b){return b.question_id==="topscorer_result";})?.answer||"";
        const goalsRaw=(allBonusAnswers||[]).find(function(b){return b.question_id==="mostgoals_result";})?.answer||"";
        let goalsArr;try{goalsArr=JSON.parse(goalsRaw);}catch{goalsArr=null;}
        const champOk=champResult&&get("champion")===champResult;
        const bootOk=bootResult&&get("topscorer")===bootResult;
        const goalsOk=goalsRaw&&(Array.isArray(goalsArr)?goalsArr.includes(get("mostgoals")):get("mostgoals")===goalsRaw);
        const advRounds=[{l:"Round of 32",k:"adv_r32"},{l:"Round of 16",k:"adv_r16"},{l:"Quarter-Final",k:"adv_qf"},{l:"Semi-Final",k:"adv_sf"},{l:"Final",k:"adv_final"}];
        let totalBp=(champOk?PTS_WINNER:0)+(bootOk?PTS_BONUS:0)+(goalsOk?PTS_BONUS:0);
        advRounds.forEach(function(r){const ae=(allBonusAnswers||[]).find(function(b){return b.question_id===r.k.replace('adv_','actual_adv_');});let at=null;try{at=ae?JSON.parse(ae.answer):null;}catch{}if(!at)return;totalBp+=getAdv(r.k).filter(function(t){return at.includes(t);}).length*PTS_BONUS;});
        const isExp=expanded[p.id];
        return(<div key={p.id} style={{background:"#0d0d0d",border:"1px solid #1f1f1f",borderRadius:14,overflow:"hidden"}}>
          <div onClick={function(){setExpanded(function(e){return{...e,[p.id]:!e[p.id]};});}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",cursor:"pointer"}}>
            <div style={{fontSize:14,fontWeight:700}}>{p.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,fontWeight:800,color:totalBp>0?G:"#6b7280"}}>+{totalBp} pts</span>
              <span style={{fontSize:11,color:"#6b7280"}}>{isExp?"▾":"▸"}</span>
            </div>
          </div>
          {isExp&&<div style={{borderTop:"1px solid #141414",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:9,fontWeight:800,color:"#6b7280",letterSpacing:1}}>SPECIAL PICKS</div>
            {[{label:"🏆 Champion",pick:get("champion"),result:champResult,ok:champOk,pts:PTS_WINNER},{label:"👟 Top Scorer",pick:get("topscorer"),result:bootResult,ok:bootOk,pts:PTS_BONUS},{label:"⚽ Most Group Goals",pick:get("mostgoals"),result:goalsRaw,ok:goalsOk,pts:PTS_BONUS}].map(function(s){return(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:10,color:"#6b7280"}}>{s.label}</div><div style={{fontSize:12,fontWeight:700,color:s.pick?"#f9fafb":"#374151"}}>{s.pick||"No pick"}</div></div>
                {s.result?<span style={{fontSize:11,fontWeight:700,color:s.ok?"#22c55e":"#ef4444",background:s.ok?"#052e16":"#1f0707",padding:"3px 8px",borderRadius:8}}>{s.ok?`✓ +${s.pts}`:"✗ +0"}</span>:<span style={{fontSize:10,color:"#374151"}}>—</span>}
              </div>
            );})}
            <div style={{fontSize:9,fontWeight:800,color:"#6b7280",letterSpacing:1,marginTop:4}}>ADVANCEMENT PICKS</div>
            {advRounds.map(function(r){
              const ae=(allBonusAnswers||[]).find(function(b){return b.question_id===r.k.replace('adv_','actual_adv_');});
              let at=null;try{at=ae?JSON.parse(ae.answer):null;}catch{}
              const picks=getAdv(r.k);
              const correct=at?picks.filter(function(t){return at.includes(t);}).length:null;
              return(<div key={r.l}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:700,color:"#a855f7"}}>{r.l}</span>
                  {at?<span style={{fontSize:11,fontWeight:700,color:G}}>{correct}/{picks.length} correct · +{correct*PTS_BONUS}</span>:<span style={{fontSize:10,color:"#374151"}}>Not yet scored</span>}
                </div>
                {picks.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                  {picks.map(function(t){const scored=at&&at.includes(t);const wrong=at&&!at.includes(t);return(
                    <div key={t} style={{display:"flex",alignItems:"center",gap:4,background:scored?"#052e16":wrong?"#1f0707":"#111",border:"1px solid "+(scored?"#22c55e33":wrong?"#ef444433":"#1f1f1f"),borderRadius:8,padding:"4px 8px"}}>
                      <span style={{fontSize:11}}>{FLAGS[t]||"🏳"}</span>
                      <span style={{fontSize:10,fontWeight:600,color:scored?"#22c55e":wrong?"#ef4444":"#f9fafb"}}>{t}</span>
                    </div>
                  );})}
                </div>}
              </div>);
            })}
          </div>}
        </div>);
      })}
    </div>}
    {previewImg&&(<div onClick={function(){setPreviewImg(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:10000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:20}}>
      <img src={previewImg} onClick={function(e){e.stopPropagation();}} style={{maxWidth:"90vw",maxHeight:"70vh",borderRadius:12,objectFit:"contain",boxShadow:"0 0 40px rgba(0,0,0,0.8)"}}/>
      <div onClick={function(e){e.stopPropagation();}} style={{display:"flex",gap:10}}>
        <a href={previewImg} download={previewName} style={{background:"linear-gradient(90deg,#f59e0b,#f97316)",borderRadius:12,color:"#000",fontWeight:800,fontSize:13,padding:"12px 24px",cursor:"pointer",textDecoration:"none",display:"inline-block"}}>⬇ Download</a>
        <button onClick={function(){setPreviewImg(null);}} style={{background:"#0a0a0a",border:"1px solid #333",borderRadius:12,color:"#9ca3af",fontWeight:700,fontSize:13,padding:"12px 24px",cursor:"pointer",outline:"none"}}>Close</button>
      </div>
      <div style={{fontSize:11,color:"#4b5563",textAlign:"center"}}>On iOS: long press the image above to save · Tap outside to close</div>
    </div>)}
  </div>);
}
