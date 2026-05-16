"use client";

import { MapPin, UserSearch } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Sidebar, type DashboardSection } from "./Sidebar";
import { TicketBoard } from "./TicketBoard";

export function DashboardShell() {
  const [section, setSection] = useState<DashboardSection>("crises");

  return (
    <div className="flex min-h-screen bg-[#050508] text-white">
      <Sidebar active={section} onNavigate={setSection} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0a0a0f] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold capitalize">
              {section === "crises" && "Active Crises"}
              {section === "missing" && "Missing Persons"}
              {section === "map" && "Map View"}
            </h2>
            <p className="text-xs text-zinc-500">Beacon Dispatcher Command Center</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            ← Victim App
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {section === "crises" && <TicketBoard />}

          {section === "missing" && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <UserSearch className="mb-4 h-12 w-12 text-blue-400/50" />
              <h3 className="text-lg font-semibold text-zinc-300">Missing Persons Queue</h3>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Reports from the victim app will appear here. Connect to your data layer for live intake.
              </p>
              <div className="mt-8 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="px-4 py-3 font-mono text-zinc-400">MP-102</td>
                      <td className="px-4 py-3 text-zinc-300">Child, age 7, red jacket — east entrance</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                          Searching
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-zinc-400">MP-101</td>
                      <td className="px-4 py-3 text-zinc-300">Elderly male, grey cap — evacuation zone B</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                          New
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === "map" && (
            <div className="flex h-[calc(100vh-140px)] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0f0f14]">
              <MapPin className="mb-4 h-16 w-16 text-zinc-600" />
              <h3 className="text-lg font-semibold text-zinc-400">Map View</h3>
              <p className="mt-2 text-sm text-zinc-600">
                Integrate Mapbox or Google Maps for live incident geolocation
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 opacity-40">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-24 w-32 rounded-lg border border-white/5 bg-gradient-to-br from-red-500/20 to-transparent"
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
