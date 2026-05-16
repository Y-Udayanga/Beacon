export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export function getCurrentPosition(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission denied. Enable GPS for accurate dispatch.",
          2: "Location unavailable. Try moving outdoors.",
          3: "Location request timed out.",
        };
        reject(new Error(messages[err.code] ?? "Could not determine your location."));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export function appendLocationToFormData(
  formData: FormData,
  location: UserLocation | null
): void {
  if (!location) return;
  formData.append("latitude", String(location.lat));
  formData.append("longitude", String(location.lng));
  if (location.accuracy != null) {
    formData.append("location_accuracy", String(location.accuracy));
  }
}

export function parseLocationFromFormData(formData: FormData): UserLocation | null {
  const latRaw = formData.get("latitude");
  const lngRaw = formData.get("longitude");
  if (typeof latRaw !== "string" || typeof lngRaw !== "string") return null;

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const accuracyRaw = formData.get("location_accuracy");
  const accuracy =
    typeof accuracyRaw === "string" && accuracyRaw
      ? Number(accuracyRaw)
      : undefined;

  return {
    lat,
    lng,
    accuracy: Number.isFinite(accuracy) ? accuracy : undefined,
  };
}
