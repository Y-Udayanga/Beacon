import { NextResponse } from "next/server";
import {
  blobToInlinePart,
  createGeminiClient,
  getGeminiModel,
  isValidFileEntry,
  parseModelJson,
  SchemaType,
  type GeminiSchema,
} from "@/lib/gemini";
import type { PanicSnapResponse } from "@/lib/types";

const CRISIS_PROMPT = `You are a crisis triage AI. Analyze this image and audio.
1) Translate the audio to English.
2) Assess the physical threat in the image.
3) Output a structured JSON response with triage_level (number 1-5), incident_type (string), translated_audio (string), visual_assessment (string), and first_aid_instructions (string).`;

const PANIC_SNAP_SCHEMA: GeminiSchema = {
  type: SchemaType.OBJECT,
  properties: {
    triage_level: { type: SchemaType.NUMBER },
    incident_type: { type: SchemaType.STRING },
    translated_audio: { type: SchemaType.STRING },
    visual_assessment: { type: SchemaType.STRING },
    first_aid_instructions: { type: SchemaType.STRING },
  },
  required: [
    "triage_level",
    "incident_type",
    "translated_audio",
    "visual_assessment",
    "first_aid_instructions",
  ],
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const audio = formData.get("audio");

    if (!isValidFileEntry(image)) {
      return NextResponse.json(
        { error: "Missing or empty required field: image" },
        { status: 400 }
      );
    }

    const hasAudio = isValidFileEntry(audio);
    
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
    if (image.size > MAX_FILE_SIZE || (hasAudio && audio.size > MAX_FILE_SIZE)) {
      return NextResponse.json(
        { error: "File sizes must be under 4MB to prevent server memory exhaustion." },
        { status: 413 }
      );
    }

    // Ensure API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const client = createGeminiClient();
    const model = getGeminiModel(client, {
      responseMimeType: "application/json",
      responseSchema: PANIC_SNAP_SCHEMA,
    });

    const imagePart = await blobToInlinePart(image, "image/jpeg");
    const parts: any[] = [imagePart];
    
    if (hasAudio) {
      parts.push(await blobToInlinePart(audio, "audio/webm"));
    }
    
    parts.push({ text: CRISIS_PROMPT });

    const result = await model.generateContent(parts);

    const text = result.response.text();
    if (!text) {
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 502 }
      );
    }

    const parsed = parseModelJson<PanicSnapResponse>(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[panic-snap]", error);

    if (error instanceof Error && error.message === "GEMINI_API_KEY is not configured") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process panic snap" },
      { status: 500 }
    );
  }
}
