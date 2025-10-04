import Stripe from "stripe";

export async function getServerSideProps({ query }) {
  const { session_id } = query || {};
  if (!session_id) {
    return { props: { error: "Hiányzó session_id." } };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    });

    const firstItem = session.line_items?.data?.[0] || null;
    const size = session.metadata?.size || session.client_reference_id || null;

    return {
      props: {
        order: {
          orderId: session.id,
          size,
          amount_total: session.amount_total ?? null,
          currency: session.currency?.toUpperCase() || null,
          email: session.customer_details?.email || null,
          payment_status: session.payment_status || null,
          product_name:
            firstItem?.price?.product?.name || firstItem?.description || null,
        },
      },
    };
  } catch (err) {
    return { props: { error: err.message || "Stripe hiba" } };
  }
}

export default function Koszonjuk(props) {
  if (props.error) {
    return (
      <main className="order-wrapper">
        <p>Sikertelen betöltés: {props.error}</p>
      </main>
    );
  }

  const { orderId, size, amount_total, currency, email, payment_status, product_name } = props.order;

  return (
    <main className="order-wrapper">
      <p><span className="order-label">Rendelési azonosító:</span> <span className="order-value">{orderId}</span></p>
      <p><span className="order-label">Választott méret:</span> <span className="order-value">{size}</span></p>
      <p><span className="order-label">Összeg:</span> <span className="order-value">{formatAmount(amount_total, currency)}</span></p>
      <p><span className="order-label">Vásárló e-mail:</span> <span className="order-value">{email}</span></p>
      <p><span className="order-label">Fizetési státusz:</span> <span className="order-value">{payment_status}</span></p>
      <p><span className="order-label">Termék neve:</span> <span className="order-value">{product_name}</span></p>
    </main>
  );
}

// helper
function formatAmount(amount, currency) {
  if (!amount) return "";
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: currency || "HUF",
  }).format(amount / 100);
}
