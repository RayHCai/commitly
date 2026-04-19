import { ImageResponse } from "next/og";

export const alt = "Commitly";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#1f3a2e",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 400,
            color: "#fafaf7",
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, serif",
          }}
        >
          Commitly
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            lineHeight: 1.35,
            color: "rgba(250, 250, 247, 0.88)",
            maxWidth: 720,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          Verified commits, tailored to the role.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
