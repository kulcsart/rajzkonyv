import { useRouter } from "next/router";

export default function Koszonjuk() {
  const { query } = useRouter();
  return (
    <main style={{ maxWidth: 560, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1>Köszönjük a megrendelést!</h1>
      <p>Sikeres fizetés.</p>
      {query.session_id && (
        <p>
          <small>Session ID: <code>{query.session_id}</code></small>
        </p>
      )}
    </main>
  );
}
