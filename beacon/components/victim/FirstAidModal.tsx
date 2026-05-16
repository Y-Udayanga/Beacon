"use client";

import { AlertTriangle, HeartPulse, ShieldAlert } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { PanicSnapResponse } from "@/lib/types";
import { cn, getTriageColor, getTriageLabel } from "@/lib/utils";

interface FirstAidModalProps {
  open: boolean;
  onClose: () => void;
  data: PanicSnapResponse | null;
}

export function FirstAidModal({ open, onClose, data }: FirstAidModalProps) {
  if (!data) return null;

  const triage = getTriageColor(data.triage_level);

  return (
    <Modal open={open} onClose={onClose} title="Zero-Minute First Aid" className="max-w-lg">
      <div className="space-y-5">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border p-4",
            triage.bg,
            triage.border
          )}
        >
          <ShieldAlert className={cn("h-8 w-8 shrink-0", triage.text)} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Triage Level {data.triage_level}
            </p>
            <p className={cn("text-lg font-bold", triage.text)}>
              {getTriageLabel(data.triage_level)} — {data.incident_type}
            </p>
          </div>
        </div>

        {data.visual_assessment && (
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
              Visual Assessment
            </p>
            <p className="text-sm text-zinc-300">{data.visual_assessment}</p>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Translated Audio
            </span>
          </div>
          <p className="text-sm italic text-zinc-300">&ldquo;{data.translated_audio}&rdquo;</p>
        </div>

        {data.ticket_id && (
          <p className="text-center text-xs text-zinc-500">
            Dispatch ticket <span className="font-mono text-zinc-400">{data.ticket_id}</span> created
          </p>
        )}

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-emerald-400">
            <HeartPulse className="h-5 w-5" />
            <span className="font-semibold">Immediate Actions</span>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-200">
            <li>{data.first_aid_instructions}</li>
            <li>Keep the victim still and monitor breathing.</li>
            <li>Do not remove embedded objects. Apply direct pressure if bleeding.</li>
            <li>Stay on scene — responders are being notified.</li>
          </ol>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
        >
          Acknowledged — I&apos;m following these steps
        </button>
      </div>
    </Modal>
  );
}
