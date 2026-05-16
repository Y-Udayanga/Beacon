"use client";

import { LayoutDashboard, UserSearch } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { PanicSnapResponse } from "@/lib/types";
import { FirstAidModal } from "./FirstAidModal";
import { MissingPersonForm } from "./MissingPersonForm";
import { PanicSnapButton } from "./PanicSnapButton";
import { RecordingOverlay } from "./RecordingOverlay";

type View = "home" | "missing";
type OverlayPhase = "recording" | "analyzing" | null;

const RECORDING_MS = 3000;

export function VictimApp() {
  const [view, setView] = useState<View>("home");
  const [overlay, setOverlay] = useState<OverlayPhase>(null);
  const [firstAidOpen, setFirstAidOpen] = useState(false);
  const [response, setResponse] = useState<PanicSnapResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handlePanicSnap = useCallback(async () => {
    if (overlay) return;

    setOverlay("recording");
    await new Promise((r) => setTimeout(r, RECORDING_MS));

    setOverlay("analyzing");

    const formData = new FormData();
    const mockImage = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
    const mockAudio = new Blob([new Uint8Array([0])], { type: "audio/webm" });
    formData.append("image", mockImage, "snapshot.png");
    formData.append("audio", mockAudio, "recording.webm");

    try {
      setApiError(null);
      const res = await fetch("/api/panic-snap", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Request failed");
      const data: PanicSnapResponse = await res.json();
      setResponse(data);
      setFirstAidOpen(true);
    } catch {
      setResponse(null);
      setApiError(
        "Analysis failed. Call emergency services immediately and follow local safety protocols."
      );
    } finally {
      setOverlay(null);
    }
  }, [overlay]);

  if (view === "missing") {
    return (
      <div className="flex min-h-dvh flex-col bg-[#050508]">
        <MissingPersonForm onBack={() => setView("home")} />
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
        <p className="mb-10 max-w-[260px] text-center text-sm leading-relaxed text-zinc-500">
          In an emergency, tap below to instantly capture audio &amp; visual evidence for AI triage.
        </p>

        <PanicSnapButton onClick={handlePanicSnap} disabled={!!overlay} />

        {apiError && (
          <p className="mt-6 max-w-[280px] text-center text-sm text-red-400" role="alert">
            {apiError}
          </p>
        )}

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

      {overlay && <RecordingOverlay phase={overlay} />}
      <FirstAidModal
        open={firstAidOpen}
        onClose={() => setFirstAidOpen(false)}
        data={response}
      />
    </div>
  );
}
