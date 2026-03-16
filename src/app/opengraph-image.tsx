import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

export const alt = siteConfig.title;
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #eadcc6 0%, #d8c6a8 28%, #17302b 100%)",
          color: "#f6ecd9",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "58px 64px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "rgba(246, 236, 217, 0.76)",
            fontSize: 22,
            letterSpacing: 7,
            textTransform: "uppercase",
          }}
        >
          TarotDeck.online
        </div>

        <div style={{ display: "flex", gap: 36, justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
            <div
              style={{
                color: "#17302b",
                background: "rgba(255,255,255,0.72)",
                borderRadius: 999,
                display: "flex",
                fontSize: 22,
                padding: "12px 24px",
              }}
            >
              Beginner-safe decks, giftable bundles, and collector favorites
            </div>
            <div
              style={{
                color: "#17302b",
                display: "flex",
                fontFamily: "Georgia",
                fontSize: 76,
                fontWeight: 700,
                lineHeight: 1.02,
              }}
            >
              Find the tarot deck that already feels like yours.
            </div>
            <div
              style={{
                color: "rgba(23, 48, 43, 0.84)",
                display: "flex",
                fontSize: 30,
                lineHeight: 1.45,
              }}
            >
              Quiet guidance, gift-ready editions, and a calmer way to choose tarot online.
            </div>
          </div>

          <div
            style={{
              alignItems: "stretch",
              display: "flex",
              gap: 18,
            }}
          >
            <div
              style={{
                alignItems: "center",
                background: "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 36,
                display: "flex",
                fontFamily: "Georgia",
                fontSize: 28,
                height: 420,
                justifyContent: "center",
                padding: "32px 26px",
                textAlign: "center",
                width: 220,
              }}
            >
              Moonwake Tarot
            </div>
            <div
              style={{
                alignItems: "center",
                background: "rgba(255,255,255,0.85)",
                borderRadius: 30,
                color: "#17302b",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                justifyContent: "center",
                marginTop: 58,
                padding: "24px 28px",
                width: 190,
              }}
            >
              <div style={{ fontSize: 20, letterSpacing: 3, textTransform: "uppercase" }}>Ships to</div>
              <div style={{ fontFamily: "Georgia", fontSize: 32, lineHeight: 1.1, textAlign: "center" }}>
                US & Europe
              </div>
              <div style={{ fontSize: 22, lineHeight: 1.4, textAlign: "center" }}>14-day returns on unused items</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
