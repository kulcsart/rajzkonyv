export default async function handler(req, res) {
  try {
    const { session_id } = req.query || {};
    if (!session_id) {
      return res.status(400).json({ error: "missing_session_id" });
    }

    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!gasUrl) {
      return res.status(500).json({ error: "Missing GOOGLE_APPS_SCRIPT_URL" });
    }

    const url = `${gasUrl}?endpoint=checkout-session&session_id=${encodeURIComponent(session_id)}`;
    const gasRes = await fetch(url, { method: "GET" });
    const data = await gasRes.json();

    return res.status(gasRes.ok ? 200 : gasRes.status).json(data);
  } catch (err) {
    console.error("Proxy /api/order error:", err);
    return res.status(500).json({ error: "proxy_failed" });
  }
}
