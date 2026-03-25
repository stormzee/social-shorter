export type MediaType = "video" | "image" | "audio";

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  createdAt: number;
  source: "upload" | "generated";
  prompt?: string;
}

export interface TimelineTrack {
  id: string;
  type: MediaType;
  name: string;
  clips: TimelineClip[];
}

export interface TimelineClip {
  id: string;
  assetId: string;
  startTime: number;
  duration: number;
  trackId: string;
}

export interface VideoProject {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  duration: number;
  assets: MediaAsset[];
  tracks: TimelineTrack[];
  thumbnail?: string;
}

export type HFTaskType =
  | "text-to-speech"
  | "text-to-image"
  | "image-to-image"
  | "text-to-video"
  | "voice-cloning"
  | "image-generation"
  | "video-generation";

export interface HFModel {
  id: string;
  name: string;
  task: HFTaskType;
  description: string;
  inputType: "text" | "image" | "audio";
  outputType: MediaType;
}

export interface GenerationJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  task: HFTaskType;
  model: string;
  prompt: string;
  result?: MediaAsset;
  error?: string;
  createdAt: number;
}

export interface AppSettings {
  hfApiKey: string;
  defaultOutputDir: string;
}
