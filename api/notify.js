import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

webpush.setVapidDetails(
  "mailto:enriquedcruz16@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// All group stage fixtures with kickoff times (UTC)
const FIXTURES = [
  {id:"s_A1",home:"Mexico",away:"South Africa",kickoff:"2026-06-12T00:00:00Z"},
  {id:"s_A2",home:"South Korea",away:"Czechia",kickoff:"2026-06-12T03:00:00Z"},
  {id:"s_B1",home:"Canada",away:"Bosnia-Herzegovina",kickoff:"2026-06-12T20:00:00Z"},
  {id:"s_D1",home:"USA",away:"Paraguay",kickoff:"2026-06-13T01:00:00Z"},
  {id:"s_C1",home:"Brazil",away:"Morocco",kickoff:"2026-06-13T03:00:00Z"},
  {id:"s_B2",home:"Switzerland",away:"Qatar",kickoff:"2026-06-13T20:00:00Z"},
  {id:"s_F1",home:"Argentina",away:"Senegal",kickoff:"2026-06-14T00:00:00Z"},
  {id:"s_E1",home:"Germany",away:"Netherlands",kickoff:"2026-06-14T03:00:00Z"},
  {id:"s_C2",home:"Haiti",away:"Scotland",kickoff:"2026-06-14T20:00:00Z"},
  {id:"s_D2",home:"Australia",away:"Türkiye",kickoff:"2026-06-15T00:00:00Z"},
  {id:"s_E2",home:"Ivory Coast",away:"Ecuador",kickoff:"2026-06-15T03:00:00Z"},
  {id:"s_G1",home:"Spain",away:"Croatia",kickoff:"2026-06-15T20:00:00Z"},
  {id:"s_F2",home:"Nigeria",away:"Thailand",kickoff:"2026-06-16T00:00:00Z"},
  {id:"s_H1",home:"France",away:"Japan",kickoff:"2026-06-16T03:00:00Z"},
  {id:"s_G2",home:"Ghana",away:"Panama",kickoff:"2026-06-16T20:00:00Z"},
  {id:"s_H2",home:"Belgium",away:"Sweden",kickoff:"2026-06-17T00:00:00Z"},
  {id:"s_K1",home:"Portugal",away:"DR Congo",kickoff:"2026-06-17T18:00:00Z"},
  {id:"s_I1",home:"Egypt",away:"Cameroon",kickoff:"2026-06-17T21:00:00Z"},
  {id:"s_J1",home:"Uruguay",away:"Iran",kickoff:"2026-06-18T00:00:00Z"},
  {id:"s_L1",home:"England",away:"Algeria",kickoff:"2026-06-18T03:00:00Z"},
];

export default async function handler(req, res) {
  // Verify secret to prevent unauthorised calls
  const secret = req.headers["x-notify-secret"] || req.query.secret;
  if (secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  const offset = req.query.offset || "1h"; // "24h" or "1h"
  const isTest = req.query.test === "1";
  const now = Date.now();
  const windowMs = offset === "24h"
    ? { min: 23.5 * 3600 * 1000, max: 24.5 * 3600 * 1000 }
    : { min: 45 * 60 * 1000,     max: 75 * 60 * 1000 };

  // Find fixtures kicking off in the target window
  let upcoming = FIXTURES.filter(f => {
    const diff = new Date(f.kickoff).getTime() - now;
    return diff >= windowMs.min && diff <= windowMs.max;
  });

  // Test mode: send a dummy notification to verify the pipeline works
  if (isTest) {
    upcoming = [{ id: "test", home: "Test", away: "Notification" }];
  }

  if (!upcoming.length) {
    return res.status(200).json({ sent: 0, message: "No fixtures in window" });
  }

  // Fetch all push subscriptions from Supabase
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("subscription");

  if (error) return res.status(500).json({ error: error.message });

  let sent = 0, failed = 0;

  for (const fixture of upcoming) {
    const title = offset === "24h"
      ? `⚽ ${fixture.home} vs ${fixture.away} — tomorrow!`
      : `⚽ ${fixture.home} vs ${fixture.away} — 1 hour to go!`;
    const body = offset === "24h"
      ? "Lock in your pick before it's too late 🔒"
      : "Last chance! Lock in your pick now 🔒";

    const payload = JSON.stringify({ title, body, url: "https://scoracle.live" });

    for (const row of subs) {
      try {
        await webpush.sendNotification(row.subscription, payload);
        sent++;
      } catch (err) {
        // Remove expired/invalid subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from("push_subscriptions")
            .delete().eq("subscription", row.subscription);
        }
        failed++;
      }
    }
  }

  res.status(200).json({ sent, failed, fixtures: upcoming.map(f => `${f.home} vs ${f.away}`) });
}
