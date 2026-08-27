export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const response = await fetch(
      "https://yjhvylgdfuectplrqnzc.supabase.co/rest/v1/sensor_readings?select=*&order=created_at.asc&limit=1000",
      {
        headers: {
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Authorization":
            `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    const rows = await response.json();

    return res.status(200).json(rows);

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
