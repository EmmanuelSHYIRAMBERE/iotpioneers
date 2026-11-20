/** A deterministic pseudo random generator returning numbers in [0, 1). */
export type RandomFn = () => number;

/**
 * mulberry32: tiny, fast and good enough for demo data. The same seed always produces
 * the same sequence, so server and client renders of the demo agree.
 */
export function createSeededRandom(seed: number): RandomFn {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random number in [min, max). */
export function randomBetween(random: RandomFn, min: number, max: number): number {
  return min + (max - min) * random();
}

/** Random integer in [min, max]. */
export function randomInt(random: RandomFn, min: number, max: number): number {
  return Math.floor(randomBetween(random, min, max + 1));
}
