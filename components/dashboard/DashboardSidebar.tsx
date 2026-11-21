import { Bell, ChartLine, Cpu, LayoutDashboard, Waypoints, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { ICON_STROKE } from "@/lib/tokens";

const ICONS: readonly LucideIcon[] = [LayoutDashboard, Cpu, Waypoints, ChartLine, Bell];

export interface DashboardSidebarProps {
  items: readonly string[];
  className?: string;
}

/**
 * Stylised product navigation. It is part of the illustration, not site navigation, so the
 * items are plain text (no dead links or buttons). Icons only below xl.
 */
export function DashboardSidebar({ items, className }: DashboardSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-1 border-r border-line-dark p-2", className)}>
      <p className="hidden">IoTDataHub</p>
      <ul className="flex flex-col gap-1" aria-label="Demo product sections">
        {items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length] ?? LayoutDashboard;
          return (
            <li
              key={item}
              className={cn(
                "flex items-center justify-center gap-2.5 rounded-button px-2 py-2 text-small",
                index === 0 ? "bg-navy-800 text-cloud-50" : "text-slate-400",
              )}
            >
              <Icon aria-hidden="true" size={16} strokeWidth={ICON_STROKE} className="shrink-0" />
              <span className="sr-only">{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
