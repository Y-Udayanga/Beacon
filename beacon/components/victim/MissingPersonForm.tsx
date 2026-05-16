"use client";

import { ImagePlus, Send, UserSearch, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  appendLocationToFormData,
  type UserLocation,
} from "@/lib/geolocation";
import type { MissingPersonExtraction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LocationBanner } from "./LocationBanner";

interface MissingPersonFormProps {
  onBack: () => void;
  location: UserLocation | null;
  locationLoading: boolean;
  locationError: string | null;
}

export function MissingPersonForm({
  onBack,
  location,
  locationLoading,
  locationError,
}: MissingPersonFormProps) {
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [extraction, setExtraction] = useState<MissingPersonExtraction | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setApiError("Please add a photo of the missing person.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const formData = new FormData();
      formData.append("image", photoFile, photoFile.name || "missing.jpg");
      formData.append("description", description.trim());
      appendLocationToFormData(formData, location);

      const res = await fetch("/api/missing-person", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Report failed");
      }

      setExtraction(data as MissingPersonExtraction);
      if (typeof data.report_id === "string") setReportId(data.report_id);
      setSubmitted(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Could not submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && extraction) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 rounded-full bg-emerald-500/20 p-4">
          <Send className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Report Submitted</h2>
        {reportId && (
          <p className="mt-1 font-mono text-xs text-zinc-500">ID: {reportId}</p>
        )}
        <p className="mt-2 max-w-xs text-sm text-zinc-400">
          Dispatch received AI-extracted search tags for coordination.
        </p>
        <div className="mt-6 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-4 text-left text-sm">
          <p className="text-zinc-300">
            <span className="text-zinc-500">Age:</span> {extraction.estimated_age}
          </p>
          <p className="mt-2 text-zinc-300">
            <span className="text-zinc-500">Clothing:</span>{" "}
            {extraction.clothing_colors.join(", ")}
          </p>
          <p className="mt-2 text-zinc-300">
            <span className="text-zinc-500">Last seen:</span> {extraction.last_known_location}
          </p>
          {extraction.distinguishing_features.length > 0 && (
            <p className="mt-2 text-zinc-300">
              <span className="text-zinc-500">Features:</span>{" "}
              {extraction.distinguishing_features.join("; ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="mt-8 text-sm text-zinc-500 underline-offset-4 hover:text-white hover:underline"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 self-start text-sm text-zinc-500 hover:text-white"
      >
        ← Back
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/20 p-3">
          <UserSearch className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Report Missing Person</h2>
          <p className="text-sm text-zinc-500">Upload a photo and describe who you&apos;re looking for</p>
        </div>
      </div>

      <LocationBanner
        location={location}
        loading={locationLoading}
        error={locationError}
      />

      <form onSubmit={handleSubmit} className="mt-5 flex flex-1 flex-col gap-5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 transition-colors hover:border-blue-500/40 hover:bg-blue-500/5",
            photoPreview && "border-solid border-blue-500/30 overflow-hidden p-0"
          )}
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-zinc-500" />
              <span className="text-sm text-zinc-400">Tap to upload or take photo</span>
            </>
          )}
        </button>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-400">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Name, age, clothing, last seen location…"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>

        {apiError && (
          <p className="text-center text-sm text-red-400" role="alert">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSubmitting ? "Processing Details..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}