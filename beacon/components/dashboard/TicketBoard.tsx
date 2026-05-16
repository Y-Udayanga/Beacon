"use client";

import { Siren } from "lucide-react";
import type { EmergencyTicket } from "@/lib/types";
import { TicketCard } from "./TicketCard";

const COLUMNS: { key: EmergencyTicket["status"]; label: string }[] = [
  { key: "incoming", label: "Incoming" },
  { key: "triaged", label: "Triaged" },
  { key: "dispatched", label: "Dispatched" },
];

interface TicketBoardProps {
  tickets: EmergencyTicket[];
  onDispatch: (id: string) => void;
}

export function TicketBoard({ tickets, onDispatch }: TicketBoardProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Emergency Tickets</h2>
          <p className="text-sm text-zinc-500">Live crisis intake from Panic Snap submissions</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2">
          <Siren className="h-4 w-4 animate-pulse text-red-400" />
          <span className="text-sm font-medium text-red-400">
            {tickets.filter((t) => t.status === "incoming").length} active incoming
          </span>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto lg:grid-cols-3">
        {COLUMNS.map(({ key, label }) => {
          const columnTickets = tickets.filter((t) => t.status === key);
          return (
            <section
              key={key}
              className="flex min-h-[320px] flex-col rounded-xl border border-white/10 bg-[#0a0a0f]/50"
            >
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-zinc-300">{label}</h3>
                <span className="text-xs text-zinc-600">{columnTickets.length} tickets</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
                {columnTickets.length === 0 ? (
                  <p className="py-8 text-center text-xs text-zinc-600">No tickets</p>
                ) : (
                  columnTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onDispatch={onDispatch} />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
