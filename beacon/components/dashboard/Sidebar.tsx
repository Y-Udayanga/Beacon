"use client";

import { AlertTriangle, Map, Radio, UserSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardSection = "crises" | "missing" | "map";

interface SidebarProps {
  active: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  badges?: Partial<Record<DashboardSection, string>>;
}

const NAV_ITEMS: {
  id: DashboardSection;
  label: string;
  icon: typeof Radio;
}[] = [
  { id: "crises", label: "Active Crises", icon: AlertTriangle },
  { id: "missing", label: "Missing Persons", icon: UserSearch },
  { id: "map", label: "Map View", icon: Map },
];

export function Sidebar({ active, onNavigate, badges = {} }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0a0a0f]">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-500/80">
          Beacon
        </p>
        <h1 className="mt-1 text-lg font-bold text-white">Dispatcher</h1>
        <p className="mt-0.5 text-xs text-zinc-500">Operations Command</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const badge = badges[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active === id
                  ? "bg-red-500/15 text-red-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    active === id ? "bg-red-500/30 text-red-300" : "bg-white/10 text-zinc-400"
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">System Online</span>
        </div>
      </div>
    </aside>
  );
}
