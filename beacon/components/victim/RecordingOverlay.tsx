"use client";

import { Camera, Mic, Loader2 } from "lucide-react";

interface RecordingOverlayProps {
  phase: "recording" | "analyzing";
}

export function RecordingOverlay({ phase }: RecordingOverlayProps) {
  if (phase === "recording") {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="relative mb-8">
          <Loader2 className="h-16 w-16 animate-spin text-red-500" />
          <span className="recording-dot absolute right-0 top-0 h-4 w-4 rounded-full bg-red-500" />
        </div>
        <p className="mb-2 text-xl font-semibold text-white">Capturing Evidence</p>
        <p className="mb-8 text-sm text-zinc-400">Recording audio &amp; photo…</p>
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <div className="rounded-full bg-red-500/20 p-4">
              <Mic className="h-6 w-6 text-red-400" />
            </div>
            <span className="text-xs">Audio</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <div className="rounded-full bg-red-500/20 p-4">
              <Camera className="h-6 w-6 text-red-400" />
            </div>
            <span className="text-xs">Photo</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="analyze-spinner mb-8 h-20 w-20 rounded-full border-4 border-red-500/30 border-t-red-500" />
      <p className="text-center text-2xl font-bold tracking-tight text-red-400">
        Analyzing Threat Level…
      </p>
      <p className="mt-3 max-w-xs text-center text-sm text-zinc-500">
        AI is processing your snapshot for triage and first-aid guidance
      </p>
    </div>
  );
}
