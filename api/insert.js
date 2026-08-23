export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {

    const payload = req.body;

    const response = await fetch(
      "https://yjhvylgdfuectplrqnzc.supabase.co/rest/v1/sensor_readings",
      {
        method: "POST",
        headers: {
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Authorization":
            `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.text();

    return res.status(response.status).send(data);

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
}
