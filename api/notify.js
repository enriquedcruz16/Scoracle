import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const secret = req.headers["x-notify-secret"] || req.query.secret;
  if (secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  // Test Supabase connection and return subscription count
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, user_id");

  if (error) return res.status(500).json({ error: error.message });

  // Dynamically import web-push to check if it's available
  let webpushAvailable = false;
  try {
    const wp = await import("web-push");
    webpushAvailable = true;

    wp.default.setVapidDetails(
      "mailto:enriquedcruz16@gmail.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const isTest = req.query.test === "1";
    if (isTest && subs.length > 0) {
      const { data: fullSubs } = await supabase.from("push_subscriptions").select("subscription");
      let sent = 0;
      for (const row of fullSubs) {
        try {
          await wp.default.sendNotification(
            row.subscription,
            JSON.stringify({
              title: "⚽ Scoracle Test Notification",
              body: "Notifications are working! 🎉",
              url: "https://scoracle.live"
            })
          );
          sent++;
        } catch(e) { /* ignore */ }
      }
      return res.status(200).json({ sent, subscribers: subs.length, webpushAvailable });
    }
  } catch(e) {
    webpushAvailable = false;
  }

  return res.status(200).json({ 
    subscribers: subs.length,
    webpushAvailable,
    vapidPublicKeySet: !!process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKeySet: !!process.env.VAPID_PRIVATE_KEY,
    supabaseUrlSet: !!process.env.SUPABASE_URL,
  });
}
