// Server-side cache — shared across all users, one real API call per cache window
let cache = { data: null, ts: 0, isLive: false };

const LIVE_STATUSES = ["1H","HT","2H","ET","BT","P","SUSP","INT"];
const LIVE_TTL   = 30 * 1000;   // 30s when a game is live
const IDLE_TTL   = 5 * 60 * 1000; // 5min when no games are live

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const now = Date.now();
  const ttl = cache.isLive ? LIVE_TTL : IDLE_TTL;

  // Serve cached response if still fresh
  if (cache.data && (now - cache.ts) < ttl) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cache.data);
  }

  const params = new URLSearchParams(req.query).toString();
  const url = `https://v3.football.api-sports.io/fixtures?${params}`;

  try {
    const response = await fetch(url, {
      headers: { "x-apisports-key": "b08f6877d56ad565b8dbb49558b764eb" }
    });
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    if (!data.response) throw new Error("Empty API response");

    // Check if any fixture is currently live to set next TTL
    const hasLive = data.response.some(f =>
      LIVE_STATUSES.includes(f.fixture?.status?.short)
    );

    cache = { data, ts: now, isLive: hasLive };

    res.setHeader("X-Cache", "MISS");
    res.status(200).json(data);
  } catch (err) {
    // Return stale cache on error rather than failing
    if (cache.data) {
      res.setHeader("X-Cache", "STALE");
      return res.status(200).json(cache.data);
    }
    res.status(500).json({ error: "API fetch failed" });
  }
}
