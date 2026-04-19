import { ImageResponse } from "next/og";

export const alt = "Commitly";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const title = params.slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
          backgroundColor: "#0969da",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 400,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, serif",
          }}
        >
          {params.username}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            lineHeight: 1.35,
            color: "rgba(255, 255, 255, 0.88)",
            maxWidth: 720,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          {title} — Verified commits, tailored to the role.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.55)",
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          }}
        >
          commitly.io/{params.username}/{params.slug}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
