import { useEffect, useState } from "react";

export default function Koszonjuk() {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    (async () => {
      try {
        const res = await fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Nem sikerült betölteni a rendelés adatait.");
      }
    })();
  }, []);

  if (error) return <p>{error}</p>;
  if (!order) return <p>Rendelés adatainak betöltése...</p>;

  return (
    <div className="order-wrapper">
      <h2>Köszönjük a megrendelést!</h2>
      <p><strong>Rendelési azonosító:</strong> {order.sessionId}</p>
      <p><strong>Választott méret:</strong> {order.size}</p>
      <p><strong>Fizetési státusz:</strong> {order.payment_status}</p>
      <p><strong>Összeg:</strong> {order.amount_total} {order.currency}</p>
      <p><strong>Vásárló e-mail:</strong> {order.customer_email}</p>
    </div>
  );
}
