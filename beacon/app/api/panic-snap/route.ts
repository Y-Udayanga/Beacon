import { NextResponse } from "next/server";
import {
  blobToInlinePart,
  createGeminiClient,
  getGeminiModel,
  isValidFileEntry,
  parseModelJson,
  SchemaType,
} from "@/lib/gemini";
import type { PanicSnapResponse } from "@/lib/types";

const CRISIS_PROMPT = `You are a crisis triage AI. Analyze this image and audio.
1) Translate the audio to English.
2) Assess the physical threat in the image.
3) Output a structured JSON response with triage_level (number 1-5), incident_type (string), translated_audio (string), visual_assessment (string), and first_aid_instructions (string).`;

const PANIC_SNAP_SCHEMA = {
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

    if (!isValidFileEntry(audio)) {
      return NextResponse.json(
        { error: "Missing or empty required field: audio" },
        { status: 400 }
      );
    }

    const client = createGeminiClient();
    const model = getGeminiModel(client, {
      responseMimeType: "application/json",
      responseSchema: PANIC_SNAP_SCHEMA,
    });

    const imagePart = await blobToInlinePart(image, "image/png");
    const audioPart = await blobToInlinePart(audio, "audio/webm");

    const result = await model.generateContent([
      imagePart,
      audioPart,
      { text: CRISIS_PROMPT },
    ]);

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
