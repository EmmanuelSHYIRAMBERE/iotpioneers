/**
 * One-off preparation of Unsplash stand-in photos (imagery-stand-ins skill).
 * Usage: node scripts/prepareImages.mjs <source.jpg> <target.jpg> <width> <height> [left,top,width,height]
 * The optional last argument pre-crops the source (for example to keep third-party signs out).
 * Crops to the slot ratio (cover, centre of attention), applies the shared cool grade (shadows
 * lifted toward navy #142642, highlights left neutral, saturation trimmed 8%), and writes a
 * progressive JPEG at quality 80, stepping down until the file is under 300KB.
 * Uses the sharp package that Next.js already installs (no new dependency).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const NAVY = [0x14, 0x26, 0x42];
const SHADOW_LIFT = 0.28; // strength of the navy tint at pure black, fading to 0 at white
const LIMIT = 300 * 1024;

async function main() {
  const [src, dst, w, h, region] = process.argv.slice(2);
  const width = Number(w);
  const height = Number(h);
  let pipeline = sharp(src).rotate();
  if (region) {
    const [left, top, rw, rh] = region.split(",").map(Number);
    pipeline = pipeline.extract({ left, top, width: rw, height: rh });
  }
  const { data, info } = await pipeline
    .resize(width, height, { fit: "cover", position: sharp.strategy.attention })
    .modulate({ saturation: 0.92 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) {
    const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    const k = SHADOW_LIFT * (1 - lum) * (1 - lum);
    for (let c = 0; c < 3; c += 1)
      data[i + c] = Math.round(data[i + c] + (NAVY[c] - data[i + c]) * k);
  }
  let quality = 80;
  let out;
  do {
    out = await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();
    quality -= 5;
  } while (out.length > LIMIT && quality >= 50);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, out);
  console.log(
    `${dst} ${info.width}x${info.height} q${quality + 5} ${Math.round(out.length / 1024)}KB`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
