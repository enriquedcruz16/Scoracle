export const LOCK_MINUTES = 15;

export function localTime(iso) {
  if (!iso) return "TBD";
  try { return new Date(iso).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}); }
  catch { return "TBD"; }
}

export function localDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString([], {month: "short", day: "numeric"}); }
  catch { return ""; }
}

export function locked(k) {
  return k && new Date() >= new Date(new Date(k).getTime() - LOCK_MINUTES * 60000);
}

export function lockMsg(k) {
  if (!k) return null;
  const d = new Date(new Date(k).getTime() - LOCK_MINUTES * 60000) - new Date();
  if (d <= 0 || d > 86400000) return null;
  const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000);
  return h > 0 ? `Locks in ${h}h ${m}m` : `Locks in ${m}m`;
}
