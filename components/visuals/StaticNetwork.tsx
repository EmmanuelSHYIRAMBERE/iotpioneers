import { createSeededRandom } from "@/lib/seededRandom";
import { colors } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export interface StaticNetworkProps {
  seed?: number;
  variant?: "ambient" | "converge";
  className?: string;
}

const W = 1440;
const H = 900;

/**
 * Server rendered SVG version of the network: the no JavaScript fallback and the first
 * paint before the canvas takes over. Deterministic from the seed.
 */
export function StaticNetwork({ seed = 7, variant = "ambient", className }: StaticNetworkProps) {
  const random = createSeededRandom(seed);
  const count = variant === "converge" ? 36 : 60;
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
          strokeOpacity={link.o.toFixed(3)}
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
          fillOpacity={node.signal ? 0.9 : 0.5}
        />
      ))}
      {variant === "converge" ? <circle cx={W / 2} cy={H / 2} r="6" fill={colors.cyan400} /> : null}
    </svg>
  );
}
