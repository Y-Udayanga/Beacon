"use client";

import { Loader2, MapPin, MapPinOff } from "lucide-react";
import type { UserLocation } from "@/lib/geolocation";
import { cn } from "@/lib/utils";

interface LocationBannerProps {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
}

export function LocationBanner({ location, loading, error }: LocationBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
        error
          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
          : location
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-white/10 bg-white/5 text-zinc-400"
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
      ) : error ? (
        <MapPinOff className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <MapPin className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="flex-1">
        {loading && "Acquiring GPS location…"}
        {error && error}
        {!loading && !error && location && (
          <>
            Location shared: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            {location.accuracy != null && ` (±${Math.round(location.accuracy)}m)`}
          </>
        )}
        {!loading && !error && !location && "Waiting for location…"}
      </span>
    </div>
  );
}
