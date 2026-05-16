"use client";

import { Clock, Eye, MapPin, MessageSquare, Send } from "lucide-react";
import type { EmergencyTicket } from "@/lib/types";
import { cn, getTriageColor, getTriageLabel } from "@/lib/utils";

interface TicketCardProps {
  ticket: EmergencyTicket;
  onDispatch: (id: string) => void;
}

export function TicketCard({ ticket, onDispatch }: TicketCardProps) {
  const triage = getTriageColor(ticket.triage_level);
  const time = new Date(ticket.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={cn(
        "rounded-xl border bg-[#12121a] p-4 shadow-lg transition-shadow hover:shadow-xl",
        triage.border
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
              triage.bg,
              triage.text
            )}
          >
            {ticket.triage_level}
          </span>
          <div>
            <p className={cn("text-xs font-semibold uppercase", triage.text)}>
              {getTriageLabel(ticket.triage_level)}
            </p>
            <p className="text-sm font-medium text-white">{ticket.incident_type}</p>
          </div>
        </div>
        <span className="font-mono text-xs text-zinc-500">{ticket.id}</span>
      </div>

      <div className="mb-3 space-y-2 text-sm">
        <div className="flex gap-2 text-zinc-400">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/80" />
          <p className="italic text-zinc-300">&ldquo;{ticket.translated_audio}&rdquo;</p>
        </div>
        <div className="flex gap-2 text-zinc-500">
          <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400/80" />
          <p>{ticket.visual_assessment}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs text-zinc-600">
            <Clock className="h-3 w-3" />
            {time}
          </span>
          {ticket.latitude != null && ticket.longitude != null && (
            <a
              href={`https://www.google.com/maps?q=${ticket.latitude},${ticket.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
            >
              <MapPin className="h-3 w-3" />
              View on map
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDispatch(ticket.id)}
          disabled={ticket.status === "dispatched"}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            ticket.status === "dispatched"
              ? "cursor-not-allowed bg-white/5 text-zinc-600"
              : "bg-red-600 text-white hover:bg-red-500"
          )}
        >
          {ticket.status === "dispatched" ? (
            "Dispatched"
          ) : (
            <>
              <Send className="h-3 w-3" />
              Dispatch Unit
            </>
          )}
        </button>
      </div>
    </article>
  );
}
