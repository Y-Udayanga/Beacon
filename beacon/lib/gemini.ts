import {
  GoogleGenerativeAI,
  type GenerationConfig,
  type Part,
  SchemaType,
} from "@google/generative-ai";

const MODEL_ID = "gemini-1.5-pro";

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
      mimeType: blob.type || fallbackMime,
      data: bytes.toString("base64"),
    },
  };
}

/** True when the FormData entry is a non-empty Blob/File. */
export function isValidFileEntry(value: FormDataEntryValue | null): value is Blob {
  return value instanceof Blob && value.size > 0;
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
