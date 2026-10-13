import Link from "next/link";

/**
 * Root 404 for the rare paths the locale middleware doesn't handle (e.g.
 * dot-containing URLs excluded by the matcher). It renders its own document
 * because the root layout is a pass-through; localized 404s live in
 * `[locale]/not-found.tsx`.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
          color: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ textAlign: "center", padding: "0 16px" }}>
          <p style={{ fontSize: 20, fontWeight: 700 }}>
            Trip<span style={{ color: "#e31e24" }}>Pay</span>
          </p>
          <h1 style={{ fontSize: 24, margin: "12px 0 4px" }}>Page not found</h1>
          <p style={{ color: "#6b6b6b", fontSize: 14 }}>
            The page you are looking for doesn&apos;t exist.
          </p>
          <p style={{ marginTop: 16 }}>
            <Link href="/" style={{ color: "#e31e24", fontWeight: 500 }}>
              Go to the TripPay home page
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
