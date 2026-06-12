import { createClient } from "@supabase/supabase-js";

async function makeVapidJwt(audience, subject, publicKeyB64u, privateKeyB64u) {
  const b64u = (buf) => Buffer.from(buf).toString("base64url");
  const header = b64u(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64u(JSON.stringify({ aud: audience, exp: now + 43200, sub: subject }));
  const unsigned = `${header}.${payload}`;

  const pubRaw = Buffer.from(publicKeyB64u, "base64url");
  const privRaw = Buffer.from(privateKeyB64u, "base64url");

  const jwk = {
    kty: "EC", crv: "P-256", ext: true,
    x: b64u(pubRaw.slice(1, 33)),
    y: b64u(pubRaw.slice(33, 65)),
    d: b64u(privRaw),
  };

  const key = await crypto.subtle.importKey(
    "jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(unsigned)
  );
  return `${unsigned}.${b64u(new Uint8Array(sig))}`;
}

async function encryptPayload(subscription, payloadStr) {
  const b64u = (buf) => Buffer.from(buf).toString("base64url");
  const enc = new TextEncoder();

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );
  const localPublicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey));

  const receiverPublicKey = await crypto.subtle.importKey(
    "raw", Buffer.from(subscription.keys.p256dh, "base64url"),
    { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverPublicKey }, localKeyPair.privateKey, 256
  );

  const authSecret = Buffer.from(subscription.keys.auth, "base64url");

  async function hkdf(salt, ikm, info, length) {
    const key = await crypto.subtle.importKey("raw", ikm, { name: "HKDF" }, false, ["deriveBits"]);
    return new Uint8Array(await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt, info: enc.encode(info) }, key, length * 8
    ));
  }

  const receiverPublicRaw = Buffer.from(subscription.keys.p256dh, "base64url");
  const ikmInfo = Buffer.concat([enc.encode("WebPush: info\0"), receiverPublicRaw, localPublicRaw]);
  const ikm = await (async () => {
    const prk = await crypto.subtle.importKey("raw", sharedBits, { name: "HKDF" }, false, ["deriveBits"]);
    return new Uint8Array(await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: authSecret, info: ikmInfo }, prk, 256
    ));
  })();

  const cek = await hkdf(salt, ikm, "Content-Encoding: aes128gcm\0\0\0\0\x10", 16);
  const nonce = await hkdf(salt, ikm, "Content-Encoding: nonce\0", 12);

  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const plaintext = Buffer.concat([enc.encode(payloadStr), Buffer.from([2])]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, plaintext));

  // RFC 8291 header: salt(16) + rs(4) + idlen(1) + localPublic(65) + ciphertext
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([localPublicRaw.length]), localPublicRaw, ciphertext]);
}

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
  res.setHeader("Access-Control-Allow-Origin", "*");

  const secret = req.headers["x-notify-secret"] || req.query.secret;
  if (secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  const offset = req.query.offset || "1h";
  const isTest = req.query.test === "1";
  const now = Date.now();
  const windowMs = offset === "24h"
    ? { min: 23.5 * 3600 * 1000, max: 24.5 * 3600 * 1000 }
    : { min: 45 * 60 * 1000, max: 75 * 60 * 1000 };

  let upcoming = FIXTURES.filter(f => {
    const diff = new Date(f.kickoff).getTime() - now;
    return diff >= windowMs.min && diff <= windowMs.max;
  });

  if (isTest) upcoming = [{ id: "test", home: "Test", away: "Notification" }];
  if (!upcoming.length) return res.status(200).json({ sent: 0, message: "No fixtures in window" });

  const { data: subs, error } = await supabase.from("push_subscriptions").select("subscription");
  if (error) return res.status(500).json({ error: error.message });

  let sent = 0, failed = 0;
  for (const fixture of upcoming) {
    const title = isTest ? "⚽ Scoracle Test"
      : offset === "24h" ? `⚽ ${fixture.home} vs ${fixture.away} — tomorrow!`
      : `⚽ ${fixture.home} vs ${fixture.away} — 1 hour to go!`;
    const body = isTest ? "Notifications are working! 🎉"
      : offset === "24h" ? "Lock in your pick before it's too late 🔒"
      : "Last chance! Lock in your pick now 🔒";
    const payload = JSON.stringify({ title, body, url: "https://scoracle.live" });

    for (const row of subs) {
      try {
        const sub = row.subscription;
        const audience = new URL(sub.endpoint).origin;
        const jwt = await makeVapidJwt(audience, "mailto:enriquedcruz16@gmail.com", vapidPublic, vapidPrivate);
        const body = await encryptPayload(sub, payload);

        const pushRes = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Authorization": `vapid t=${jwt},k=${vapidPublic}`,
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "aes128gcm",
            "TTL": "86400",
          },
          body,
        });
        if (pushRes.status === 201 || pushRes.status === 200) sent++;
        else if (pushRes.status === 404 || pushRes.status === 410) {
          await supabase.from("push_subscriptions").delete().eq("user_id", row.user_id);
          failed++;
        } else failed++;
      } catch (e) { failed++; }
    }
  }

  return res.status(200).json({ sent, failed, fixtures: upcoming.map(f => `${f.home} vs ${f.away}`) });
}
