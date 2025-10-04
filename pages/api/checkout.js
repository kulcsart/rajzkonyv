// pages/api/checkout.js
export default async function handler(req, res) {
  // CORS az éles doménre + preflight támogatás
  const ORIGIN = 'https://www.rajzkonyv.hu';
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let stripeKey;
  stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });

  // form POST (application/x-www-form-urlencoded) és JSON body is támogatott
  let size;
  size = (req.body && (req.body.size ?? req.body['size'])) || '';
  if (!size) return res.status(400).json({ error: 'missing_size' });

  try {
    // Stripe Checkout session létrehozása
    let params;
    params = new URLSearchParams();
    params.set('mode', 'payment');

    // 9 900 Ft (HUF) – 990000 = 9900 * 100
    params.set('line_items[0][price_data][currency]', 'huf');
    params.set('line_items[0][price_data][product_data][name]', 'Rajzkönyv fotókönyv');
    params.set('line_items[0][price_data][unit_amount]', String(990000));
    params.set('line_items[0][quantity]', '1');

    // siker / cancel URL-ek
    params.set('success_url', 'https://www.rajzkonyv.hu/koszonjuk?siker=1&session_id={CHECKOUT_SESSION_ID}');
    params.set('cancel_url',  'https://www.rajzkonyv.hu/megrendeles');

    // méret be a metadatába
    params.set('metadata[size]', String(size));

    let resp;
    resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    let data;
    data = await resp.json();
    if (!resp.ok || !data.url) {
      return res.status(500).json({ error: 'checkout_failed', details: data.error?.message || data });
    }

    // Ha redirect=1 a query-ben → azonnali átirányítás Stripe-ra (303 See Other)
    if (req.query.redirect === '1') {
      res.writeHead(303, {
        Location: data.url,
        'Cache-Control': 'no-store',
      });
      return res.end();
    }

    // Egyébként JSON-t adunk vissza (pl. fejlesztői módhoz)
    return res.status(200).json({ url: data.url });
  } catch (err) {
    return res.status(500).json({ error: 'checkout_error', message: err?.message || String(err) });
  }
}
