export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const secret = req.headers["x-notify-secret"] || req.query.secret;
  if (secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  const offset = req.query.offset || "1h";
  const isTest = req.query.test === "1";

  const supabaseUrl = process.env.SUPABASE_URL;
  const edgeFnUrl = `${supabaseUrl}/functions/v1/notify?offset=${offset}${isTest ? "&test=1" : ""}`;

  const response = await fetch(edgeFnUrl, {
    method: "GET",
    headers: {
      "x-notify-secret": process.env.NOTIFY_SECRET,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    },
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
