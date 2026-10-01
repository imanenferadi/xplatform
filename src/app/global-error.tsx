"use client";

// Last resort: the root layout itself crashed, so there is no theme, font or
// component library here — plain inline styles only.
export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          background: "#0f2d58",
          color: "#fff",
          fontFamily: "Tahoma, system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>سایت موقتاً مشکل داره</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          چند لحظه‌ی دیگه دوباره امتحان کن.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            padding: "10px 22px",
            borderRadius: 12,
            border: 0,
            background: "#fdd365",
            color: "#0f2d58",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          دوباره امتحان کن
        </button>
      </body>
    </html>
  );
}
