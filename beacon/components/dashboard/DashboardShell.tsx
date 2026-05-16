"use client";

import Link from "next/link";
import { useState } from "react";
import { CrisisMap } from "@/components/maps/CrisisMap";
import { useBeaconData } from "@/hooks/useBeaconData";
import { MissingPersonsPanel } from "./MissingPersonsPanel";
import { Sidebar, type DashboardSection } from "./Sidebar";
import { TicketBoard } from "./TicketBoard";

export function DashboardShell() {
  const [section, setSection] = useState<DashboardSection>("crises");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { tickets, missingReports, loading, dispatchTicket, counts } = useBeaconData();

  return (
    <div className="flex min-h-screen bg-[#050508] text-white">
      <Sidebar
        active={section}
        onNavigate={setSection}
        badges={{
          crises: counts.incoming > 0 ? String(counts.incoming) : undefined,
          missing: counts.missing > 0 ? String(counts.missing) : undefined,
        }}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0a0a0f] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold capitalize">
              {section === "crises" && "Active Crises"}
              {section === "missing" && "Missing Persons"}
              {section === "map" && "Live Incident Map"}
            </h2>
            <p className="text-xs text-zinc-500">
              Beacon Dispatcher Command Center
              {loading ? " · syncing…" : ""}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            ← Victim App
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {section === "crises" && (
            <TicketBoard tickets={tickets} onDispatch={dispatchTicket} />
          )}

          {section === "missing" && <MissingPersonsPanel reports={missingReports} />}

          {section === "map" && (
            <div className="flex h-[calc(100vh-140px)] flex-col gap-4">
              <CrisisMap
                className="min-h-0 flex-1"
                tickets={tickets}
                missingReports={missingReports}
                selectedTicketId={selectedTicketId}
                onSelectTicket={setSelectedTicketId}
              />
              {selectedTicketId && (
                <p className="text-center text-xs text-zinc-500">
                  Selected incident:{" "}
                  <span className="font-mono text-zinc-300">{selectedTicketId}</span>
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}