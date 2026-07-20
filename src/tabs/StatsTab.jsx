import { useCompetition } from "../contexts/CompetitionContext";
import { pts, PTS_EXACT, PTS_RESULT, PTS_WINNER, PTS_BONUS } from "../utils/scoring";

const ADMIN_ID = "0c51030f-a4ce-4e6c-8c4c-87ffba2acae2";

export function StatsTab(){
  const { accentColor: G, HOME_AWAY_TO_STATIC_ID, allFix, predictions, live, totalPts, predCount, totalFix, bonus, allBonusAnswers, currentUser } = useCompetition();
  const rm=allFix.reduce((a,fix)=>{const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals,ftHome:fix.ftHome,ftAway:fix.ftAway,wentToET:fix.wentToET||false,wentToPens:fix.wentToPens||false,penHome:fix.penHome,penAway:fix.penAway,isKnockout:fix.isKnockout||false}:null);if(r){a[fix.id]=r;const sid=HOME_AWAY_TO_STATIC_ID[(fix.home+"|"+fix.away).toLowerCase()];if(sid)a[sid]=r;}return a;},{});
  const playedCount=allFix.filter(fix=>live[fix.id]!=null||(fix.isDone&&fix.homeGoals!=null)).length;
  const exact=allFix.filter(fix=>{const sid=HOME_AWAY_TO_STATIC_ID[(fix.home+"|"+fix.away).toLowerCase()];const pred=predictions[fix.id]||(sid&&predictions[sid]);const r=rm[fix.id];return pred&&r&&(pts(pred,r)||0)>=PTS_EXACT;}).length;
  const correct=allFix.filter(fix=>{const sid=HOME_AWAY_TO_STATIC_ID[(fix.home+"|"+fix.away).toLowerCase()];const pred=predictions[fix.id]||(sid&&predictions[sid]);const r=rm[fix.id];return pred&&r&&(pts(pred,r)||0)>=PTS_RESULT;}).length;
  const acc=predCount>0?Math.round((exact/Math.min(predCount,playedCount||1))*100):0;
  const myUserId=currentUser?.id;
  const ub=(allBonusAnswers||[]).filter(b=>b.user_id===myUserId);
  const adminBonus=(allBonusAnswers||[]).filter(b=>b.user_id===ADMIN_ID);
  const adminGet=function(k){return adminBonus.find(b=>b.question_id===k)?.answer||"";};
  const get=function(k){return ub.find(b=>b.question_id===k)?.answer||"";};
  const getAdv=function(k){try{return JSON.parse(get(k)||"[]");}catch{return[];}};
  const champResult=adminGet("champion_result");
  const bootResult=adminGet("topscorer_result");
  const goalsResult=adminGet("mostgoals_result");
  let goalsArr;try{goalsArr=JSON.parse(goalsResult);}catch{goalsArr=null;}
  const champPts=champResult&&get("champion")===champResult?PTS_WINNER:0;
  const bootPts=bootResult&&get("topscorer")===bootResult?PTS_BONUS:0;
  const goalsPts=goalsResult&&(Array.isArray(goalsArr)?goalsArr.includes(get("mostgoals")):get("mostgoals")===goalsResult)?PTS_BONUS:0;
  const advRows=["r32","r16","qf","sf","final"].map(function(rnd){
    const actual=adminGet("actual_adv_"+rnd);
    if(!actual)return{rnd,pts:0,correct:0,total:getAdv("adv_"+rnd).length,pending:true};
    try{const actualTeams=JSON.parse(actual);const userPicks=getAdv("adv_"+rnd);const correct=userPicks.filter(function(t){return actualTeams.includes(t);}).length;return{rnd,pts:correct*PTS_BONUS,correct,total:userPicks.length,pending:false};}
    catch{return{rnd,pts:0,correct:0,total:0,pending:true};}
  });
  const advPts=advRows.reduce(function(s,r){return s+r.pts;},0);
  const totalBonusPts=champPts+bootPts+goalsPts+advPts;
  const grandTotal=totalPts+totalBonusPts;
  const rndLabels={"r32":"Round of 32","r16":"Round of 16","qf":"Quarter-Finals","sf":"Semi-Finals","final":"The Final"};
  return(<div style={{padding:16}}>
    <div style={{fontSize:20,fontWeight:800,marginBottom:16,letterSpacing:0.3}}>My Stats</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
      {[{label:"Total Points",value:grandTotal,icon:"🏅",color:"#f59e0b"},{label:"Perfect Scores",value:exact,icon:"🎯",color:"#22c55e"},{label:"Correct Results",value:correct,icon:"✅",color:"#3b82f6"},{label:"Accuracy",value:`${acc}%`,icon:"📈",color:"#a855f7"},{label:"Picks Made",value:`${predCount}/${totalFix}`,icon:"✍️",color:"#ec4899"},{label:"Avg / Match",value:playedCount>0?(totalPts/playedCount).toFixed(1):"0.0",icon:"⚡",color:"#06b6d4"}].map(c=>(<div key={c.label} style={{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:16,textAlign:"center"}}><div style={{width:36,height:36,borderRadius:10,background:c.color+"22",color:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,margin:"0 auto 10px"}}>{c.icon}</div><div style={{fontSize:26,fontWeight:800,marginBottom:4}}>{c.value}</div><div style={{fontSize:11,color:"#6b7280"}}>{c.label}</div></div>))}
    </div>
    <div style={{fontSize:15,fontWeight:800,marginBottom:12}}>My Bonus Points</div>
    <div style={{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:14,marginBottom:8}}>
      {[{label:"Tournament Winner",pts:champPts,pending:!champResult,pick:get("champion"),result:champResult},{label:"Golden Boot",pts:bootPts,pending:!bootResult,pick:get("topscorer"),result:bootResult},{label:"Most Group Goals",pts:goalsPts,pending:!goalsResult,pick:get("mostgoals"),result:goalsResult}].map(function(row){return(
        <div key={row.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #0f0f0f"}}>
          <div><div style={{fontSize:12,fontWeight:600}}>{row.label}</div>{row.pick&&<div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Your pick: {row.pick}{row.result&&row.result!==row.pick?" · Result: "+row.result:""}</div>}</div>
          <div style={{fontSize:13,fontWeight:800,color:row.pending?"#374151":row.pts>0?"#22c55e":"#ef4444"}}>{row.pending?"Pending":row.pts>0?"+"+row.pts+" pts":"0 pts"}</div>
        </div>
      );})}
      {advRows.map(function(row){return(
        <div key={row.rnd} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #0f0f0f"}}>
          <div><div style={{fontSize:12,fontWeight:600}}>{rndLabels[row.rnd]}</div>{!row.pending&&<div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{row.correct}/{row.total} correct</div>}</div>
          <div style={{fontSize:13,fontWeight:800,color:row.pending?"#374151":row.pts>0?"#22c55e":"#ef4444"}}>{row.pending?"Pending":row.pts>0?"+"+row.pts+" pts":"0 pts"}</div>
        </div>
      );})}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,marginTop:4}}>
        <div style={{fontSize:13,fontWeight:800}}>Total Bonus</div>
        <div style={{fontSize:18,fontWeight:800,color:G}}>{totalBonusPts>0?"+"+totalBonusPts:"0"} pts</div>
      </div>
    </div>
  </div>);
}
