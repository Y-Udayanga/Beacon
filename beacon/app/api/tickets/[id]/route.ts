import { NextResponse } from "next/server";
import { updateTicketStatus } from "@/lib/beacon-store";
import type { EmergencyTicket } from "@/lib/types";

export const runtime = "nodejs";

const VALID_STATUSES: EmergencyTicket["status"][] = [
  "incoming",
  "triaged",
  "dispatched",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body.status !== "string") {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(body.status as EmergencyTicket["status"])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = updateTicketStatus(id, body.status as EmergencyTicket["status"]);
  if (!updated) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({ ticket: updated });
}
