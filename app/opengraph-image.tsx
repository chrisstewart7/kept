import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kept — Route token fees into subs and donations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* OG: white card, blue K, headline, one payout figure (§14) */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f8ff",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#0b1220",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 40,
              fontWeight: 700,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 16,
                width: 6,
                height: 32,
                borderRadius: 3,
                background: "#3b82f6",
              }}
            />
            K
          </div>
          <div style={{ fontSize: 44, color: "#0b1220" }}>Kept</div>
        </div>
        <div
          style={{
            fontSize: 76,
            lineHeight: 1.05,
            color: "#0b1220",
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          Route token fees into subs and donations
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: "#334155",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 999,
              padding: "10px 28px",
              color: "#0b1220",
              display: "flex",
              gap: 10,
            }}
          >
            <span style={{ color: "#1d4ed8", fontWeight: 700 }}>$9.99</span>
            sub → @luna
          </div>
          <div>usekept.app</div>
        </div>
      </div>
    ),
    size,
  );
}
