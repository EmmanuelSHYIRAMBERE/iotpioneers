/**
 * Connected globe engine (connected-globe-hero skill). No React: geometry is pure functions with
 * unit tests, and `GlobeRenderer` draws one frame onto a 2D canvas from a given state.
 *
 * Coordinates: unit sphere, y up, x right, z toward the viewer. Longitude 0 faces the viewer at
 * spin 0; increasing spin turns the globe west to east (the visible surface moves right).
 */
import { globe } from "@/lib/motion";
import { createSeededRandom } from "@/lib/seededRandom";
import { colors, hexToRgb } from "@/lib/tokens";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const DEG = Math.PI / 180;

export function latLonToVec(latDeg: number, lonDeg: number): Vec3 {
  const lat = latDeg * DEG;
  const lon = lonDeg * DEG;
  return { x: Math.cos(lat) * Math.sin(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) };
}

/** Rotation about the vertical axis (spin). */
export function rotateY(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

/** Rotation about the horizontal axis. Positive tilts the north pole toward the viewer. */
export function rotateX(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

/** Rotation in the screen plane. */
export function rotateZ(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
}

/** Globe orientation: spin about y, then pointer yaw, then tilt about x. */
export interface Orientation {
  spin: number;
  tilt: number;
  yaw: number;
}

export function orient(v: Vec3, o: Orientation): Vec3 {
  return rotateX(rotateY(rotateY(v, o.spin), o.yaw), o.tilt);
}

/** Spin that puts a longitude facing the viewer. */
export function spinFacing(lonDeg: number): number {
  return -lonDeg * DEG;
}

/** Angle between two unit vectors (radians). */
export function angleBetween(a: Vec3, b: Vec3): number {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  return Math.acos(dot);
}

/** Spherical interpolation between two unit vectors. */
export function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const omega = angleBetween(a, b);
  if (omega < 1e-6) return { ...a };
  const sinO = Math.sin(omega);
  const ka = Math.sin((1 - t) * omega) / sinO;
  const kb = Math.sin(t * omega) / sinO;
  return { x: a.x * ka + b.x * kb, y: a.y * ka + b.y * kb, z: a.z * ka + b.z * kb };
}

/** Lift of an arc at its midpoint, in sphere radii: longer arcs rise higher. */
export function arcLift(omega: number): number {
  return 0.06 + 0.22 * (omega / Math.PI);
}

/**
 * Great circle arc from `a` to `b`, lifted above the surface in proportion to its length.
 * Returns `samples + 1` points as a flat [x, y, z, ...] array in model space.
 */
export function arcPoints(a: Vec3, b: Vec3, samples: number): Float32Array {
  const out = new Float32Array((samples + 1) * 3);
  const lift = arcLift(angleBetween(a, b));
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const p = slerp(a, b, t);
    const h = 1 + lift * Math.sin(Math.PI * t);
    out[i * 3] = p.x * h;
    out[i * 3 + 1] = p.y * h;
    out[i * 3 + 2] = p.z * h;
  }
  return out;
}

/** True when a point (in view space) is hidden behind the globe disc. */
export function isOccluded(v: Vec3): boolean {
  return v.z < 0 && v.x * v.x + v.y * v.y < 1;
}

/**
 * Decode the run-length land rows of lib/globePoints.ts into unit vectors (flat xyz array).
 * Must mirror the grid in scripts/generateGlobePoints.ts.
 */
export function decodeGlobePoints(rows: readonly string[], stepDeg: number): Float32Array {
  const vectors: number[] = [];
  rows.forEach((row, r) => {
    if (!row) return;
    const lat = 90 - stepDeg / 2 - r * stepDeg;
    const count = Math.max(1, Math.floor(360 / (stepDeg / Math.cos(lat * DEG))));
    for (const run of row.split(",")) {
      const [startText, endText] = run.split("-");
      const start = Number(startText);
      const end = endText === undefined ? start : Number(endText);
      for (let i = start; i <= end; i += 1) {
        const v = latLonToVec(lat, -180 + ((i + 0.5) * 360) / count);
        vectors.push(v.x, v.y, v.z);
      }
    }
  });
  return Float32Array.from(vectors);
}

/** A tilted circular orbit around the globe. */
export interface Orbit {
  /** Radius in globe radii (1.15 to 1.35). */
  radius: number;
  /** Inclination of the orbit plane (radians, about x). */
  inclination: number;
  /** Rotation of the orbit plane in the screen plane (radians, about z). */
  node: number;
  /** One revolution, in milliseconds. */
  periodMs: number;
  /** Starting angle (radians). */
  phase: number;
}

/** Position of a body on an orbit at angle `theta`, in view space (before pointer tilt). */
export function orbitPoint(orbit: Orbit, theta: number): Vec3 {
  const flat = { x: Math.cos(theta) * orbit.radius, y: 0, z: Math.sin(theta) * orbit.radius };
  return rotateZ(rotateX(flat, orbit.inclination), orbit.node);
}

/** Orbit angle at a time. */
export function orbitAngle(orbit: Orbit, timeMs: number): number {
  return orbit.phase + ((timeMs % orbit.periodMs) / orbit.periodMs) * Math.PI * 2;
}

/** Packet progress (0..1) on an arc at a time. */
export function packetProgress(periodMs: number, offsetMs: number, timeMs: number): number {
  return ((((timeMs + offsetMs) % periodMs) + periodMs) % periodMs) / periodMs;
}

/** Arc destinations: unlabelled regional points spread across continents (never named). */
export const ARC_TARGETS: readonly (readonly [number, number])[] = [
  [49, 10],
  [10, -2],
  [-26, 25],
  [22, 79],
  [40, -97],
  [-12, -55],
  [33, 108],
  [-25, 134],
];

/** Orbits: periods from the globe motion tokens. */
export const ORBITS: readonly Orbit[] = [
  {
    radius: globe.orbitRadiusMin,
    inclination: 18 * DEG,
    node: 14 * DEG,
    periodMs: globe.orbitPeriodsMs[0],
    phase: 0.4,
  },
  {
    radius: (globe.orbitRadiusMin + globe.orbitRadiusMax) / 2,
    inclination: -26 * DEG,
    node: -22 * DEG,
    periodMs: globe.orbitPeriodsMs[1],
    phase: 2.6,
  },
  {
    radius: globe.orbitRadiusMax,
    inclination: 64 * DEG,
    node: 72 * DEG,
    periodMs: globe.orbitPeriodsMs[2],
    phase: 4.4,
  },
];

/** Deterministic packet timings per arc, inside the token range. */
export function packetTimings(count: number): { periodMs: number; offsetMs: number }[] {
  const span = globe.packetMaxMs - globe.packetMinMs;
  return Array.from({ length: count }, (_, i) => {
    const k = ((i * 7) % count) / Math.max(1, count - 1);
    const periodMs = globe.packetMinMs + span * k;
    return { periodMs, offsetMs: (i * periodMs) / count };
  });
}

/* ---------------------------------------------------------------------------------------------
 * Renderer
 * ------------------------------------------------------------------------------------------- */

export interface GlobeFrame {
  timeMs: number;
  orientation: Orientation;
  /** Draw travelling packets and the Kigali ring (false for the static and gentle frames). */
  animated: boolean;
  /** Draw orbit paths (icons are DOM elements positioned from `orbitBodies`). Default true. */
  orbits?: boolean;
  /** Spawn and draw edge connections between orbit icons and the globe rim. Default false. */
  edges?: boolean;
}

/** A short-lived link from an orbit icon to a land point near the globe's front rim. */
interface EdgeLink {
  orbit: number;
  /** Index of the land point (into the point array, multiple of 3). */
  point: number;
  startMs: number;
}

/** Front points whose depth is below this sit near the rim (candidate edge targets). */
const RIM_DEPTH = 0.3;

export interface OrbitBody {
  x: number;
  y: number;
  /** Behind the globe disc. */
  behind: boolean;
}

const CYAN = hexToRgb(colors.cyan400);
const GOLD = hexToRgb(colors.brightGold);
const PIONEER = hexToRgb(colors.pioneerGold);
const NAVY = hexToRgb(colors.navy950);
const NAVY_RAISED = hexToRgb(colors.navy900);

function rgba(rgb: readonly [number, number, number], alpha: number): string {
  return `rgba(${String(rgb[0])}, ${String(rgb[1])}, ${String(rgb[2])}, ${alpha.toFixed(3)})`;
}

/** Dot alpha buckets: each bucket is one path and one fill per frame. */
const BUCKETS = 8;
const FRONT_MAX = 0.6;
const BACK_MAX = 0.15;
const ARC_SAMPLES = 48;

export interface RendererOptions {
  arcs: number;
  orbits: boolean;
}

export class GlobeRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly points: Float32Array;
  private readonly arcs: Float32Array[];
  private readonly packets: { periodMs: number; offsetMs: number }[];
  private readonly kigali: Vec3;
  private readonly options: RendererOptions;
  private readonly frontStyles: string[];
  private readonly backStyles: string[];
  private readonly frontPaths: Path2D[] = [];
  private size = 0;
  private dpr = 1;
  /** Edge connections in flight, the next spawn time and the rim candidates from the last frame. */
  private links: EdgeLink[] = [];
  private nextEdgeMs = 0;
  private readonly random = createSeededRandom(11);
  private rim: number[] = [];

  constructor(ctx: CanvasRenderingContext2D, points: Float32Array, options: RendererOptions) {
    this.ctx = ctx;
    this.points = points;
    this.options = options;
    this.kigali = latLonToVec(globe.kigaliLat, globe.kigaliLon);
    this.arcs = ARC_TARGETS.slice(0, options.arcs).map(([lat, lon]) =>
      arcPoints(this.kigali, latLonToVec(lat, lon), ARC_SAMPLES),
    );
    this.packets = packetTimings(this.arcs.length);
    this.frontStyles = Array.from({ length: BUCKETS }, (_, b) =>
      rgba(CYAN, (FRONT_MAX * (b + 1)) / BUCKETS),
    );
    this.backStyles = Array.from({ length: BUCKETS }, (_, b) =>
      rgba(CYAN, (BACK_MAX * (b + 1)) / BUCKETS),
    );
  }

  resize(size: number, devicePixelRatio: number): void {
    this.size = size;
    this.dpr = Math.min(globe.maxDpr, Math.max(1, devicePixelRatio));
    const canvas = this.ctx.canvas;
    canvas.width = Math.round(size * this.dpr);
    canvas.height = Math.round(size * this.dpr);
  }

  /** Globe radius in CSS pixels: room for orbits when they are drawn. */
  get radius(): number {
    return (this.size / 2) * (this.options.orbits ? 0.72 : 0.94);
  }

  /** Orbit body positions for the DOM icons (CSS pixels from the canvas top left). */
  orbitBodies(frame: GlobeFrame): OrbitBody[] {
    if (!this.options.orbits) return [];
    const c = this.size / 2;
    const r = this.radius;
    return ORBITS.map((orbit) => {
      const p = rotateX(
        rotateY(orbitPoint(orbit, orbitAngle(orbit, frame.timeMs)), frame.orientation.yaw),
        frame.orientation.tilt - globe.staticTiltDeg * DEG,
      );
      return { x: c + p.x * r, y: c - p.y * r, behind: isOccluded(p) || p.z < 0 };
    });
  }

  draw(frame: GlobeFrame): void {
    const { ctx } = this;
    const size = this.size;
    if (size === 0) return;
    const c = size / 2;
    const r = this.radius;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const orbits = this.options.orbits && frame.orbits !== false;
    if (orbits) this.drawOrbits(frame, c, r, true);

    // Disc: navy body with a soft shade toward the lower right, so far-side items read as behind.
    const body = ctx.createRadialGradient(c - r * 0.35, c - r * 0.35, r * 0.1, c, c, r);
    body.addColorStop(0, rgba(NAVY_RAISED, 0.9));
    body.addColorStop(1, rgba(NAVY, 0.94));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();

    this.drawDots(frame.orientation, c, r);

    // Rim light: brightGold at 30% on the upper left edge.
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(GOLD, 0.3);
    ctx.beginPath();
    ctx.arc(c, c, r - 0.75, Math.PI * 1.05, Math.PI * 1.6);
    ctx.stroke();

    this.drawArcs(frame, c, r);
    this.drawKigali(frame, c, r);

    if (orbits) this.drawOrbits(frame, c, r, false);
    if (orbits && frame.edges === true) this.drawEdges(frame, c, r);
    else this.links = [];
  }

  /** Number of edge connections currently drawn (for tests and diagnostics). */
  get edgeCount(): number {
    return this.links.length;
  }

  /**
   * Edge connections: every 2 to 4 seconds an orbit icon in front of the globe links to the
   * nearest land point near the front rim. A brightGold packet travels the line, then the line
   * fades out over 1 second. At most `globe.edgeMax` links exist at once.
   */
  private drawEdges(frame: GlobeFrame, c: number, r: number): void {
    const { ctx } = this;
    const now = frame.timeMs;
    const bodies = this.orbitBodies(frame);
    const life = globe.edgeTravelMs + globe.edgeFadeMs;
    this.links = this.links.filter((link) => now - link.startMs < life && now >= link.startMs);

    if (now >= this.nextEdgeMs) {
      const span = globe.edgeEveryMaxMs - globe.edgeEveryMinMs;
      this.nextEdgeMs = now + globe.edgeEveryMinMs + this.random() * span;
      if (this.links.length < globe.edgeMax) {
        const free = bodies
          .map((body, index) => ({ body, index }))
          .filter(({ body, index }) => !body.behind && !this.links.some((l) => l.orbit === index));
        const pick = free[Math.floor(this.random() * free.length)];
        if (pick) {
          let best = -1;
          let bestDistance = Infinity;
          for (let i = 0; i < this.rim.length; i += 3) {
            const dx = (this.rim[i] ?? 0) - pick.body.x;
            const dy = (this.rim[i + 1] ?? 0) - pick.body.y;
            const d = dx * dx + dy * dy;
            if (d < bestDistance) {
              bestDistance = d;
              best = this.rim[i + 2] ?? -1;
            }
          }
          if (best >= 0) this.links.push({ orbit: pick.index, point: best, startMs: now });
        }
      }
    }

    ctx.lineWidth = 1;
    for (const link of this.links) {
      const body = bodies[link.orbit];
      if (!body) continue;
      const p = this.project(
        this.points[link.point] ?? 0,
        this.points[link.point + 1] ?? 0,
        this.points[link.point + 2] ?? 0,
        frame.orientation,
      );
      if (p.z < 0) continue;
      const tx = c + p.x * r;
      const ty = c - p.y * r;
      const age = now - link.startMs;
      const travel = Math.min(1, age / globe.edgeTravelMs);
      const fade =
        age <= globe.edgeTravelMs ? 1 : 1 - (age - globe.edgeTravelMs) / globe.edgeFadeMs;
      ctx.strokeStyle = rgba(CYAN, 0.45 * fade);
      ctx.beginPath();
      ctx.moveTo(body.x, body.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      if (age <= globe.edgeTravelMs) {
        ctx.fillStyle = rgba(GOLD, 0.95);
        ctx.beginPath();
        ctx.arc(
          body.x + (tx - body.x) * travel,
          body.y + (ty - body.y) * travel,
          1.75,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }

  private drawDots(o: Orientation, c: number, r: number): void {
    const { ctx, points } = this;
    const cosS = Math.cos(o.spin + o.yaw);
    const sinS = Math.sin(o.spin + o.yaw);
    const cosT = Math.cos(o.tilt);
    const sinT = Math.sin(o.tilt);
    const front: Path2D[] = this.frontPaths;
    // Front points near the rim, as [x, y, pointIndex] triples (edge connection targets).
    const rim: number[] = [];
    const back: Path2D[] = [];
    for (let b = 0; b < BUCKETS; b += 1) {
      front[b] = new Path2D();
      back[b] = new Path2D();
    }
    const dot = 1.5;
    const half = dot / 2;
    for (let i = 0; i < points.length; i += 3) {
      const px = points[i] ?? 0;
      const py = points[i + 1] ?? 0;
      const pz = points[i + 2] ?? 0;
      // Spin (about y), then tilt (about x).
      const x1 = px * cosS + pz * sinS;
      const z1 = -px * sinS + pz * cosS;
      const y2 = py * cosT - z1 * sinT;
      const z2 = py * sinT + z1 * cosT;
      const sx = c + x1 * r;
      const sy = c - y2 * r;
      if (z2 >= 0) {
        if (z2 < RIM_DEPTH) rim.push(sx, sy, i);
        // Front: fade in near the edge.
        const k = Math.min(1, z2 / 0.35);
        const b = Math.min(BUCKETS - 1, Math.floor(k * BUCKETS));
        front[b]?.rect(sx - half, sy - half, dot, dot);
      } else {
        // Back: skip dots past 70% of the radius (they crowd the rim).
        if (x1 * x1 + y2 * y2 > 0.49) continue;
        const k = Math.min(1, -z2 / 0.6);
        const b = Math.min(BUCKETS - 1, Math.floor(k * BUCKETS));
        back[b]?.rect(sx - half, sy - half, 1.2, 1.2);
      }
    }
    this.rim = rim;
    for (let b = 0; b < BUCKETS; b += 1) {
      const path = back[b];
      if (!path) continue;
      ctx.fillStyle = this.backStyles[b] ?? "transparent";
      ctx.fill(path);
    }
    for (let b = 0; b < BUCKETS; b += 1) {
      const path = front[b];
      if (!path) continue;
      ctx.fillStyle = this.frontStyles[b] ?? "transparent";
      ctx.fill(path);
    }
  }

  private project(x: number, y: number, z: number, o: Orientation): Vec3 {
    return orient({ x, y, z }, o);
  }

  private drawArcs(frame: GlobeFrame, c: number, r: number): void {
    const { ctx } = this;
    ctx.lineWidth = 1;
    this.arcs.forEach((arc, index) => {
      ctx.beginPath();
      let pen = false;
      let visibleSeen = false;
      for (let i = 0; i < arc.length; i += 3) {
        const p = this.project(arc[i] ?? 0, arc[i + 1] ?? 0, arc[i + 2] ?? 0, frame.orientation);
        const sx = c + p.x * r;
        const sy = c - p.y * r;
        if (isOccluded(p)) {
          pen = false;
          continue;
        }
        visibleSeen = true;
        if (pen) ctx.lineTo(sx, sy);
        else ctx.moveTo(sx, sy);
        pen = true;
      }
      if (!visibleSeen) return;
      ctx.strokeStyle = rgba(CYAN, 0.35);
      ctx.stroke();

      if (!frame.animated) return;
      const timing = this.packets[index];
      if (!timing) return;
      const t = packetProgress(timing.periodMs, timing.offsetMs, frame.timeMs);
      const samples = arc.length / 3 - 1;
      const at = Math.min(samples, Math.floor(t * samples)) * 3;
      const p = this.project(arc[at] ?? 0, arc[at + 1] ?? 0, arc[at + 2] ?? 0, frame.orientation);
      if (isOccluded(p)) return;
      const fade = Math.min(1, t * 6, (1 - t) * 6);
      ctx.fillStyle = rgba(GOLD, 0.95 * fade);
      ctx.beginPath();
      ctx.arc(c + p.x * r, c - p.y * r, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawKigali(frame: GlobeFrame, c: number, r: number): void {
    const { ctx } = this;
    const p = orient(this.kigali, frame.orientation);
    if (p.z < -0.05) return;
    const sx = c + p.x * r;
    const sy = c - p.y * r;
    const edge = Math.min(1, Math.max(0, p.z / 0.2));
    if (frame.animated) {
      const k = (frame.timeMs % globe.kigaliPulseMs) / globe.kigaliPulseMs;
      const ring = globe.kigaliNodePx / 2 + ((globe.kigaliRingMaxPx - globe.kigaliNodePx) / 2) * k;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rgba(PIONEER, 0.8 * (1 - k) * edge);
      ctx.beginPath();
      ctx.arc(sx, sy, ring, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = rgba(PIONEER, edge);
    ctx.beginPath();
    ctx.arc(sx, sy, globe.kigaliNodePx / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawOrbits(frame: GlobeFrame, c: number, r: number, behind: boolean): void {
    const { ctx } = this;
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(CYAN, 0.12);
    const segments = 72;
    for (const orbit of ORBITS) {
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= segments; i += 1) {
        const p = rotateX(
          rotateY(orbitPoint(orbit, (i / segments) * Math.PI * 2), frame.orientation.yaw),
          frame.orientation.tilt - globe.staticTiltDeg * DEG,
        );
        const isBehind = p.z < 0;
        if (isBehind !== behind) {
          pen = false;
          continue;
        }
        const sx = c + p.x * r;
        const sy = c - p.y * r;
        if (pen) ctx.lineTo(sx, sy);
        else ctx.moveTo(sx, sy);
        pen = true;
      }
      ctx.stroke();
    }
  }
}
