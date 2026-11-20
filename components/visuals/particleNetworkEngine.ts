/**
 * Canvas 2D node network. Pure drawing logic with no React, so it can be unit tested and
 * reused in "ambient" (hero) and "converge" (final CTA) modes.
 *
 * Performance rules (specification section 9.02): device pixel ratio capped at 2, a spatial
 * grid for neighbour search, typed arrays allocated once (no allocation inside the frame
 * loop), 30 FPS cap on devices with 4 or fewer logical cores, and the caller pauses the loop
 * when off screen or when the tab is hidden.
 */
import { createSeededRandom, type RandomFn } from "@/lib/seededRandom";
import { colors, hexToRgb } from "@/lib/tokens";

export type NetworkMode = "ambient" | "converge";
export type NetworkLayout = "right" | "top" | "full";

export interface CalmRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NetworkOptions {
  mode: NetworkMode;
  count: number;
  linkDistance: number;
  layout: NetworkLayout;
  interactive: boolean;
  seed: number;
  /** Cap at 30 FPS (low core count devices). */
  lowPower: boolean;
  /**
   * Faint background layer (hero behind the globe): few nodes, no pulses, half opacity, so the
   * globe stays the only strong focal point.
   */
  faint?: boolean;
}

/** Node counts and link distances by viewport (desktop, tablet, mobile). */
export function densityFor(
  width: number,
  mode: NetworkMode,
  faint = false,
): { count: number; linkDistance: number } {
  if (faint) return { count: width < 768 ? 16 : 25, linkDistance: width < 768 ? 110 : 170 };
  if (mode === "converge")
    return { count: width < 768 ? 28 : 40, linkDistance: width < 768 ? 100 : 140 };
  if (width < 768) return { count: 28, linkDistance: 100 };
  if (width < 1024) return { count: 45, linkDistance: 140 };
  return { count: 70, linkDistance: 140 };
}

const MAX_PULSES = 6;
const PULSE_EVERY = 900;
const PULSE_DURATION = 1200;
const POINTER_RADIUS = 160;
const POINTER_PULL = 12;
const LERP = 0.08;
const BASE_LINK_ALPHA = 0.22;
const BRIGHT_LINK_ALPHA = 0.45;
const NODE_ALPHA = 0.5;
const CALM_MAX_ALPHA = 0.3;
const RIPPLE_DURATION = 800;
const RIPPLE_RADIUS = 120;
const ENTRANCE = 1200;
const CENTRE_RADIUS = 6;
const CENTRE_GLOW = 48;
const CENTRE_PULSE = 2400;
const FAINT_ALPHA = 0.5;

const SLATE = hexToRgb(colors.slate400);
const CYAN = hexToRgb(colors.cyan400);

function rgba(rgb: readonly [number, number, number], alpha: number): string {
  return `rgba(${String(rgb[0])}, ${String(rgb[1])}, ${String(rgb[2])}, ${alpha.toFixed(3)})`;
}

/** Precomputed colour strings at 1% alpha steps, so the frame loop allocates no strings. */
const SLATE_STYLES = Array.from({ length: 101 }, (_, k) => rgba(SLATE, k / 100));
const CYAN_STYLES = Array.from({ length: 101 }, (_, k) => rgba(CYAN, k / 100));

function style(table: readonly string[], alpha: number): string {
  const index = Math.max(0, Math.min(100, Math.round(alpha * 100)));
  return table[index] ?? "transparent";
}

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

export class ParticleNetworkEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly options: NetworkOptions;
  private random: RandomFn;

  private width = 0;
  private height = 0;
  private dpr = 1;

  // Node data in typed arrays, allocated once per resize.
  private count = 0;
  private x = new Float32Array(0);
  private y = new Float32Array(0);
  private vx = new Float32Array(0);
  private vy = new Float32Array(0);
  private ox = new Float32Array(0);
  private oy = new Float32Array(0);
  private px = new Float32Array(0);
  private py = new Float32Array(0);
  private radius = new Float32Array(0);
  private signal = new Uint8Array(0);
  private fade = new Float32Array(0);

  // Spatial grid as linked lists in typed arrays.
  private cellSize = 140;
  private cols = 1;
  private rows = 1;
  private head = new Int32Array(1);
  private next = new Int32Array(0);

  // Pulses travelling along links.
  private pulseFrom = new Int32Array(MAX_PULSES);
  private pulseTo = new Int32Array(MAX_PULSES);
  private pulseStart = new Float64Array(MAX_PULSES).fill(-1);
  private lastPulseAt = 0;

  // Pointer (fine pointers) and ripple (touch).
  private pointerX = 0;
  private pointerY = 0;
  private pointerActive = false;
  private rippleX = 0;
  private rippleY = 0;
  private rippleStart = -1;

  private calm: CalmRect | null = null;
  /** Converge target in CSS pixels; null means the canvas centre. */
  private focus: { x: number; y: number } | null = null;
  private startedAt = -1;
  private lastFrame = 0;
  private frameId = 0;
  private running = false;
  private staticMode = false;

  /** Normalised pointer offset (-1..1), smoothed, for parallax in the caller. */
  parallaxX = 0;
  parallaxY = 0;
  private parallaxTargetX = 0;
  private parallaxTargetY = 0;
  onFrame: ((parallaxX: number, parallaxY: number) => void) | null = null;

  constructor(ctx: CanvasRenderingContext2D, options: NetworkOptions) {
    this.ctx = ctx;
    this.options = options;
    this.random = createSeededRandom(options.seed);
  }

  resize(width: number, height: number, devicePixelRatio: number): void {
    this.width = width;
    this.height = height;
    this.dpr = Math.min(2, Math.max(1, devicePixelRatio));
    const canvas = this.ctx.canvas;
    canvas.width = Math.round(width * this.dpr);
    canvas.height = Math.round(height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seed();
    if (!this.running) this.draw(performance.now());
  }

  setCalmRect(rect: CalmRect | null): void {
    this.calm = rect;
  }

  /** Converge mode: the point the network flows into (audit issue 30: below the button row). */
  setFocusPoint(point: { x: number; y: number } | null): void {
    this.focus = point;
    if (!this.running) this.draw(performance.now());
  }

  private convergeX(): number {
    return this.focus?.x ?? this.width / 2;
  }

  private convergeY(): number {
    return this.focus?.y ?? this.height / 2;
  }

  setPointer(x: number, y: number, active: boolean): void {
    this.pointerX = x;
    this.pointerY = y;
    this.pointerActive = active && this.options.interactive;
    if (this.width > 0 && this.height > 0 && this.pointerActive) {
      this.parallaxTargetX = (x / this.width) * 2 - 1;
      this.parallaxTargetY = (y / this.height) * 2 - 1;
    } else {
      this.parallaxTargetX = 0;
      this.parallaxTargetY = 0;
    }
  }

  ripple(x: number, y: number): void {
    this.rippleX = x;
    this.rippleY = y;
    this.rippleStart = performance.now();
    if (!this.running) this.draw(this.rippleStart);
  }

  /** Render one still frame and stop (reduced motion). */
  renderStatic(): void {
    this.stop();
    this.staticMode = true;
    this.startedAt = -ENTRANCE * 2;
    this.draw(0);
  }

  start(): void {
    if (this.running) return;
    this.staticMode = false;
    this.running = true;
    const now = performance.now();
    if (this.startedAt < 0) this.startedAt = now;
    this.lastFrame = now;
    this.frameId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  destroy(): void {
    this.stop();
    this.onFrame = null;
  }

  private readonly loop = (now: number): void => {
    if (!this.running) return;
    this.frameId = requestAnimationFrame(this.loop);
    const minInterval = this.options.lowPower ? 1000 / 30 : 0;
    const elapsed = now - this.lastFrame;
    if (elapsed < minInterval - 1) return;
    // Clamp long gaps (tab switches) so nodes do not jump.
    const dt = Math.min(elapsed, 50) / (1000 / 60);
    this.lastFrame = now;
    this.update(dt, now);
    this.draw(now);
  };

  private seed(): void {
    const { width: w, height: h } = this;
    const count = this.options.count;
    this.random = createSeededRandom(this.options.seed);
    this.count = count;
    this.x = new Float32Array(count);
    this.y = new Float32Array(count);
    this.vx = new Float32Array(count);
    this.vy = new Float32Array(count);
    this.ox = new Float32Array(count);
    this.oy = new Float32Array(count);
    this.px = new Float32Array(count);
    this.py = new Float32Array(count);
    this.radius = new Float32Array(count);
    this.signal = new Uint8Array(count);
    this.fade = new Float32Array(count).fill(1);
    this.next = new Int32Array(count);

    for (let i = 0; i < count; i += 1) {
      this.placeNode(i, w, h, true);
      this.radius[i] = 0.75 + this.random() * 0.75; // 1.5px to 3px diameter
      this.signal[i] = i % 10 === 0 ? 1 : 0; // 10% signal nodes
    }

    this.cellSize = this.options.linkDistance;
    this.cols = Math.max(1, Math.ceil(w / this.cellSize));
    this.rows = Math.max(1, Math.ceil(h / this.cellSize));
    this.head = new Int32Array(this.cols * this.rows);
    this.pulseStart.fill(-1);
  }

  private placeNode(i: number, w: number, h: number, initial: boolean): void {
    const r = this.random;
    if (this.options.mode === "converge") {
      if (initial) {
        this.x[i] = r() * w;
        this.y[i] = r() * h;
      } else {
        // Respawn on a random edge.
        const edge = Math.floor(r() * 4);
        this.x[i] = edge === 0 ? 0 : edge === 1 ? w : r() * w;
        this.y[i] = edge === 2 ? 0 : edge === 3 ? h : r() * h;
        this.fade[i] = 0;
      }
      const speed = 0.1 + r() * 0.2;
      this.vx[i] = speed;
      this.vy[i] = speed;
      return;
    }
    const layout = this.options.layout;
    // Bias distribution: denser to the right on desktop, the top 45% on mobile.
    this.x[i] = layout === "right" ? w * Math.pow(r(), 0.55) : r() * w;
    this.y[i] = layout === "top" ? h * 0.45 * Math.pow(r(), 0.85) : r() * h;
    const angle = r() * Math.PI * 2;
    const speed = 0.08 + r() * 0.17;
    this.vx[i] = Math.cos(angle) * speed;
    this.vy[i] = Math.sin(angle) * speed;
  }

  private update(dt: number, now: number): void {
    const { width: w, height: h, count } = this;
    const cx = this.convergeX();
    const cy = this.convergeY();
    const converge = this.options.mode === "converge";
    const topBand = this.options.layout === "top" ? h * 0.5 : h;

    for (let i = 0; i < count; i += 1) {
      if (converge) {
        const dx = cx - (this.x[i] ?? 0);
        const dy = cy - (this.y[i] ?? 0);
        const dist = Math.hypot(dx, dy) || 1;
        const speed = this.vx[i] ?? 0.2;
        this.x[i] = (this.x[i] ?? 0) + (dx / dist) * speed * dt;
        this.y[i] = (this.y[i] ?? 0) + (dy / dist) * speed * dt;
        this.fade[i] = Math.min(1, (this.fade[i] ?? 1) + 0.01 * dt);
        if (dist < 24) this.placeNode(i, w, h, false);
      } else {
        let nx = (this.x[i] ?? 0) + (this.vx[i] ?? 0) * dt;
        let ny = (this.y[i] ?? 0) + (this.vy[i] ?? 0) * dt;
        if (nx < -10) nx = w + 10;
        else if (nx > w + 10) nx = -10;
        if (ny < -10) ny = topBand + 10;
        else if (ny > topBand + 10) ny = -10;
        this.x[i] = nx;
        this.y[i] = ny;
      }

      // Pointer attraction with eased offsets.
      let tx = 0;
      let ty = 0;
      if (this.pointerActive) {
        const dx = this.pointerX - (this.x[i] ?? 0);
        const dy = this.pointerY - (this.y[i] ?? 0);
        const dist = Math.hypot(dx, dy);
        if (dist < POINTER_RADIUS && dist > 0.001) {
          const strength = 1 - dist / POINTER_RADIUS;
          tx = (dx / dist) * POINTER_PULL * strength;
          ty = (dy / dist) * POINTER_PULL * strength;
        }
      }
      this.ox[i] = (this.ox[i] ?? 0) + (tx - (this.ox[i] ?? 0)) * LERP;
      this.oy[i] = (this.oy[i] ?? 0) + (ty - (this.oy[i] ?? 0)) * LERP;
    }

    this.parallaxX += (this.parallaxTargetX - this.parallaxX) * LERP;
    this.parallaxY += (this.parallaxTargetY - this.parallaxY) * LERP;
    this.onFrame?.(this.parallaxX, this.parallaxY);

    if (!converge && !this.options.faint && now - this.lastPulseAt > PULSE_EVERY) {
      this.lastPulseAt = now;
      this.spawnPulse(now);
    }
  }

  private spawnPulse(now: number): void {
    let slot = -1;
    for (let p = 0; p < MAX_PULSES; p += 1) {
      const start = this.pulseStart[p] ?? -1;
      if (start < 0 || now - start > PULSE_DURATION) {
        slot = p;
        break;
      }
    }
    if (slot < 0 || this.count < 2) return;
    const limit = this.options.linkDistance;
    // Try a few random nodes to find one with a neighbour.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const i = Math.floor(this.random() * this.count);
      for (let j = 0; j < this.count; j += 1) {
        if (j === i) continue;
        const d = Math.hypot(
          (this.px[i] ?? 0) - (this.px[j] ?? 0),
          (this.py[i] ?? 0) - (this.py[j] ?? 0),
        );
        if (d < limit * 0.85) {
          this.pulseFrom[slot] = i;
          this.pulseTo[slot] = j;
          this.pulseStart[slot] = now;
          return;
        }
      }
    }
  }

  private nodeAlphaCap(x: number, y: number): number {
    const calm = this.calm;
    if (calm && x > calm.x && x < calm.x + calm.width && y > calm.y && y < calm.y + calm.height) {
      return CALM_MAX_ALPHA;
    }
    return 1;
  }

  private draw(now: number): void {
    const { ctx, width: w, height: h, count } = this;
    if (w === 0 || h === 0) return;
    ctx.clearRect(0, 0, w, h);

    // Entrance: nodes expand from 70% of their spread to 100% over 1.2s.
    const t = this.staticMode ? 1 : easeOutExpo(Math.min(1, (now - this.startedAt) / ENTRANCE));
    const spread = this.options.mode === "ambient" ? 0.7 + 0.3 * t : 1;
    const converge = this.options.mode === "converge";
    const cx = converge ? this.convergeX() : w / 2;
    const cy = converge ? this.convergeY() : this.options.layout === "top" ? h * 0.22 : h / 2;
    const dim = this.options.faint ? FAINT_ALPHA : 1;

    for (let i = 0; i < count; i += 1) {
      this.px[i] = cx + ((this.x[i] ?? 0) - cx) * spread + (this.ox[i] ?? 0);
      this.py[i] = cy + ((this.y[i] ?? 0) - cy) * spread + (this.oy[i] ?? 0);
    }

    // Rebuild the spatial grid.
    this.head.fill(-1);
    const size = this.cellSize;
    for (let i = 0; i < count; i += 1) {
      const col = Math.min(this.cols - 1, Math.max(0, Math.floor((this.px[i] ?? 0) / size)));
      const row = Math.min(this.rows - 1, Math.max(0, Math.floor((this.py[i] ?? 0) / size)));
      const cell = row * this.cols + col;
      this.next[i] = this.head[cell] ?? -1;
      this.head[cell] = i;
    }

    const rippleAge = this.rippleStart < 0 ? -1 : now - this.rippleStart;
    const rippleOn = rippleAge >= 0 && rippleAge < RIPPLE_DURATION;
    const limit = this.options.linkDistance;
    ctx.lineWidth = 1;

    // Links: each node checks its own cell and the forward neighbours, so each pair is seen once.
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        for (let i = this.head[row * this.cols + col] ?? -1; i >= 0; i = this.next[i] ?? -1) {
          for (let n = 0; n < 5; n += 1) {
            const nc = col + (n === 1 ? 1 : n === 2 ? -1 : n === 3 ? 0 : n === 4 ? 1 : 0);
            const nr = row + (n === 0 || n === 1 ? 0 : 1);
            if (nc < 0 || nc >= this.cols || nr >= this.rows) continue;
            const start = n === 0 ? (this.next[i] ?? -1) : (this.head[nr * this.cols + nc] ?? -1);
            for (let j = start; j >= 0; j = this.next[j] ?? -1) {
              this.drawLink(i, j, limit, rippleOn, rippleAge);
            }
          }
        }
      }
    }

    // Cursor as a temporary node.
    if (this.pointerActive) {
      for (let i = 0; i < count; i += 1) {
        const d = Math.hypot((this.px[i] ?? 0) - this.pointerX, (this.py[i] ?? 0) - this.pointerY);
        if (d < limit) {
          ctx.strokeStyle = style(CYAN_STYLES, BRIGHT_LINK_ALPHA * (1 - d / limit) * 0.8);
          ctx.beginPath();
          ctx.moveTo(this.px[i] ?? 0, this.py[i] ?? 0);
          ctx.lineTo(this.pointerX, this.pointerY);
          ctx.stroke();
        }
      }
    }

    // Converge mode: links to the centre node for nodes that are close.
    if (this.options.mode === "converge") {
      for (let i = 0; i < count; i += 1) {
        const d = Math.hypot((this.px[i] ?? 0) - cx, (this.py[i] ?? 0) - cy);
        if (d < limit * 1.4) {
          const midX = ((this.px[i] ?? 0) + cx) / 2;
          const midY = ((this.py[i] ?? 0) + cy) / 2;
          ctx.strokeStyle = style(
            CYAN_STYLES,
            Math.min(
              0.28 * (1 - d / (limit * 1.4)) * (this.fade[i] ?? 1),
              this.nodeAlphaCap(midX, midY),
            ),
          );
          ctx.beginPath();
          ctx.moveTo(this.px[i] ?? 0, this.py[i] ?? 0);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
      }
    }

    // Nodes.
    for (let i = 0; i < count; i += 1) {
      const nx = this.px[i] ?? 0;
      const ny = this.py[i] ?? 0;
      const cap = this.nodeAlphaCap(nx, ny);
      const isSignal = this.signal[i] === 1;
      let alpha = (isSignal ? 0.9 : NODE_ALPHA) * (this.fade[i] ?? 1);
      if (this.options.layout === "top") alpha *= Math.max(0, 1 - ny / (h * 0.5));
      ctx.fillStyle = style(isSignal ? CYAN_STYLES : SLATE_STYLES, Math.min(alpha, cap) * dim);
      ctx.beginPath();
      ctx.arc(nx, ny, this.radius[i] ?? 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pulses: 3px cyan dots travelling along links.
    if (!this.staticMode) {
      for (let p = 0; p < MAX_PULSES; p += 1) {
        const start = this.pulseStart[p] ?? -1;
        if (start < 0) continue;
        const progress = (now - start) / PULSE_DURATION;
        if (progress > 1) continue;
        const a = this.pulseFrom[p] ?? 0;
        const b = this.pulseTo[p] ?? 0;
        const x = (this.px[a] ?? 0) + ((this.px[b] ?? 0) - (this.px[a] ?? 0)) * progress;
        const y = (this.py[a] ?? 0) + ((this.py[b] ?? 0) - (this.py[a] ?? 0)) * progress;
        const fadeEdge = Math.min(1, progress * 6, (1 - progress) * 6);
        ctx.fillStyle = style(CYAN_STYLES, Math.min(0.95 * fadeEdge, this.nodeAlphaCap(x, y)));
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Touch ripple.
    if (rippleOn) {
      const k = rippleAge / RIPPLE_DURATION;
      ctx.strokeStyle = style(CYAN_STYLES, 0.4 * (1 - k));
      ctx.beginPath();
      ctx.arc(this.rippleX, this.rippleY, RIPPLE_RADIUS * easeOutExpo(k), 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.options.mode === "converge") this.drawCentre(now, cx, cy);
  }

  private drawLink(
    i: number,
    j: number,
    limit: number,
    rippleOn: boolean,
    rippleAge: number,
  ): void {
    const ax = this.px[i] ?? 0;
    const ay = this.py[i] ?? 0;
    const bx = this.px[j] ?? 0;
    const by = this.py[j] ?? 0;
    const d = Math.hypot(ax - bx, ay - by);
    if (d >= limit) return;
    let maxAlpha = BASE_LINK_ALPHA;
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    if (this.pointerActive && Math.hypot(mx - this.pointerX, my - this.pointerY) < POINTER_RADIUS) {
      maxAlpha = BRIGHT_LINK_ALPHA;
    } else if (rippleOn && Math.hypot(mx - this.rippleX, my - this.rippleY) < RIPPLE_RADIUS) {
      maxAlpha =
        BASE_LINK_ALPHA + (BRIGHT_LINK_ALPHA - BASE_LINK_ALPHA) * (1 - rippleAge / RIPPLE_DURATION);
    }
    let alpha = maxAlpha * (1 - d / limit) * Math.min(this.fade[i] ?? 1, this.fade[j] ?? 1);
    if (this.options.faint) alpha *= FAINT_ALPHA;
    alpha = Math.min(alpha, this.nodeAlphaCap(mx, my));
    if (this.options.layout === "top") alpha *= Math.max(0, 1 - my / (this.height * 0.5));
    if (alpha < 0.01) return;
    this.ctx.strokeStyle = style(SLATE_STYLES, alpha);
    this.ctx.beginPath();
    this.ctx.moveTo(ax, ay);
    this.ctx.lineTo(bx, by);
    this.ctx.stroke();
  }

  private drawCentre(now: number, cx: number, cy: number): void {
    const ctx = this.ctx;
    const phase = this.staticMode ? 0 : (now % CENTRE_PULSE) / CENTRE_PULSE;
    const scale = 1 + 0.15 * (0.5 - 0.5 * Math.cos(phase * Math.PI * 2));
    ctx.save();
    ctx.shadowColor = style(CYAN_STYLES, 0.9);
    ctx.shadowBlur = CENTRE_GLOW / 2;
    ctx.fillStyle = colors.cyan400;
    ctx.beginPath();
    ctx.arc(cx, cy, CENTRE_RADIUS * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
