"use client";

import { useCallback, useEffect, useState } from "react";
import type { EmergencyTicket, MissingPersonReport } from "@/lib/types";

const POLL_MS = 4000;

export function useBeaconData() {
  const [tickets, setTickets] = useState<EmergencyTicket[]>([]);
  const [missingReports, setMissingReports] = useState<MissingPersonReport[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [ticketsRes, missingRes] = await Promise.all([
        fetch("/api/tickets"),
        fetch("/api/missing-reports"),
      ]);

      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        setTickets(data.tickets ?? []);
      }

      if (missingRes.ok) {
        const data = await missingRes.json();
        setMissingReports(data.reports ?? []);
      }
    } catch {
      /* keep last known data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const dispatchTicket = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dispatched" }),
      });
      if (res.ok) await refresh();
    },
    [refresh]
  );

  return {
    tickets,
    missingReports,
    loading,
    refresh,
    dispatchTicket,
    counts: {
      incoming: tickets.filter((t) => t.status === "incoming").length,
      missing: missingReports.length,
    },
  };
}
