"use client";

/**
 * Root-level error UI. Must define its own html/body (replaces root layout).
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          background: "#ffffff",
          color: "#1f2328",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#656d76",
              margin: "0 0 16px",
            }}
          >
            Error
          </p>
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 28,
              fontWeight: 400,
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            Something went wrong.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#656d76", margin: 0 }}>
            Reload the page or go back home.
          </p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "stretch",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "12px 20px",
                borderRadius: 8,
                border: "1px solid #d0d7de",
                background: "#ffffff",
                color: "#1f2328",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "12px 20px",
                borderRadius: 8,
                border: "none",
                background: "#0969da",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
