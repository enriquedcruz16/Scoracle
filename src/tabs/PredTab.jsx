import { useState, useEffect, useRef } from "react";
import { useCompetition } from "../contexts/CompetitionContext";
import { pts, PTS_EXACT } from "../utils/scoring";
import { localTime, localDate, locked, lockMsg } from "../utils/time";
import SPill from "../components/SPill";

export function PredTab(){
  const { accentColor: G, FLAGS, GROUPS_TEAMS, GROUPS_LIST, HOME_AWAY_TO_STATIC_ID, KO_LABEL, matchdays, selDay, setSelDay, predictions, live, onSave, savedId, allFix, allPreds, profiles, currentUser } = useCompetition();
  const[drafts,setDrafts]=useState({});
  const md=matchdays.find(m=>m.day===selDay)||matchdays[0];
  const nextFixRef=useRef(null);
  const listTopRef=useRef(null);
  const tabBarRef=useRef(null);
  useEffect(()=>{(nextFixRef.current||listTopRef.current)?.scrollIntoView({behavior:"smooth",block:"start"});},[selDay]);
  useEffect(()=>{if(!tabBarRef.current)return;const btn=tabBarRef.current.querySelector('[data-day="'+selDay+'"]');if(!btn)return;const c=tabBarRef.current;c.scrollTo({left:btn.offsetLeft-(c.offsetWidth-btn.offsetWidth)/2,behavior:"smooth"});},[selDay]);
  function val(id,side){
    const d=drafts[id];
    const fix=allFix.find(function(f){return f.id===id;});
    const staticId=fix&&HOME_AWAY_TO_STATIC_ID[(fix.home+"|"+fix.away).toLowerCase()];
    const pr=predictions[id]||(staticId&&predictions[staticId])||(fix&&predictions[(fix.home+"|"+fix.away).toLowerCase()]);
    if(d?.[side]!==undefined)return d[side];
    if(side==="home")return pr?.home_goals!==undefined?String(pr.home_goals):pr?.homeGoals!==undefined?String(pr.homeGoals):"";
    if(side==="away")return pr?.away_goals!==undefined?String(pr.away_goals):pr?.awayGoals!==undefined?String(pr.awayGoals):"";
    if(side==="homeEt")return pr?.home_et!=null?String(pr.home_et):"";
    if(side==="awayEt")return pr?.away_et!=null?String(pr.away_et):"";
    if(side==="homePens")return pr?.home_pens!=null?String(pr.home_pens):"";
    if(side==="awayPens")return pr?.away_pens!=null?String(pr.away_pens):"";
    return "";
  }
  return(<div>
    <div ref={tabBarRef} style={{overflowX:"auto",padding:"14px 16px 14px",display:"flex",gap:8,borderBottom:"1px solid #0f0f0f",position:"sticky",top:80,zIndex:50,background:"#080808"}}>
      {matchdays.map(m=>(<button key={m.day} data-day={m.day} onClick={()=>setSelDay(m.day)} style={{background:selDay===m.day?`${G}12`:"#0a0a0a",border:selDay===m.day?`1px solid ${G}`:"1px solid #1a1a1a",color:selDay===m.day?G:"#6b7280",borderRadius:12,padding:"9px 16px",cursor:"pointer",textAlign:"left",flexShrink:0,minWidth:120}}><div style={{fontSize:13,fontWeight:700}}>{m.label}</div><div style={{fontSize:10,marginTop:3,opacity:0.6}}>{m.dates}</div></button>))}
    </div>
    <div ref={listTopRef} style={{padding:16,scrollMarginTop:"152px"}}>{(md?.fixtures||[]).map((fix,i,arr)=>{
      const staticId=HOME_AWAY_TO_STATIC_ID[(fix.home+"|"+fix.away).toLowerCase()];
      const lv=live[fix.id],result=lv||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals,ftHome:fix.ftHome,ftAway:fix.ftAway,wentToET:fix.wentToET||false,wentToPens:fix.wentToPens||false,penHome:fix.penHome,penAway:fix.penAway,isKnockout:fix.isKnockout||false}:null),pred=predictions[fix.id]||(staticId&&predictions[staticId]),p=pts(pred,result),lk=locked(fix.kickoffISO)||fix.isLive||fix.isDone,isSaved=savedId===fix.id,hv=val(fix.id,"home"),av=val(fix.id,"away"),lm=lockMsg(fix.kickoffISO);
      const hvEt=fix.isKnockout?val(fix.id,"homeEt"):"";
      const avEt=fix.isKnockout?val(fix.id,"awayEt"):"";
      const hvPens=fix.isKnockout?val(fix.id,"homePens"):"";
      const avPens=fix.isKnockout?val(fix.id,"awayPens"):"";
      const show90DrawET=fix.isKnockout&&hv!==""&&av!==""&&String(hv)===String(av);
      const etHomeMin=hv!==""?parseInt(hv):0;const etAwayMin=av!==""?parseInt(av):0;
      const etBelowMin=show90DrawET&&hvEt!==""&&avEt!==""&&(parseInt(hvEt)<etHomeMin||parseInt(avEt)<etAwayMin);
      const showETDrawPen=show90DrawET&&hvEt!==""&&avEt!==""&&!etBelowMin&&String(hvEt)===String(avEt);
      const isNextUpcoming=!lk&&arr.slice(0,i).every(f=>locked(f.kickoffISO)||f.isLive||f.isDone);
      return(<div key={fix.id} ref={isNextUpcoming?nextFixRef:null} style={{background:"#080808",border:"1px solid #141414",borderRadius:16,padding:16,marginBottom:12,transition:"border-color 0.3s,box-shadow 0.3s",scrollMarginTop:"152px",...(isSaved?{borderColor:"#22c55e",boxShadow:"0 0 18px #22c55e2a"}:{}),...(fix.isLive?{borderColor:"#ef444440",boxShadow:"0 0 18px #ef44441a"}:{})}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
          <div><span style={{fontSize:10,fontWeight:800,color:fix.isKnockout?"#a855f7":G,letterSpacing:1}}>{fix.isKnockout?(KO_LABEL[fix.group]||fix.group):`Group ${fix.group}`}</span><span style={{fontSize:11,color:"#4b5563"}}> · {localDate(fix.kickoffISO)} · {localTime(fix.kickoffISO)}</span>{fix.venue&&<div style={{fontSize:10,color:"#374151",marginTop:2}}>📍 {fix.venue}</div>}{lm&&<div style={{fontSize:10,color:"#f59e0b",marginTop:3,fontWeight:600}}>⏱ {lm}</div>}</div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}><SPill status={fix.status} elapsed={fix.elapsed}/>{p!==null&&<span style={{fontSize:11,fontWeight:700,color:"#fff",padding:"3px 8px",borderRadius:20,background:p>=PTS_EXACT?"#22c55e":p>0?"#f59e0b":"#ef4444"}}>{p>0?`+${p}`:`✗ +0`}</span>}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>{fix.homeLogo?<img src={fix.homeLogo} alt="" style={{width:32,height:32,objectFit:"contain",borderRadius:4}}/>:<span style={{fontSize:26}}>{FLAGS[fix.home]||"🏳️"}</span>}<span style={{fontSize:12,fontWeight:600,lineHeight:1.3}}>{fix.home}</span></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:110}}>
            {result!=null&&<div style={{textAlign:"center"}}>
              <span style={{fontSize:22,fontWeight:800,color:fix.isLive?"#ef4444":"#f59e0b"}}>{result.homeGoals} – {result.awayGoals}</span>
              {result.wentToPens&&result.penHome!=null&&<div style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>Pens: {result.penHome}–{result.penAway}</div>}
              <div style={{fontSize:10,color:"#6b7280",fontWeight:700}}>{fix.isLive?`${fix.elapsed}'`:result.wentToPens?"PEN":result.wentToET?"AET":"FT"}</div>
            </div>}
            {fix.isKnockout?(
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:9,color:"#4b5563",width:24,textAlign:"right"}}>90'</span>
                  <input type="number" min="0" max="20" value={hv} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],home:e.target.value}}))} style={{width:40,height:40,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:18,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/>
                  <span style={{fontSize:16,fontWeight:700,color:"#374151"}}>:</span>
                  <input type="number" min="0" max="20" value={av} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],away:e.target.value}}))} style={{width:40,height:40,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:18,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/>
                </div>
                {show90DrawET&&(<div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9,color:"#4b5563",width:24,textAlign:"right"}}>ET</span><input type="number" min={etHomeMin} max="20" value={hvEt} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],homeEt:e.target.value}}))} style={{width:40,height:40,background:"#111",border:`1px solid ${etBelowMin&&hvEt!==""&&parseInt(hvEt)<etHomeMin?"#ef4444":"#1f1f1f"}`,borderRadius:10,color:"#f9fafb",fontSize:18,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/><span style={{fontSize:16,fontWeight:700,color:"#374151"}}>:</span><input type="number" min={etAwayMin} max="20" value={avEt} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],awayEt:e.target.value}}))} style={{width:40,height:40,background:"#111",border:`1px solid ${etBelowMin&&avEt!==""&&parseInt(avEt)<etAwayMin?"#ef4444":"#1f1f1f"}`,borderRadius:10,color:"#f9fafb",fontSize:18,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/></div>)}
                {showETDrawPen&&(<div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9,color:"#4b5563",width:24,textAlign:"right"}}>Pen</span><input type="number" min="0" max="30" value={hvPens} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],homePens:e.target.value}}))} style={{width:40,height:40,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:18,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/><span style={{fontSize:16,fontWeight:700,color:"#374151"}}>:</span><input type="number" min="0" max="30" value={avPens} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],awayPens:e.target.value}}))} style={{width:40,height:40,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:18,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/></div>)}
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input type="number" min="0" max="20" value={hv} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],home:e.target.value}}))} style={{width:44,height:44,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:20,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/>
                <span style={{fontSize:20,fontWeight:700,color:"#374151"}}>:</span>
                <input type="number" min="0" max="20" value={av} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],away:e.target.value}}))} style={{width:44,height:44,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:20,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/>
              </div>
            )}
            {pred&&!lk&&<div style={{fontSize:10,color:"#374151"}}>{fix.isKnockout?(pred.home_et!=null?`90': ${pred.homeGoals}–${pred.awayGoals} ET: ${pred.home_et}–${pred.away_et}${pred.home_pens!=null?` Pen: ${pred.home_pens}–${pred.away_pens}`:""}`:(`90': ${pred.homeGoals??pred.home_goals}–${pred.awayGoals??pred.away_goals}`)): `Pick: ${pred.homeGoals??pred.home_goals}–${pred.awayGoals??pred.away_goals}`}</div>}
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}><span style={{fontSize:12,fontWeight:600,lineHeight:1.3,textAlign:"right"}}>{fix.away}</span>{fix.awayLogo?<img src={fix.awayLogo} alt="" style={{width:32,height:32,objectFit:"contain",borderRadius:4}}/>:<span style={{fontSize:26}}>{FLAGS[fix.away]||"🏳️"}</span>}</div>
        </div>
        {(()=>{
          const hasPred=!!pred;
          const isDirty=hv!==""&&av!==""&&(String(hv)!==String(pred?.homeGoals??pred?.home_goals)||String(av)!==String(pred?.awayGoals??pred?.away_goals)||(show90DrawET&&(String(hvEt)!==(pred?.home_et!=null?String(pred.home_et):"")||String(avEt)!==(pred?.away_et!=null?String(pred.away_et):"")))||(showETDrawPen&&(String(hvPens)!==(pred?.home_pens!=null?String(pred.home_pens):"")||String(avPens)!==(pred?.away_pens!=null?String(pred.away_pens):""))));
          const isPenDraw=fix.isKnockout&&showETDrawPen&&hvPens!==""&&avPens!==""&&String(hvPens)===String(avPens);
          const needsET=fix.isKnockout&&show90DrawET&&(hvEt===""||avEt==="");
          const needsPen=fix.isKnockout&&showETDrawPen&&(hvPens===""||avPens==="");
          const blockSave=isPenDraw||needsET||needsPen||etBelowMin;
          const btnBg=lk?"#0f0f0f":blockSave?"#1a0a0a":isSaved||(!isDirty&&hasPred)?"linear-gradient(90deg,#22c55e,#16a34a)":`linear-gradient(90deg,${G},#f97316)`;
          const btnColor=lk?"#374151":blockSave?"#ef4444":isSaved||(!isDirty&&hasPred)?"#fff":"#000";
          const btnBorder=lk?"1px solid #1a1a1a":blockSave?"1px solid #ef444433":"none";
          const btnLabel=lk?(fix.isLive?"🔴 Live — Locked":fix.isDone?"✓ Final Result":"🔒 Locked"):isPenDraw?"No draws in penalties":etBelowMin?`ET score can't be less than 90' score (${hv}–${av})`:needsET?"Enter ET score (game drawn at 90')":needsPen?"Enter penalty score (ET drawn)":isSaved?"✓ Saved!":!isDirty&&hasPred?"✓ Saved":"Save Pick";
          return(<button onClick={()=>onSave(fix.id,hv,av,show90DrawET?hvEt:null,show90DrawET?avEt:null,showETDrawPen?hvPens:null,showETDrawPen?avPens:null)} disabled={lk||blockSave||(!isDirty&&hasPred&&!isSaved)} style={{width:"100%",background:btnBg,border:btnBorder,borderRadius:10,color:btnColor,fontWeight:800,fontSize:13,padding:"11px",cursor:lk||blockSave||(!isDirty&&hasPred)?"default":"pointer",letterSpacing:0.5,transition:"all 0.3s",outline:"none"}}>{btnLabel}</button>);
        })()}
      </div>);
    })}</div>
  </div>);
}
