export default async function handler(req, res) {
  const params = new URLSearchParams(req.query).toString();
  const url = `https://v3.football.api-sports.io/fixtures?${params}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "x-apisports-key": "b08f6877d56ad565b8dbb49558b764eb"
      }
    });
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "API fetch failed" });
  }
}
