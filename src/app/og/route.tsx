import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || siteConfig.name;
  const subtitle =
    searchParams.get("subtitle") || "Experiences flipped our way.";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #050505 0%, #181818 100%)",
          color: "white",
          padding: "96px",
          fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <img
            src={`${siteConfig.url}/images/logo/logo-white.svg`}
            alt="19sixtyfive"
            width="180"
            height="130"
            style={{ objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: title.length > 40 ? 72 : 90,
              lineHeight: 1.05,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: subtitle.length > 60 ? 40 : 48,
              lineHeight: 1.3,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {subtitle}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <span>Singapore • {new Date().getFullYear()}</span>
          <span>{siteConfig.tagline}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
