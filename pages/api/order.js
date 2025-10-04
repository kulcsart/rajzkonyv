export default async function handler(req, res) {
  try {
    const { session_id } = req.query || {};
    if (!session_id) {
      console.log("Missing session_id in query:", req.query);
      return res.status(400).json({ error: "missing_session_id" });
    }

    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!gasUrl) {
      console.error("Missing GOOGLE_APPS_SCRIPT_URL environment variable");
      return res.status(500).json({ error: "Missing GOOGLE_APPS_SCRIPT_URL configuration" });
    }

    const url = `${gasUrl}?endpoint=checkout-session&session_id=${encodeURIComponent(session_id)}`;
    console.log("Making request to Google Apps Script:", url);
    
    const gasRes = await fetch(url, { 
      method: "GET",
      headers: {
        'User-Agent': 'NextJS-Proxy/1.0'
      }
    });
    
    if (!gasRes.ok) {
      console.error(`Google Apps Script responded with status ${gasRes.status}:`, gasRes.statusText);
      const errorText = await gasRes.text();
      console.error("Error response body:", errorText);
      return res.status(gasRes.status).json({ 
        error: "Google Apps Script error", 
        details: errorText,
        status: gasRes.status 
      });
    }
    
    const data = await gasRes.json();
    console.log("Successfully received data from Google Apps Script");
    
    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy /api/order error:", err.message);
    console.error("Stack trace:", err.stack);
    return res.status(500).json({ 
      error: "proxy_failed", 
      message: err.message,
      details: "Check server logs for more information"
    });
  }
}
