export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST only"
    });
  }

  try {

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
        body: JSON.stringify(req.body)
      }
    );

    const text = await response.text();

    return res
      .status(response.status)
      .send(text);

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
}
