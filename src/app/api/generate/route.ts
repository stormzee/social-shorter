import { NextRequest, NextResponse } from "next/server";
import { generateTextToSpeech, generateImage, generateVideo } from "@/lib/huggingface";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, prompt, model, apiKey } = body as {
      task: string;
      prompt: string;
      model: string;
      apiKey: string;
    };

    if (!apiKey) {
      return NextResponse.json(
        { error: "HuggingFace API key is required" },
        { status: 400 }
      );
    }
    if (!prompt || !model) {
      return NextResponse.json(
        { error: "prompt and model are required" },
        { status: 400 }
      );
    }

    let resultBlob: Blob;
    let mimeType: string;
    let fileExt: string;

    switch (task) {
      case "text-to-speech":
      case "voice-cloning": {
        resultBlob = await generateTextToSpeech(apiKey, prompt, model);
        mimeType = "audio/wav";
        fileExt = "wav";
        break;
      }
      case "text-to-image":
      case "image-generation": {
        resultBlob = await generateImage(apiKey, prompt, model);
        mimeType = "image/png";
        fileExt = "png";
        break;
      }
      case "text-to-video":
      case "video-generation": {
        resultBlob = await generateVideo(apiKey, prompt, model);
        mimeType = "video/mp4";
        fileExt = "mp4";
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unknown task: ${task}` },
          { status: 400 }
        );
    }

    const arrayBuffer = await resultBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataURL = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ dataURL, mimeType, fileExt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
