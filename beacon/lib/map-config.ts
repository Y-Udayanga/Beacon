export const DEFAULT_MAP_CENTER = { lat: 6.9271, lng: 79.8612 };

export const DEFAULT_MAP_ZOOM = 13;

export interface ShelterPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
}

/** Demo evacuation shelters near default map center (Colombo area). */
export const EVACUATION_SHELTERS: ShelterPoint[] = [
  { id: "SH-1", name: "Central Community Hall", lat: 6.934, lng: 79.845, capacity: 200 },
  { id: "SH-2", name: "Riverside School Gym", lat: 6.918, lng: 79.872, capacity: 350 },
  { id: "SH-3", name: "Stadium Relief Center", lat: 6.941, lng: 79.858, capacity: 500 },
];
