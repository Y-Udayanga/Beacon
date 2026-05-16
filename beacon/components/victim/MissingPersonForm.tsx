"use client";

import { ImagePlus, Send, UserSearch, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MissingPersonFormProps {
  onBack: () => void;
}

export function MissingPersonForm({ onBack }: MissingPersonFormProps) {
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Connect this to actual API endpoint
    await new Promise(r => setTimeout(r, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 rounded-full bg-emerald-500/20 p-4">
          <Send className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Report Submitted</h2>
        <p className="mt-2 max-w-xs text-sm text-zinc-400">
          Dispatch has received your missing person report and is coordinating search units.
        </p>
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

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
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
            photoPreview && "border-solid border-blue-500/30 p-0 overflow-hidden"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSubmitting ? "Processing Details..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
