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
import type { MissingPersonExtraction } from "@/lib/types";

const MISSING_PERSON_SCHEMA: GeminiSchema = {
  type: SchemaType.OBJECT,
  properties: {
    estimated_age: { type: SchemaType.STRING },
    clothing_colors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    last_known_location: { type: SchemaType.STRING },
    distinguishing_features: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: [
    "estimated_age",
    "clothing_colors",
    "last_known_location",
    "distinguishing_features",
  ],
};

function buildExtractionPrompt(description: string): string {
  return `You are an entity extraction AI. Look at this photo of a missing person and read the provided text description: ${description}. Output a strict JSON object with standard tags: estimated_age (string), clothing_colors (array of strings), last_known_location (string), and distinguishing_features (array of strings).`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const description = formData.get("description");

    if (!isValidFileEntry(image)) {
      return NextResponse.json(
        { error: "Missing or empty required field: image" },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image size must be under 4MB to prevent server memory exhaustion." },
        { status: 413 }
      );
    }

    if (typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Missing or empty required field: description" },
        { status: 400 }
      );
    }

    const client = createGeminiClient();
    const model = getGeminiModel(client, {
      responseMimeType: "application/json",
      responseSchema: MISSING_PERSON_SCHEMA,
    });

    const imagePart = await blobToInlinePart(image, "image/jpeg");
    const prompt = buildExtractionPrompt(description.trim());

    const result = await model.generateContent([imagePart, { text: prompt }]);

    const text = result.response.text();
    if (!text) {
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 502 }
      );
    }

    const parsed = parseModelJson<MissingPersonExtraction>(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[missing-person]", error);

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
      { error: "Failed to process missing person report" },
      { status: 500 }
    );
  }
}
