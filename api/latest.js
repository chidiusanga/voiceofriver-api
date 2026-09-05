export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

// Prevent Vercel/browser caching
res.setHeader("Cache-Control", "no-store, max-age=0");
  
if (req.method === "OPTIONS") {
return res.status(200).end();
}
  
  try {

    const response = await fetch(
      "https://yjhvylgdfuectplrqnzc.supabase.co/rest/v1/sensor_readings?select=*&order=created_at.desc&limit=1",
      {
        headers: {
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Authorization":
            `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    const rows = await response.json();

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: "No readings found"
      });
    }

    const row = rows[0];

    return res.status(200).json({
      created_at: row.created_at,
    
      Node1_TEMP: row.temperature,
      Node1_TURBIDITY: row.turbidity,
      Node1_WATERLEVEL: row.level,
    
      Node2_TDS: row.tds,
      Node2_EC: row.ec,
    
      Node3_PH: row.ph,
    
      latitude: row.latitude,
      longitude: row.longitude,
      gps_fix: row.gps_fix,
      gps_age_seconds: row.gps_age_seconds
});





    
    

    // return res.status(200).json({
    //   created_at: row.created_at,
      
    //   Node1_TEMP: row.temperature,
    //   Node1_TURBIDITY: row.turbidity,
    //   Node1_WATERLEVEL: row.level,

    //   Node2_TDS: row.tds,
    //   Node2_EC: row.ec,

    //   Node3_PH: row.ph

    // });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
