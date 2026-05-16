"use client";

import { Radio } from "lucide-react";

interface PanicSnapButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function PanicSnapButton({ onClick, disabled }: PanicSnapButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      <span className="panic-ring pointer-events-none absolute h-[min(72vw,280px)] w-[min(72vw,280px)] rounded-full" />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="panic-button relative flex h-[min(68vw,260px)] w-[min(68vw,260px)] flex-col items-center justify-center gap-3 rounded-full bg-gradient-to-b from-red-500 to-red-700 text-white shadow-2xl transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        aria-label="Panic Snap — capture emergency evidence"
      >
        <Radio className="h-10 w-10 opacity-90" strokeWidth={2.5} />
        <span className="text-center text-2xl font-black uppercase tracking-wider">
          Panic
          <br />
          Snap
        </span>
        <span className="text-xs font-medium uppercase tracking-widest opacity-80">
          Hold to send
        </span>
      </button>
    </div>
  );
}
