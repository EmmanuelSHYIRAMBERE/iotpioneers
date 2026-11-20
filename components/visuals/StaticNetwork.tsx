import { createSeededRandom } from "@/lib/seededRandom";
import { colors } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import { globe } from "@/lib/motion";
import {
  ARC_TARGETS,
  arcPoints,
  isOccluded,
  latLonToVec,
  orient,
  spinFacing,
  type Vec3,
} from "./globeEngine";

export interface StaticNetworkProps {
  seed?: number;
  variant?: "ambient" | "converge";
  /** Faint hero layer: fewer nodes at half opacity. */
  faint?: boolean;
  /**
   * Converge point as fractions of the view box (default: centre). The CTA puts it below the
   * button row (audit issue 30).
   */
  focus?: { x: number; y: number };
  className?: string;
}

const W = 1440;
const H = 900;

/**
 * Server rendered SVG version of the network: the no JavaScript fallback and the first
 * paint before the canvas takes over. Deterministic from the seed.
 */
export function StaticNetwork({
  seed = 7,
  variant = "ambient",
  faint = false,
  focus,
  className,
}: StaticNetworkProps) {
  const random = createSeededRandom(seed);
  const count = faint ? 25 : variant === "converge" ? 36 : 60;
  const dim = faint ? 0.5 : 1;
  const nodes = Array.from({ length: count }, (_, i) => {
    const x = variant === "converge" ? random() * W : W * Math.pow(random(), 0.55);
    const y = random() * H;
    return { x, y, r: 0.9 + random() * 0.8, signal: i % 10 === 0 };
  });
  const links: { x1: number; y1: number; x2: number; y2: number; o: number }[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 150) links.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, o: 0.22 * (1 - d / 150) });
    }
  }
  return (
    <svg
      viewBox={`0 0 ${String(W)} ${String(H)}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      {links.map((link, index) => (
        <line
          key={index}
          x1={link.x1.toFixed(1)}
          y1={link.y1.toFixed(1)}
          x2={link.x2.toFixed(1)}
          y2={link.y2.toFixed(1)}
          stroke={colors.slate400}
          strokeOpacity={(link.o * dim).toFixed(3)}
          strokeWidth="1"
        />
      ))}
      {nodes.map((node, index) => (
        <circle
          key={index}
          cx={node.x.toFixed(1)}
          cy={node.y.toFixed(1)}
          r={node.r.toFixed(2)}
          fill={node.signal ? colors.cyan400 : colors.slate400}
          fillOpacity={((node.signal ? 0.9 : 0.5) * dim).toFixed(2)}
        />
      ))}
      {variant === "converge" ? (
        <circle cx={W * (focus?.x ?? 0.5)} cy={H * (focus?.y ?? 0.5)} r="6" fill={colors.cyan400} />
      ) : null}
    </svg>
  );
}

export interface StaticGlobeProps {
  /** Mobile composition: 4 arcs instead of 8. */
  compact?: boolean;
  className?: string;
}

const GLOBE_VIEW = 100;
const GLOBE_R = 36;
const DEG = Math.PI / 180;

function projectPath(points: readonly Vec3[]): string {
  // Visible (front) segments only, as one path in the 100 by 100 view box.
  let d = "";
  let pen = false;
  for (const p of points) {
    if (isOccluded(p)) {
      pen = false;
      continue;
    }
    const x = (GLOBE_VIEW / 2 + p.x * GLOBE_R).toFixed(1);
    const y = (GLOBE_VIEW / 2 - p.y * GLOBE_R).toFixed(1);
    d += `${pen ? "L" : "M"}${x} ${y}`;
    pen = true;
  }
  return d;
}

/**
 * Server rendered still frame of the connected globe: the no JavaScript fallback and the first
 * paint before the canvas takes over. Kigali faces the viewer at the static tilt, with a light
 * graticule instead of land dots (the dot data loads lazily) and the arcs drawn, no packets.
 */
export function StaticGlobe({ compact = false, className }: StaticGlobeProps) {
  const orientation = {
    spin: spinFacing(globe.kigaliLon),
    tilt: globe.staticTiltDeg * DEG,
    yaw: 0,
  };
  const graticule: string[] = [];
  for (const lat of [-40, -20, 0, 20, 40, 60]) {
    graticule.push(
      projectPath(
        Array.from({ length: 49 }, (_, i) => orient(latLonToVec(lat, -180 + i * 7.5), orientation)),
      ),
    );
  }
  for (let lon = -180; lon < 180; lon += 30) {
    graticule.push(
      projectPath(
        Array.from({ length: 31 }, (_, i) => orient(latLonToVec(-75 + i * 5, lon), orientation)),
      ),
    );
  }
  const kigali = latLonToVec(globe.kigaliLat, globe.kigaliLon);
  const arcs = ARC_TARGETS.slice(0, compact ? globe.arcsMobile : globe.arcsDesktop).map(
    ([lat, lon]) => {
      const flat = arcPoints(kigali, latLonToVec(lat, lon), 24);
      const pts: Vec3[] = [];
      for (let i = 0; i < flat.length; i += 3) {
        pts.push(
          orient({ x: flat[i] ?? 0, y: flat[i + 1] ?? 0, z: flat[i + 2] ?? 0 }, orientation),
        );
      }
      return projectPath(pts);
    },
  );
  const k = orient(kigali, orientation);
  const kx = GLOBE_VIEW / 2 + k.x * GLOBE_R;
  const ky = GLOBE_VIEW / 2 - k.y * GLOBE_R;
  // The canvas leaves room for orbits on desktop (radius 72% of half the box) and fills 94% on
  // mobile, where there are no orbits.
  const zoom = compact ? 0.94 / 0.72 : 1;
  return (
    <svg
      viewBox={`0 0 ${String(GLOBE_VIEW)} ${String(GLOBE_VIEW)}`}
      aria-hidden="true"
      focusable="false"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      <g transform={`translate(50 50) scale(${zoom.toFixed(3)}) translate(-50 -50)`}>
        <circle cx="50" cy="50" r={GLOBE_R} fill={colors.navy900} fillOpacity="0.9" />
        <g fill="none" stroke={colors.cyan400} strokeOpacity="0.14" strokeWidth="0.25">
          {graticule.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <path
          d={`M${(50 + GLOBE_R * Math.cos(1.05 * Math.PI)).toFixed(1)} ${(50 + GLOBE_R * Math.sin(1.05 * Math.PI)).toFixed(1)}A${String(GLOBE_R)} ${String(GLOBE_R)} 0 0 1 ${(50 + GLOBE_R * Math.cos(1.6 * Math.PI)).toFixed(1)} ${(50 + GLOBE_R * Math.sin(1.6 * Math.PI)).toFixed(1)}`}
          fill="none"
          stroke={colors.brightGold}
          strokeOpacity="0.3"
          strokeWidth="0.45"
        />
        <g fill="none" stroke={colors.cyan400} strokeOpacity="0.35" strokeWidth="0.3">
          {arcs.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <circle cx={kx.toFixed(1)} cy={ky.toFixed(1)} r="0.9" fill={colors.pioneerGold} />
      </g>
    </svg>
  );
}
