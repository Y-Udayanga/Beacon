"use client";

import { UserSearch } from "lucide-react";
import type { MissingPersonReport } from "@/lib/types";

interface MissingPersonsPanelProps {
  reports: MissingPersonReport[];
}

const STATUS_STYLES: Record<
  MissingPersonReport["status"],
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  searching: {
    label: "Searching",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  located: {
    label: "Located",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
};

export function MissingPersonsPanel({ reports }: MissingPersonsPanelProps) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <UserSearch className="mb-4 h-12 w-12 text-blue-400/50" />
        <h3 className="text-lg font-semibold text-zinc-300">No missing person reports yet</h3>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Reports from the victim app appear here in real time after AI extraction.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-zinc-400">
          <tr>
            <th className="px-6 py-4 font-medium">Report ID</th>
            <th className="px-6 py-4 font-medium">AI Tags</th>
            <th className="px-6 py-4 font-medium">Last known</th>
            <th className="px-6 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {reports.map((report) => {
            const style = STATUS_STYLES[report.status];
            const ext = report.extraction;
            const tags = ext
              ? [
                  ext.estimated_age && `Age: ${ext.estimated_age}`,
                  ext.clothing_colors?.length
                    ? `Wearing: ${ext.clothing_colors.join(", ")}`
                    : null,
                  ext.distinguishing_features?.length
                    ? ext.distinguishing_features.join("; ")
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : report.description;

            return (
              <tr key={report.id} className="transition-colors hover:bg-white/[0.04]">
                <td className="px-6 py-4 font-mono text-zinc-300">{report.id}</td>
                <td className="max-w-md px-6 py-4 text-zinc-400">{tags}</td>
                <td className="px-6 py-4 text-zinc-500">
                  {ext?.last_known_location ?? "—"}
                  {report.latitude != null && (
                    <span className="mt-1 block font-mono text-[10px] text-zinc-600">
                      GPS: {report.latitude.toFixed(4)}, {report.longitude?.toFixed(4)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.className}`}
                  >
                    {style.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
