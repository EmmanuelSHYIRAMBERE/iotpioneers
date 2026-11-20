import { describe, expect, it } from "vitest";
import {
  ARC_TARGETS,
  angleBetween,
  arcLift,
  arcPoints,
  decodeGlobePoints,
  isOccluded,
  latLonToVec,
  orbitPoint,
  ORBITS,
  orient,
  packetProgress,
  packetTimings,
  rotateX,
  rotateY,
  spinFacing,
} from "@/components/visuals/globeEngine";
import { GLOBE_POINT_COUNT, GLOBE_ROWS, GLOBE_STEP_DEG } from "@/lib/globePoints";
import { globe } from "@/lib/motion";

const close = (a: number, b: number, digits = 6): void => {
  expect(a).toBeCloseTo(b, digits);
};

describe("globeEngine projection and rotation", () => {
  it("maps latitude and longitude to unit vectors facing the viewer at lon 0", () => {
    const front = latLonToVec(0, 0);
    close(front.z, 1);
    const north = latLonToVec(90, 0);
    close(north.y, 1);
    const east = latLonToVec(0, 90);
    close(east.x, 1);
  });

  it("keeps vectors unit length under rotation", () => {
    const v = rotateX(rotateY(latLonToVec(-1.95, 30.06), 1.3), 0.4);
    close(Math.hypot(v.x, v.y, v.z), 1);
  });

  it("turns Kigali to face the viewer with spinFacing", () => {
    const k = orient(latLonToVec(globe.kigaliLat, globe.kigaliLon), {
      spin: spinFacing(globe.kigaliLon),
      tilt: 0,
      yaw: 0,
    });
    close(k.x, 0);
    expect(k.z).toBeGreaterThan(0.99);
  });

  it("positive tilt brings the north pole toward the viewer", () => {
    const pole = rotateX({ x: 0, y: 1, z: 0 }, 0.3);
    expect(pole.z).toBeGreaterThan(0);
  });

  it("detects points hidden behind the disc", () => {
    expect(isOccluded({ x: 0, y: 0, z: -1 })).toBe(true);
    expect(isOccluded({ x: 0, y: 0, z: 1 })).toBe(false);
    expect(isOccluded({ x: 1.2, y: 0, z: -0.1 })).toBe(false);
  });
});

describe("globeEngine arcs", () => {
  it("starts at the origin, ends at the target and lifts in the middle", () => {
    const a = latLonToVec(globe.kigaliLat, globe.kigaliLon);
    const b = latLonToVec(49, 10);
    const samples = 20;
    const arc = arcPoints(a, b, samples);
    expect(arc).toHaveLength((samples + 1) * 3);
    close(arc[0] ?? 0, a.x, 5);
    close(arc[samples * 3 + 2] ?? 0, b.z, 5);
    const mid = samples / 2;
    const height = Math.hypot(arc[mid * 3] ?? 0, arc[mid * 3 + 1] ?? 0, arc[mid * 3 + 2] ?? 0);
    close(height, 1 + arcLift(angleBetween(a, b)), 4);
    expect(height).toBeGreaterThan(1);
  });

  it("lifts longer arcs higher", () => {
    expect(arcLift(Math.PI / 2)).toBeGreaterThan(arcLift(Math.PI / 8));
  });

  it("has 6 to 8 unlabelled targets", () => {
    expect(ARC_TARGETS.length).toBeGreaterThanOrEqual(6);
    expect(ARC_TARGETS.length).toBeLessThanOrEqual(8);
    for (const target of ARC_TARGETS) expect(target).toHaveLength(2);
  });

  it("schedules packets inside the token range and loops progress in [0, 1)", () => {
    for (const t of packetTimings(8)) {
      expect(t.periodMs).toBeGreaterThanOrEqual(globe.packetMinMs);
      expect(t.periodMs).toBeLessThanOrEqual(globe.packetMaxMs);
    }
    const p = packetProgress(4000, 500, 123_456);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThan(1);
  });
});

describe("globeEngine orbits", () => {
  it("has 2 or 3 orbits within 1.15 to 1.35 radii", () => {
    expect(ORBITS.length).toBeGreaterThanOrEqual(2);
    expect(ORBITS.length).toBeLessThanOrEqual(3);
    for (const orbit of ORBITS) {
      expect(orbit.radius).toBeGreaterThanOrEqual(globe.orbitRadiusMin);
      expect(orbit.radius).toBeLessThanOrEqual(globe.orbitRadiusMax);
      const p = orbitPoint(orbit, 1.1);
      close(Math.hypot(p.x, p.y, p.z), orbit.radius, 5);
    }
  });

  it("passes both behind and in front of the globe", () => {
    const orbit = ORBITS[0];
    if (!orbit) throw new Error("no orbit");
    const zs = Array.from({ length: 16 }, (_, i) => orbitPoint(orbit, (i / 16) * Math.PI * 2).z);
    expect(Math.min(...zs)).toBeLessThan(0);
    expect(Math.max(...zs)).toBeGreaterThan(0);
  });
});

describe("globe point data", () => {
  it("decodes to the recorded number of unit vectors", () => {
    const points = decodeGlobePoints(GLOBE_ROWS, GLOBE_STEP_DEG);
    expect(points.length).toBe(GLOBE_POINT_COUNT * 3);
    expect(GLOBE_POINT_COUNT).toBeGreaterThan(2500);
    expect(GLOBE_POINT_COUNT).toBeLessThan(4000);
    close(Math.hypot(points[0] ?? 0, points[1] ?? 0, points[2] ?? 0), 1, 5);
  });

  it("puts land near Kigali (Africa is not empty)", () => {
    const points = decodeGlobePoints(GLOBE_ROWS, GLOBE_STEP_DEG);
    const k = latLonToVec(globe.kigaliLat, globe.kigaliLon);
    let nearest = Infinity;
    for (let i = 0; i < points.length; i += 3) {
      nearest = Math.min(
        nearest,
        angleBetween(k, { x: points[i] ?? 0, y: points[i + 1] ?? 0, z: points[i + 2] ?? 0 }),
      );
    }
    expect(nearest).toBeLessThan((3 * Math.PI) / 180);
  });
});
