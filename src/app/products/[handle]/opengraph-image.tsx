import { ImageResponse } from "next/og";
import { getSeedProduct } from "@/lib/catalog";
import { getProductStory } from "@/lib/site";

export const runtime = "edge";

export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default async function ProductOpenGraphImage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const seedProduct = getSeedProduct(handle);
  const story = getProductStory(handle);
  const title = seedProduct?.title || "TarotDeck.online";
  const description = seedProduct?.description || story.note;
  const category = seedProduct?.categories?.[0] || "Tarot deck";

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "linear-gradient(135deg, #f0e1c7 0%, #cfb07c 28%, #16302b 100%)",
          color: "#17302b",
          display: "flex",
          gap: 42,
          height: "100%",
          padding: "58px 62px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.82)",
            borderRadius: 40,
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 42px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                color: "rgba(23, 48, 43, 0.68)",
                display: "flex",
                fontSize: 22,
                letterSpacing: 6,
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Georgia",
                fontSize: 74,
                fontWeight: 700,
                lineHeight: 1.02,
              }}
            >
              {title}
            </div>
            <div
              style={{
                color: "rgba(23, 48, 43, 0.8)",
                display: "flex",
                fontSize: 30,
                lineHeight: 1.4,
                maxWidth: 640,
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 18,
            }}
          >
            <div
              style={{
                background: "#17302b",
                borderRadius: 999,
                color: "#f6ecd9",
                display: "flex",
                fontSize: 22,
                padding: "12px 20px",
              }}
            >
              Ships to US & Europe
            </div>
            <div
              style={{
                background: "rgba(23, 48, 43, 0.08)",
                borderRadius: 999,
                display: "flex",
                fontSize: 22,
                padding: "12px 20px",
              }}
            >
              Gift-ready editions
            </div>
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            justifyContent: "center",
            width: 300,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 38,
              color: "#f6ecd9",
              display: "flex",
              fontFamily: "Georgia",
              fontSize: 34,
              height: 420,
              justifyContent: "center",
              lineHeight: 1.1,
              padding: "30px 28px",
              textAlign: "center",
              width: 260,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "rgba(246, 236, 217, 0.75)",
              display: "flex",
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            tarotdeck.online
          </div>
        </div>
      </div>
    ),
    size
  );
}
