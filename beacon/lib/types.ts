export interface PanicSnapResponse {
  triage_level: number;
  incident_type: string;
  translated_audio: string;
  first_aid_instructions: string;
  visual_assessment?: string;
  ticket_id?: string;
}

export interface EmergencyTicket {
  id: string;
  triage_level: number;
  incident_type: string;
  translated_audio: string;
  visual_assessment: string;
  status: "incoming" | "triaged" | "dispatched";
  created_at: string;
  latitude?: number;
  longitude?: number;
  first_aid_instructions?: string;
}

export interface MissingPersonReport {
  id: string;
  description: string;
  photo_preview?: string;
  reported_at: string;
  status: "new" | "searching" | "located";
  latitude?: number;
  longitude?: number;
  extraction?: MissingPersonExtraction;
}

export interface MissingPersonExtraction {
  estimated_age: string;
  clothing_colors: string[];
  last_known_location: string;
  distinguishing_features: string[];
}
