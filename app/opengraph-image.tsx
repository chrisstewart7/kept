import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PayPig — Route token fees into subs and donations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* OG: white banner, PigMark circle + snout, PayPig wordmark, tagline (§14) */
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
          background: "#ffffff",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* soft tint accents */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "#E6F7FE",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -80,
            bottom: -160,
            width: 320,
            height: 320,
            borderRadius: 320,
            background: "#E6F7FE",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* PigMark: blue circle, white ears + snout, blue nostrils */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 140,
              background: "#00AFF0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 32,
                top: 26,
                width: 22,
                height: 22,
                borderRadius: 22,
                background: "#ffffff",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 32,
                top: 26,
                width: 22,
                height: 22,
                borderRadius: 22,
                background: "#ffffff",
              }}
            />
            <div
              style={{
                width: 72,
                height: 46,
                borderRadius: 23,
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 14,
                  background: "#00AFF0",
                }}
              />
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 14,
                  background: "#00AFF0",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            <span style={{ color: "#17202A" }}>Pay</span>
            <span style={{ color: "#00AFF0" }}>Pig</span>
          </div>
        </div>

        <div
          style={{
            fontSize: 54,
            lineHeight: 1.15,
            color: "#17202A",
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          Pump.fun fees, paid to creators.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: "#334155",
          }}
        >
          <div
            style={{
              background: "#E6F7FE",
              borderRadius: 999,
              padding: "10px 28px",
              color: "#17202A",
              display: "flex",
              gap: 10,
            }}
          >
            <span style={{ color: "#00AFF0", fontWeight: 700 }}>$9.99</span>
            sub → @luna
          </div>
          <div>paypig.app</div>
        </div>
      </div>
    ),
    size,
  );
}
