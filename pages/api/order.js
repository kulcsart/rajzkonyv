export default async function handler(req, res) {
  const sid = req.query.session_id || req.body?.session_id || '';
  if (!sid) return res.status(400).json({ error: 'missing_session_id' });

  const base = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!base) return res.status(500).json({ error: 'missing GOOGLE_APPS_SCRIPT_URL' });

  const url = `${base}?endpoint=checkout-session&session_id=${encodeURIComponent(sid)}`;

  try {
    const r = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'NextJS-Proxy/1.0' } });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    console.error('Proxy /api/order error:', err);
    return res.status(500).json({ error: 'proxy_failed' });
  }
}
