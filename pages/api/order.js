// rajzkonyv/pages/api/order.js
export default async function handler(req, res) {
  try {
    const sid =
      req.method === 'GET'
        ? (req.query.session_id || req.query.sessionId)
        : (req.body?.session_id || req.body?.sessionId);

    if (!sid) {
      return res.status(400).json({ error: 'missing_session_id' });
    }

    const base = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!base) return res.status(500).json({ error: 'missing_env_GOOGLE_APPS_SCRIPT_URL' });

    const url = `${base}?endpoint=checkout-session&session_id=${encodeURIComponent(sid)}`;

    const r = await fetch(url, { method: 'GET' });
    const text = await r.text();

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    console.error('GAS proxy error:', err);
    res.status(500).json({ error: 'proxy_failed' });
  }
}
