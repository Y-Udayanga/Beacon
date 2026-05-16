"use client";

import { LayoutDashboard, UserSearch, Camera, Mic, Square, Send, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  appendLocationToFormData,
  getCurrentPosition,
  type UserLocation,
} from "@/lib/geolocation";
import {
  capturePhotoOnly,
  startAudioRecording,
  stopAudioRecording,
} from "@/lib/panic-snap-capture";
import type { PanicSnapResponse } from "@/lib/types";
import { EmergencyBar } from "./EmergencyBar";
import { FirstAidModal } from "./FirstAidModal";
import { LocationBanner } from "./LocationBanner";
import { MissingPersonForm } from "./MissingPersonForm";

type View = "home" | "missing";

export function VictimApp() {
  const [view, setView] = useState<View>("home");
  const [firstAidOpen, setFirstAidOpen] = useState(false);
  const [response, setResponse] = useState<PanicSnapResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then(setLocation)
      .catch((err) =>
        setLocationError(err instanceof Error ? err.message : "Location unavailable")
      )
      .finally(() => setLocationLoading(false));
  }, []);

  const handleCaptureImage = useCallback(async () => {
    setApiError(null);
    try {
      const img = await capturePhotoOnly();
      setImageBlob(img);
    } catch (err) {
      setApiError("Failed to capture image.");
    }
  }, []);

  const handleToggleAudio = useCallback(async () => {
    setApiError(null);
    if (isRecording && mediaRecorder) {
      const audio = await stopAudioRecording(mediaRecorder);
      setAudioBlob(audio);
      setMediaRecorder(null);
      setIsRecording(false);
    } else {
      const recorder = await startAudioRecording();
      if (recorder) {
        setMediaRecorder(recorder);
        setIsRecording(true);
      } else {
        setApiError("Failed to start audio recording. Check permissions.");
      }
    }
  }, [isRecording, mediaRecorder]);

  const handleSubmit = useCallback(async () => {
    if (!imageBlob && !audioBlob) {
      setApiError("Please capture an image or audio first.");
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);

    try {
      const formData = new FormData();
      if (imageBlob) formData.append("image", imageBlob, "snapshot.jpg");
      if (audioBlob) formData.append("audio", audioBlob, "recording.webm");
      appendLocationToFormData(formData, location);

      const res = await fetch("/api/panic-snap", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : `Analysis request failed (${res.status})`);
      }

      setResponse(data as PanicSnapResponse);
      setFirstAidOpen(true);
      setImageBlob(null);
      setAudioBlob(null);
    } catch (err) {
      console.error(err);
      setResponse(null);
      setApiError(err instanceof Error ? err.message : "Analysis failed. Call emergency services.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageBlob, audioBlob, location]);

  if (view === "missing") {
    return (
      <div className="flex min-h-dvh flex-col bg-[#050508]">
        <MissingPersonForm
          onBack={() => setView("home")}
          location={location}
          locationLoading={locationLoading}
          locationError={locationError}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#050508] text-white">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-500/80">
            Beacon
          </p>
          <h1 className="text-lg font-semibold tracking-tight">Crisis Copilot</h1>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dispatch
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-sm space-y-4">
          <EmergencyBar location={location} />
          <LocationBanner
            location={location}
            loading={locationLoading}
            error={locationError}
          />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-center text-sm font-medium text-zinc-300">Gather Evidence</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCaptureImage}
                className={`flex flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                  imageBlob 
                    ? "border-green-500/50 bg-green-500/10 text-green-400" 
                    : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs font-medium">{imageBlob ? "Retake Photo" : "Take Photo"}</span>
              </button>

              <button
                onClick={handleToggleAudio}
                className={`flex flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                  isRecording 
                    ? "border-red-500 bg-red-500/20 text-red-400 animate-pulse" 
                    : audioBlob 
                      ? "border-green-500/50 bg-green-500/10 text-green-400"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isRecording ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-6 w-6" />}
                <span className="text-xs font-medium">
                  {isRecording ? "Stop Recording" : audioBlob ? "Re-record Audio" : "Record Audio"}
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={(!imageBlob && !audioBlob) || isAnalyzing || isRecording}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all ${
              (!imageBlob && !audioBlob) || isRecording
                ? "bg-white/5 text-zinc-500 cursor-not-allowed"
                : isAnalyzing
                ? "bg-blue-600/50 text-white cursor-wait"
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing Scene...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Evidence
              </>
            )}
          </button>

          {apiError && (
            <div className="rounded-lg bg-red-500/10 p-3 text-center border border-red-500/20">
              <p className="text-sm text-red-400" role="alert">{apiError}</p>
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-600">
          Your location &amp; media are encrypted in transit
        </p>
      </main>

      <nav className="border-t border-white/10 bg-[#0a0a0f]/80 px-4 py-3 backdrop-blur-lg">
        <button
          type="button"
          onClick={() => setView("missing")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <UserSearch className="h-4 w-4 text-blue-400" />
          Report Missing Person
        </button>
      </nav>

      <FirstAidModal
        open={firstAidOpen}
        onClose={() => setFirstAidOpen(false)}
        data={response}
      />
    </div>
  );
}
