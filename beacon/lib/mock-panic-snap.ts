import type { PanicSnapResponse } from "@/lib/types";

export const MOCK_PANIC_SNAP_RESPONSE: PanicSnapResponse = {
  triage_level: 3,
  incident_type: "Unconfirmed injury — demo triage",
  translated_audio:
    "Demo mode: audio received. Set GEMINI_API_KEY for live translation.",
  visual_assessment:
    "Snapshot received. Connect Gemini for live scene assessment.",
  first_aid_instructions:
    "Ensure the area is safe. Call emergency services if anyone is in immediate danger. Apply firm pressure to active bleeding and monitor breathing until help arrives.",
};

export const MOCK_PANIC_SNAP_DELAY_MS = 1500;
