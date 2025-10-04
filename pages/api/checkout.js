import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// ➊ Normalizáló: "27x20 cm" → "27x20"
function normalizeSize(raw = "") {
  return String(raw)
    .toLowerCase()
    .replace(/\s*cm\s*$/i, "") // a végéről leveszi a "cm"-t (és környező szóközöket)
    .trim();
}

// ➋ A map kulcsai cm nélküliek
const PRICE_MAP = {
  "20x20": process.env.STRIPE_PRICE_20X20,
  "27x20": process.env.STRIPE_PRICE_27X20,
  "27x27": process.env.STRIPE_PRICE_27X27,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { size: rawSize } = req.body || {};
  const size = normalizeSize(rawSize);

  if (!size) {
    return res.status(400).json({ error: "Missing required field: size" });
  }

  const price = PRICE_MAP[size];

  if (!price) {
    // segítségképp felsoroljuk, mit vár a backend
    const supported = Object.keys(PRICE_MAP).join(", ");
    return res.status(400).json({
      error: `Unsupported size: ${size}. Supported: ${supported}. ` +
             `Add the STRIPE_PRICE_* env vars for each size.`,
    });
  }

  try {
    const base = (process.env.FRONTEND_URL || "https://www.rajzkonyv.hu").replace(/\/$/, "");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: size,
      metadata: { size },
      success_url: `${base}/koszonjuk?siker=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("Stripe session creation failed:", e);
    return res.status(500).json({
      error: e?.message || "Unexpected error while creating Stripe session",
    });
  }
}
