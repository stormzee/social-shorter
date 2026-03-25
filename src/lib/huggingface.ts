import { HfInference } from "@huggingface/inference";
import { HFModel } from "@/types";

export const RECOMMENDED_MODELS: HFModel[] = [
  {
    id: "microsoft/speecht5_tts",
    name: "SpeechT5 TTS",
    task: "text-to-speech",
    description: "Convert text to natural-sounding speech",
    inputType: "text",
    outputType: "audio",
  },
  {
    id: "facebook/mms-tts-eng",
    name: "MMS TTS English",
    task: "text-to-speech",
    description: "Meta's Massively Multilingual Speech TTS model",
    inputType: "text",
    outputType: "audio",
  },
  {
    id: "black-forest-labs/FLUX.1-schnell",
    name: "FLUX.1 Schnell",
    task: "text-to-image",
    description: "Fast, high-quality text-to-image generation",
    inputType: "text",
    outputType: "image",
  },
  {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    task: "text-to-image",
    description: "High-resolution image generation from text",
    inputType: "text",
    outputType: "image",
  },
  {
    id: "runwayml/stable-diffusion-v1-5",
    name: "Stable Diffusion v1.5",
    task: "image-generation",
    description: "Classic Stable Diffusion image generation",
    inputType: "text",
    outputType: "image",
  },
  {
    id: "ali-vilab/i2vgen-xl",
    name: "I2VGen-XL",
    task: "text-to-video",
    description: "Generate videos from images and text prompts",
    inputType: "image",
    outputType: "video",
  },
  {
    id: "damo-vilab/text-to-video-ms-1.7b",
    name: "Text-to-Video MS",
    task: "video-generation",
    description: "Generate short videos from text descriptions",
    inputType: "text",
    outputType: "video",
  },
  {
    id: "coqui/XTTS-v2",
    name: "XTTS v2",
    task: "voice-cloning",
    description: "Clone voices and generate speech",
    inputType: "audio",
    outputType: "audio",
  },
];

export function getModelsByTask(task: HFModel["task"]): HFModel[] {
  return RECOMMENDED_MODELS.filter((m) => m.task === task);
}

export function getModelById(id: string): HFModel | undefined {
  return RECOMMENDED_MODELS.find((m) => m.id === id);
}

export async function generateTextToSpeech(
  apiKey: string,
  text: string,
  model: string
): Promise<Blob> {
  const hf = new HfInference(apiKey);
  const result = await hf.textToSpeech({
    model,
    inputs: text,
  });
  return result;
}

export async function generateImage(
  apiKey: string,
  prompt: string,
  model: string
): Promise<Blob> {
  const hf = new HfInference(apiKey);
  const result = await hf.textToImage(
    {
      model,
      inputs: prompt,
      parameters: { num_inference_steps: 20 },
    },
    { outputType: "blob" }
  );
  return result;
}

export async function generateVideo(
  apiKey: string,
  prompt: string,
  model: string
): Promise<Blob> {
  const hf = new HfInference(apiKey);
  const result = await hf.textToVideo({
    model,
    inputs: prompt,
  });
  return result;
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
