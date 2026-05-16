"use client";

import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { MapPin, Shield } from "lucide-react";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, EVACUATION_SHELTERS } from "@/lib/map-config";
import type { EmergencyTicket, MissingPersonReport } from "@/lib/types";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? "beacon-crisis-map";

interface CrisisMapProps {
  tickets: EmergencyTicket[];
  missingReports?: MissingPersonReport[];
  selectedTicketId?: string | null;
  onSelectTicket?: (id: string | null) => void;
  className?: string;
}

function triagePinColor(level: number): string {
  if (level >= 5) return "#ef4444";
  if (level >= 4) return "#f97316";
  if (level >= 3) return "#eab308";
  return "#3b82f6";
}

function MapPinMarker({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function CrisisMap({
  tickets,
  missingReports = [],
  selectedTicketId,
  onSelectTicket,
  className = "",
}: CrisisMapProps) {
  const locatedTickets = tickets.filter(
    (t) => t.latitude != null && t.longitude != null
  );
  const locatedMissing = missingReports.filter(
    (r) => r.latitude != null && r.longitude != null
  );

  const center =
    locatedTickets[0] != null
      ? { lat: locatedTickets[0].latitude!, lng: locatedTickets[0].longitude! }
      : locatedMissing[0] != null
        ? { lat: locatedMissing[0].latitude!, lng: locatedMissing[0].longitude! }
        : DEFAULT_MAP_CENTER;

  if (!MAPS_KEY) {
    return (
      <MapFallback
        className={className}
        tickets={locatedTickets}
        missingCount={locatedMissing.length}
        shelterCount={EVACUATION_SHELTERS.length}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 ${className}`}>
      <APIProvider apiKey={MAPS_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={DEFAULT_MAP_ZOOM}
          gestureHandling="greedy"
          mapId={MAP_ID}
          className="h-full w-full min-h-[420px]"
          style={{ width: "100%", height: "100%" }}
        >
          {EVACUATION_SHELTERS.map((shelter) => (
            <AdvancedMarker
              key={shelter.id}
              position={{ lat: shelter.lat, lng: shelter.lng }}
              title={shelter.name}
            >
              <div className="flex flex-col items-center">
                <MapPinMarker className="border-emerald-400 bg-emerald-600">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </MapPinMarker>
                <span className="mt-1 max-w-[120px] truncate rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-emerald-300">
                  {shelter.name}
                </span>
              </div>
            </AdvancedMarker>
          ))}

          {locatedTickets.map((ticket) => (
            <AdvancedMarker
              key={ticket.id}
              position={{ lat: ticket.latitude!, lng: ticket.longitude! }}
              onClick={() => onSelectTicket?.(ticket.id)}
            >
              <MapPinMarker
                className={selectedTicketId === ticket.id ? "scale-125 ring-2 ring-white" : ""}
                style={{ backgroundColor: triagePinColor(ticket.triage_level) }}
              >
                <span className="text-xs font-bold text-white">{ticket.triage_level}</span>
              </MapPinMarker>
            </AdvancedMarker>
          ))}

          {locatedMissing.map((report) => (
            <AdvancedMarker
              key={report.id}
              position={{ lat: report.latitude!, lng: report.longitude! }}
            >
              <MapPinMarker className="border-blue-400 bg-blue-600">
                <MapPin className="h-3.5 w-3.5 text-white" />
              </MapPinMarker>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-lg bg-black/75 px-3 py-2 text-[10px] text-zinc-300 backdrop-blur-sm">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Incidents
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Shelters
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Missing reports
        </span>
      </div>
    </div>
  );
}

function MapFallback({
  className,
  tickets,
  missingCount,
  shelterCount,
}: {
  className: string;
  tickets: EmergencyTicket[];
  missingCount: number;
  shelterCount: number;
}) {
  return (
    <div
      className={`flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-[#0f0f14] p-8 text-center ${className}`}
    >
      <MapPin className="mb-4 h-12 w-12 text-amber-500/60" />
      <h3 className="text-lg font-semibold text-zinc-300">Google Maps API key required</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        Add <code className="text-amber-400/90">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{" "}
        <code className="text-zinc-400">beacon/.env.local</code> and restart the dev server.
        Enable Maps JavaScript API in Google Cloud Console.
      </p>
      <div className="mt-6 grid gap-2 text-left text-xs text-zinc-400">
        <p>
          Ready to plot: {tickets.length} incidents, {missingCount} missing reports,{" "}
          {shelterCount} shelters
        </p>
        {tickets.slice(0, 3).map((t) => (
          <p key={t.id} className="font-mono text-zinc-500">
            {t.id} — {t.incident_type} @ {t.latitude?.toFixed(4)}, {t.longitude?.toFixed(4)}
          </p>
        ))}
      </div>
    </div>
  );
}
