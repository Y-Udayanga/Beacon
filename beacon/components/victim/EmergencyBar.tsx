"use client";

import { Navigation, Phone, Share2 } from "lucide-react";
import { EVACUATION_SHELTERS } from "@/lib/map-config";
import type { UserLocation } from "@/lib/geolocation";

interface EmergencyBarProps {
  location: UserLocation | null;
}

export function EmergencyBar({ location }: EmergencyBarProps) {
  const nearestShelter = EVACUATION_SHELTERS[0];

  const shelterDirectionsUrl =
    location != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${nearestShelter.lat},${nearestShelter.lng}&travelmode=walking`
      : `https://www.google.com/maps/search/?api=1&query=${nearestShelter.lat},${nearestShelter.lng}`;

  const handleShareLocation = async () => {
    if (!location) return;
    const text = `Emergency — my location: https://maps.google.com/?q=${location.lat},${location.lng}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Beacon SOS Location", text });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    await navigator.clipboard.writeText(text);
    alert("Location link copied to clipboard.");
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <a
        href="tel:119"
        className="flex flex-col items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 py-3 text-center transition-colors hover:bg-red-500/25"
      >
        <Phone className="h-5 w-5 text-red-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-red-300">
          Emergency
        </span>
      </a>

      <button
        type="button"
        onClick={handleShareLocation}
        disabled={!location}
        className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-center transition-colors hover:bg-white/10 disabled:opacity-40"
      >
        <Share2 className="h-5 w-5 text-blue-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          Share GPS
        </span>
      </button>

      <a
        href={shelterDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-center transition-colors hover:bg-emerald-500/20"
      >
        <Navigation className="h-5 w-5 text-emerald-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
          Nearest Shelter
        </span>
      </a>
    </div>
  );
}
