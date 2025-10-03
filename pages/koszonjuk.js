import Stripe from "stripe";

export async function getServerSideProps({ query }) {
  const { session_id } = query || {};
  if (!session_id) {
    return { props: { ok: false, error: "Hiányzó session_id." } };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });

  try {
    // A line_items + product bővítés akkor kell, ha a termék nevét is szeretnéd
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    });

    // Amit a checkout létrehozáskor beállítottunk:
    // client_reference_id: size
    // metadata: { size }
    const size =
      session.metadata?.size ||
      session.client_reference_id ||
      null;

    const amount_total = session.amount_total; // pl. 990000 (minor units)
    const currency = session.currency; // pl. "huf"
    const email = session.customer_details?.email || "";
    const payment_status = session.payment_status; // "paid" | "unpaid" | "no_payment_required"
    const orderId = session.id; // a Checkout Session azonosító

    // Ha kell a termék neve az első tételből:
    const firstItem = session.line_items?.data?.[0] || null;
    const productName =
      firstItem?.price?.product?.name || firstItem?.description || "";

    return {
      props: {
        ok: true,
        session_id,
        orderId,
        size,
        amount_total,
        currency,
        email,
        payment_status,
        productName,
      },
    };
  } catch (err) {
    return { props: { ok: false, error: err.message || "Stripe hiba" } };
  }
}

export default function Koszonjuk(props) {
  if (!props.ok) {
    return (
      <main style={{ maxWidth: 560, margin: "40px auto", fontFamily: "system-ui" }}>
        <h1>Köszönjük!</h1>
        <p>Nem sikerült betölteni a rendelés adatait.</p>
        {props.error && <p style={{ color: "#c33" }}>{props.error}</p>}
      </main>
    );
  }

  // segédfv. – HUF esetén nincs tized
  const formatAmount = (amount, currency) => {
    if (amount == null) return "—";
    const zeroDecimal = ["huf", "jpy", "krw"].includes(
      (currency || "").toLowerCase()
    );
    return zeroDecimal
      ? `${amount.toLocaleString("hu-HU")} ${currency.toUpperCase()}`
      : `${(amount / 100).toLocaleString("hu-HU", { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`;
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui", lineHeight: 1.5 }}>
      <h1>Rendelésed beérkezett 🎉</h1>

      <p><b>Rendelési azonosító:</b> {props.orderId}</p>
      <p><b>Állapot:</b> {props.payment_status === "paid" ? "Fizetve" : props.payment_status}</p>
      <p><b>Választott méret:</b> {props.size || "—"}</p>
      <p><b>Termék:</b> {props.productName || "Rajzkönyv gyűjtődoboz"}</p>
      <p><b>Végösszeg:</b> {formatAmount(props.amount_total, props.currency)}</p>
      <p><b>Értesítési email:</b> {props.email || "—"}</p>

      <hr style={{ margin: "24px 0", opacity: 0.2 }} />

      <p><b>Szállítás várható ideje:</b> 7–10 munkanap</p>
      <p>
        Ha kérdésed van, írj nekünk: <a href="mailto:info@rajzkonyv.hu">info@rajzkonyv.hu</a> vagy hívj: <a href="tel:+36307770269">+36 30 777 02 69</a>
      </p>
    </main>
  );
}
