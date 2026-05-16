import { NextResponse } from "next/server";
import { listTickets } from "@/lib/beacon-store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ tickets: listTickets() });
}
