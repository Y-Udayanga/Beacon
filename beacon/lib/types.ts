export interface PanicSnapResponse {
  triage_level: number;
  incident_type: string;
  translated_audio: string;
  first_aid_instructions: string;
  visual_assessment?: string;
}

export interface EmergencyTicket {
  id: string;
  triage_level: number;
  incident_type: string;
  translated_audio: string;
  visual_assessment: string;
  status: "incoming" | "triaged" | "dispatched";
  created_at: string;
}

export interface MissingPersonReport {
  id: string;
  description: string;
  photo_preview?: string;
  reported_at: string;
}
