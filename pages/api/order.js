import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default async function handler(req, res) {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "Missing session_id" });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "customer_details"],
    });

    const size = session.metadata?.size || null;
    const email = session.customer_details?.email || null;
    const status = session.payment_status || null;
    const currency = session.currency?.toUpperCase() || null;
    const amount_total = session.amount_total ?? null;
    const productName = session.line_items?.data?.[0]?.description || null;

    res.status(200).json({
      id: session.id,
      size,
      email,
      status,
      currency,
      amount_total,
      productName,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch order" });
  }
}
