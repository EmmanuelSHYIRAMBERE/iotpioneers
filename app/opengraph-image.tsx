import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hero } from "@/content/hero";
import { site } from "@/content/site";
import { createSeededRandom } from "@/lib/seededRandom";
import { colors } from "@/lib/tokens";

export const alt = "IoT Pioneers: Engineering Intelligence. Connecting the Future.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

/**
 * 1200 by 630 social card: navy and gold, the client's logo lockup, the node motif and the hero
 * headline (text from content). The logo is read from public/ at build time (static route).
 */
export default function OpenGraphImage() {
  const logoData = readFileSync(join(process.cwd(), "public", site.logo.src));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;
  const logoHeight = 120;
  const logoWidth = Math.round((site.logo.width / site.logo.height) * logoHeight);
  const random = createSeededRandom(5);
  const nodes = Array.from({ length: 26 }, () => ({
    x: 640 + random() * 540,
    y: 40 + random() * 550,
    r: 2 + random() * 3,
  }));
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: colors.navy950,
        color: colors.cloud50,
        position: "relative",
      }}
    >
      {nodes.map((node, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            width: node.r * 2,
            height: node.r * 2,
            borderRadius: 999,
            background: index % 6 === 0 ? colors.pioneerGold : colors.slate400,
            opacity: index % 6 === 0 ? 0.9 : 0.45,
          }}
        />
      ))}
      {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain img only */}
      <img src={logoSrc} alt={site.name.text} width={logoWidth} height={logoHeight} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.02,
          letterSpacing: -2,
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          <span>{hero.lineOneLead}</span>
          <span style={{ color: colors.brightGold }}>{hero.emphasis}</span>
        </div>
        <span>{hero.lineTwo}</span>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: colors.slate400 }}>Kigali, Rwanda</div>
    </div>,
    size,
  );
}
