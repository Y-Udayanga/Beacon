import { NextResponse } from "next/server";
import { listMissingReports } from "@/lib/beacon-store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ reports: listMissingReports() });
}
