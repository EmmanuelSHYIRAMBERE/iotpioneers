import type { StockImage } from "./types";

/**
 * Stand-in photographs (imagery-stand-ins skill, audit issues 13 and 26), downloaded from
 * Unsplash into public/images/, cropped, graded toward navy shadows and kept under 300KB. If a
 * slot's `src` is ever null, components keep their existing line drawing. Never presented as the
 * IoT Pioneers team or as the exact product for sale. About photos live in content/about.ts.
 * Credits and file sizes: CONTENT_VERIFICATION.md, "Imagery stand-ins".
 */
const STAND_IN = "Stand in, pending client photo (Unsplash, downloaded 2026.11.20)";

interface Credit {
  photographer: string;
  sourceUrl: string;
}

function photo(
  src: string,
  width: number,
  height: number,
  alt: string,
  credit: Credit,
  illustrative = false,
): StockImage {
  return { src, alt, width, height, ...credit, illustrative, verified: false, source: STAND_IN };
}

/** Solutions panel photos (16:9), keyed by solution id. Shown behind the line drawing. */
export const solutionImages: Readonly<Record<string, StockImage>> = {
  iot: photo(
    "/images/solutions/iot.jpg",
    1120,
    630,
    "A microcontroller wired on a breadboard to a relay module on an electronics workbench",
    { photographer: "Clint Patterson", sourceUrl: "https://unsplash.com/photos/lPcXuJyoIjU" },
  ),
  software: photo(
    "/images/solutions/software.jpg",
    1120,
    630,
    "JavaScript code in a dark-themed code editor on a monitor",
    { photographer: "Joan Gamell", sourceUrl: "https://unsplash.com/photos/XmZ4GDAp9G0" },
  ),
  cloud: photo(
    "/images/solutions/cloudData.jpg",
    1120,
    630,
    "A data centre aisle between rows of server racks lit with blue status lights",
    { photographer: "Foo Bar", sourceUrl: "https://unsplash.com/photos/RdGLsSDMJ3E" },
  ),
};

/**
 * Why section "Built locally" band (21:9): the Kigali Convention Centre at night. Decorative, under
 * a 70% navy overlay.
 */
export const whyBandImage: StockImage = photo("/images/why/kigali.jpg", 1680, 720, "", {
  photographer: "One zone Studio",
  sourceUrl: "https://unsplash.com/photos/JVb3dQEMnfw",
});

/** CTA background (16:9): macro of a microcontroller chip. Decorative, under an 85% navy overlay. */
export const ctaImage: StockImage = photo("/images/cta/circuit.jpg", 1600, 900, "", {
  photographer: "Akshat Sharma",
  sourceUrl: "https://unsplash.com/photos/2FCOT4Xr82E",
});

/** Shop category images (1:1), keyed by shop category id. Always labelled "Illustrative image". */
export const shopCategoryImages: Readonly<Record<string, StockImage>> = {
  boards: photo(
    "/images/shop/boards.jpg",
    640,
    640,
    "Illustrative image: a development board on a breadboard, connected by USB",
    { photographer: "Clint Patterson", sourceUrl: "https://unsplash.com/photos/iEPCmOTYsjs" },
    true,
  ),
  sensors: photo(
    "/images/shop/sensors.jpg",
    640,
    640,
    "Illustrative image: a temperature and humidity sensor wired to a small development board",
    { photographer: "Jörg Grote", sourceUrl: "https://unsplash.com/photos/CuVM5UIB3us" },
    true,
  ),
  communication: photo(
    "/images/shop/communication.jpg",
    640,
    640,
    "Illustrative image: a wireless module board with an external antenna",
    { photographer: "Pi Supply", sourceUrl: "https://unsplash.com/photos/RhkiZj2OUDM" },
    true,
  ),
  displays: photo(
    "/images/shop/displays.jpg",
    640,
    640,
    "Illustrative image: a character LCD display wired to a microcontroller board on a breadboard",
    { photographer: "Jorge Ramirez", sourceUrl: "https://unsplash.com/photos/LMgravgBw5c" },
    true,
  ),
  prototyping: photo(
    "/images/shop/prototyping.jpg",
    640,
    640,
    "Illustrative image: coloured jumper wires on a breadboard",
    { photographer: "Nizzah Khusnunnisa", sourceUrl: "https://unsplash.com/photos/bQ1ZKPznu-w" },
    true,
  ),
  solar: photo(
    "/images/shop/solar.jpg",
    640,
    640,
    "Illustrative image: solar panels on a ground mount in front of trees",
    { photographer: "Jadon Kelly", sourceUrl: "https://unsplash.com/photos/ZujGM6jeUK8" },
    true,
  ),
};
