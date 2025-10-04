import { useState } from "react";

const ALLOWED_SIZES = ["20x20 cm", "27x20 cm", "27x27 cm"];

export default function Home() {
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!ALLOWED_SIZES.includes(size)) {
      setError("Érvénytelen méret.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Hiba a fizetési folyamat indításakor.");
      }

      const { url } = await res.json();
      if (!url) throw new Error("Hiányzó átirányítási URL.");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError("Sajnos hiba történt. Kérlek próbáld újra.");
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "60px auto", fontFamily: "system-ui" }}>
      <form id="order-form" onSubmit={handleSubmit}>
        <fieldset disabled={loading} style={{ border: "none", padding: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: 12 }}>Válassz méretet</legend>

          <label htmlFor="size">Méret</label>
          <select
            id="size"
            name="size"
            required
            value={size}
            onChange={(e) => setSize(e.target.value)}
            style={{ display: "block", marginTop: 8, marginBottom: 16 }}
          >
            <option value="" disabled>
              Válassz egy méretet…
            </option>
            {ALLOWED_SIZES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </fieldset>

        <button type="submit" id="buy-btn" className="button-order" disabled={loading}>
          {loading ? "Kérem várjon…" : "Megrendelem"}
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: 16 }}>{error}</p>}
    </main>
  );
}
