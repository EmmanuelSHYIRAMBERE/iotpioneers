import { cn } from "@/lib/cn";

export interface MediaPlaceholderProps {
  label: string;
  variant: "bench" | "board";
  className?: string;
}

/**
 * A designed stand in for client photography that has not been supplied yet. It is a
 * technical line drawing, never a stock photo, and states plainly that a photograph is pending.
 */
export function MediaPlaceholder({ label, variant, className }: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        "bg-dot-grid relative h-full w-full overflow-hidden bg-navy-900 text-slate-400",
        className,
      )}
    >
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        {variant === "board" ? (
          <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.55">
            <rect x="70" y="110" width="260" height="180" rx="10" />
            <rect
              x="160"
              y="160"
              width="80"
              height="80"
              rx="4"
              className="stroke-cyan-400"
              strokeOpacity="0.8"
            />
            {Array.from({ length: 8 }, (_, i) => (
              <g key={i}>
                <path d={`M${String(168 + i * 9)} 160 V146`} />
                <path d={`M${String(168 + i * 9)} 240 V254`} />
              </g>
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <circle key={`p${String(i)}`} cx={92 + i * 19.5} cy="128" r="3.5" />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <circle key={`q${String(i)}`} cx={92 + i * 19.5} cy="272" r="3.5" />
            ))}
            <path d="M240 200 H300 V170" />
            <circle cx="300" cy="170" r="4" className="fill-cyan-400" stroke="none" />
          </g>
        ) : (
          <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.55">
            <path d="M40 300 H360" />
            <rect x="80" y="210" width="120" height="90" rx="6" />
            <path d="M100 230 H180 M100 250 H160" />
            <rect x="230" y="240" width="90" height="60" rx="4" />
            <circle cx="255" cy="270" r="10" />
            <path d="M290 260 H305 M290 275 H305" />
            <path d="M140 210 V150 L210 110 L290 150" />
            <circle cx="140" cy="150" r="5" className="fill-cyan-400" stroke="none" />
            <circle cx="210" cy="110" r="5" />
            <circle cx="290" cy="150" r="5" />
            <path d="M290 155 V240" strokeDasharray="4 4" />
          </g>
        )}
      </svg>
      <p className="absolute right-4 bottom-4 left-4 font-mono text-small text-slate-400">
        {label}
      </p>
    </div>
  );
}
