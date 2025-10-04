export default async function handler(req, res) {
  // --- CORS ---
  const ORIGIN = 'https://www.rajzkonyv.hu';
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  // ------------- CORS vége -------------

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let session_id;
  session_id = req.query.session_id;
  if (!session_id) return res.status(400).json({ error: 'missing_session_id' });

  let stripeKey;
  stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });

  try {
    let r;
    r = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}?expand[]=line_items.data.price.product`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );
    let s;
    s = await r.json();
    if (!r.ok) return res.status(500).json({ error: s?.error?.message || 'stripe_error' });

    let amount;
    amount = s.amount_total ? Math.round(s.amount_total / 100) : null;
    let order_number;
    order_number = `RZK-${s.id}`;
    return res.status(200).json({
      order_number,
      size: s.metadata?.size ?? null,
      amount_total: amount,
      customer_email: s.customer_details?.email ?? null,
      payment_status: s.payment_status === 'paid' ? 'fizetve' : s.payment_status,
      product_name: s.line_items?.data?.[0]?.price?.product?.name ?? null,
    });
  } catch (e) {
    return res.status(500).json({ error: 'order_failed' });
  }
}
