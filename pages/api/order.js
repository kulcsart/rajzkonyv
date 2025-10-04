export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const r = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const contentType = r.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await r.json()
      : await r.text();

    res.status(r.ok ? 200 : r.status).send(payload);
  } catch (err) {
    console.error("GAS proxy error:", err);
    res.status(500).json({ error: "Failed to call Apps Script" });
  }
}
