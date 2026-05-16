import { MOCK_TICKETS } from "@/lib/mock-tickets";
import type { EmergencyTicket, MissingPersonReport } from "@/lib/types";

const tickets: EmergencyTicket[] = [...MOCK_TICKETS];
const missingReports: MissingPersonReport[] = [];

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function listTickets(): EmergencyTicket[] {
  return [...tickets].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function addTicket(
  data: Omit<EmergencyTicket, "id" | "created_at" | "status"> & { status?: EmergencyTicket["status"] }
): EmergencyTicket {
  const ticket: EmergencyTicket = {
    id: nextId("TKT"),
    status: data.status ?? "incoming",
    created_at: new Date().toISOString(),
    ...data,
  };
  tickets.unshift(ticket);
  return ticket;
}

export function updateTicketStatus(
  id: string,
  status: EmergencyTicket["status"]
): EmergencyTicket | null {
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tickets[index] = { ...tickets[index], status };
  return tickets[index];
}

export function listMissingReports(): MissingPersonReport[] {
  return [...missingReports].sort(
    (a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
  );
}

export function addMissingReport(
  data: Omit<MissingPersonReport, "id" | "reported_at">
): MissingPersonReport {
  const report: MissingPersonReport = {
    id: nextId("MP"),
    reported_at: new Date().toISOString(),
    ...data,
  };
  missingReports.unshift(report);
  return report;
}
