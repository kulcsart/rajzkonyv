// pages/koszonjuk.js
import { useEffect, useState } from "react";

export default function Koszonjuk() {
  let order, setOrder, error, setError, loading, setLoading;
  
  [order, setOrder] = useState(null);
  [error, setError] = useState(null);
  [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (!sid) {
      setError("Hiányzó session_id.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/order?session_id=${encodeURIComponent(sid)}`);
        if (!res.ok) throw new Error(`API hiba: ${res.status}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message || "Ismeretlen hiba.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmtHUF = (amount) => {
    if (typeof amount !== "number") return "";
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (loading) return <p>Rendelési adatok betöltése...</p>;
  if (error) return <p>Hiba történt: {error}</p>;
  if (!order) return <p>Nincs rendelési adat.</p>;

  return (
    <div className="order-wrapper">
      <p><span className="order-label">Rendelési azonosító:</span> <span id="order-id">{order.sessionId}</span></p>
      <p><span className="order-label">Választott méret:</span> <span id="order-size">{order.size || "—"}</span></p>
      <p><span className="order-label">Összeg:</span> <span id="order-amount">{fmtHUF(order.amount_total)}</span></p>
      <p><span className="order-label">Vásárló e-mail:</span> <span id="order-email">{order.customer_email || "—"}</span></p>
      <p><span className="order-label">Fizetési státusz:</span> <span id="order-status">{order.payment_status || "—"}</span></p>
      <p><span className="order-label">Termék neve:</span> <span id="order-product">{order.product_name || "—"}</span></p>
    </div>
  );
}