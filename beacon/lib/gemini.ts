import {
  GoogleGenerativeAI,
  type GenerationConfig,
  type Part,
  type Schema,
  SchemaType,
} from "@google/generative-ai";

export type GeminiSchema = Schema;

const MODEL_ID = "gemini-3-flash-preview";

function normalizeMimeType(mime: string | undefined, fallback: string): string {
  const base = (mime || "").split(";")[0].trim().toLowerCase();
  if (!base || base === "application/octet-stream") {
    return fallback;
  }
  return base;
}

/** Returns a configured Gemini client or throws if the API key is missing. */
export function createGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

/** Resolves the gemini-1.5-pro model with optional JSON generation config. */
export function getGeminiModel(
  client: GoogleGenerativeAI,
  generationConfig?: Pick<GenerationConfig, "responseMimeType" | "responseSchema">
) {
  return client.getGenerativeModel({
    model: MODEL_ID,
    ...(generationConfig ? { generationConfig } : {}),
  });
}

/**
 * Converts a File/Blob from FormData into Gemini inlineData (base64 + mimeType).
 */
export async function blobToInlinePart(blob: Blob, fallbackMime: string): Promise<Part> {
  const bytes = Buffer.from(await blob.arrayBuffer());
  return {
    inlineData: {
      mimeType: normalizeMimeType(blob.type, fallbackMime),
      data: bytes.toString("base64"),
    },
  };
}

/** True when the FormData entry is a non-empty file upload. */
export function isValidFileEntry(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

/**
 * Parses model text as JSON. Strips optional markdown fences if the model adds them.
 */
export function parseModelJson<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(raw) as T;
}

export { MODEL_ID, SchemaType };
