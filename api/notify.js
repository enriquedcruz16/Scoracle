const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const secret = req.headers["x-notify-secret"] || req.query.secret;
  if (secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id");

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ 
    ok: true,
    subscribers: subs.length,
    vapidSet: !!process.env.VAPID_PUBLIC_KEY,
  });
};
