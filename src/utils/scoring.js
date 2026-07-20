export const PTS_EXACT = 15;
export const PTS_RESULT = 5;
export const PTS_WINNER = 50;
export const PTS_BONUS = 10;

export function pts(pred, res) {
  if (!pred || !res) return null;
  const ph = +(pred.homeGoals ?? pred.home_goals), pa = +(pred.awayGoals ?? pred.away_goals);
  if (!res.isKnockout) {
    const rh = +res.homeGoals, ra = +res.awayGoals;
    if ([ph, pa, rh, ra].some(v => isNaN(v) || v == null)) return null;
    if (ph === rh && pa === ra) return PTS_EXACT;
    const po = ph > pa ? "H" : ph < pa ? "A" : "D", ro = rh > ra ? "H" : rh < ra ? "A" : "D";
    return po === ro ? PTS_RESULT : 0;
  }
  const ft90H = res.ftHome != null ? res.ftHome : res.homeGoals, ft90A = res.ftAway != null ? res.ftAway : res.awayGoals;
  if ([ph, pa, ft90H, ft90A].some(v => isNaN(v) || v == null)) return null;
  const pEtH = pred.home_et != null ? +pred.home_et : pred.homeEt != null ? +pred.homeEt : null;
  const pEtA = pred.away_et != null ? +pred.away_et : pred.awayEt != null ? +pred.awayEt : null;
  const pPenH = pred.home_pens != null ? +pred.home_pens : pred.homePens != null ? +pred.homePens : null;
  const pPenA = pred.away_pens != null ? +pred.away_pens : pred.awayPens != null ? +pred.awayPens : null;
  let total = 0;
  const r90 = ft90H > ft90A ? "H" : ft90H < ft90A ? "A" : "D", p90 = ph > pa ? "H" : ph < pa ? "A" : "D";
  if (ph === ft90H && pa === ft90A) total += PTS_EXACT;
  else if (p90 === r90) total += PTS_RESULT;
  if (res.wentToET || res.wentToPens) {
    const aetH = res.homeGoals, aetA = res.awayGoals;
    if (pEtH != null && pEtA != null && aetH != null && aetA != null) {
      const rET = aetH > aetA ? "H" : aetH < aetA ? "A" : "D", pET = pEtH > pEtA ? "H" : pEtH < pEtA ? "A" : "D";
      if (pEtH === aetH && pEtA === aetA) total += PTS_EXACT;
      else if (pET === rET) total += PTS_RESULT;
    }
  }
  if (res.wentToPens) {
    const penH = res.penHome, penA = res.penAway;
    if (pPenH != null && pPenA != null && penH != null && penA != null) {
      const rPen = penH > penA ? "H" : "A", pPen = pPenH > pPenA ? "H" : "A";
      if (pPenH === penH && pPenA === penA) total += PTS_EXACT;
      else if (pPen === rPen) total += PTS_RESULT;
    }
  }
  if (total === 0) {
    const actualWinner = res.wentToPens ? (res.penHome > res.penAway ? "H" : "A") : res.wentToET ? (res.homeGoals > res.awayGoals ? "H" : res.homeGoals < res.awayGoals ? "A" : null) : (ft90H > ft90A ? "H" : ft90H < ft90A ? "A" : null);
    let predictedWinner = null;
    if (pPenH != null && pPenA != null) predictedWinner = pPenH > pPenA ? "H" : "A";
    else if (pEtH != null && pEtA != null && pEtH !== pEtA) predictedWinner = pEtH > pEtA ? "H" : "A";
    else if (p90 !== "D") predictedWinner = p90;
    if (actualWinner && predictedWinner && predictedWinner === actualWinner) total = PTS_RESULT;
  }
  return total;
}
