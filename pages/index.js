import { useState } from "react";

const SIZES = ["20x20", "27x20", "27x27"];

export default function Home() {
  const [size, setSize] = useState(SIZES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hopp, valami félrement.");
      window.location.href = data.url; // átirányítás Stripe Checkout-ra
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1>Rajzkönyv – Stripe checkout teszt</h1>

      <label>
        Méret:
        <select value={size} onChange={(e) => setSize(e.target.value)} style={{ marginLeft: 8 }}>
          {SIZES.map((s) => (
            <option key={s} value={s}>{s} cm</option>
          ))}
        </select>
      </label>

      <div style={{ marginTop: 16 }}>
        <button onClick={startCheckout} disabled={loading}>
          {loading ? "Továbbítás…" : "Tovább a fizetéshez"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
    </main>
  );
}
