import { VideoProject, MediaAsset } from "@/types";

export function createNewProject(name: string, description = ""): VideoProject {
  const id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  const now = Date.now();
  return {
    id,
    name,
    description,
    createdAt: now,
    updatedAt: now,
    duration: 60,
    assets: [],
    tracks: [
      {
        id: `track-video-${id}`,
        type: "video",
        name: "Video Track",
        clips: [],
      },
      {
        id: `track-audio-${id}`,
        type: "audio",
        name: "Audio Track",
        clips: [],
      },
      {
        id: `track-image-${id}`,
        type: "image",
        name: "Image Track",
        clips: [],
      },
    ],
  };
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadDataURL(dataURL: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function getAssetMediaType(url: string): "video" | "image" | "audio" {
  if (url.startsWith("data:video") || url.endsWith(".mp4") || url.endsWith(".webm")) return "video";
  if (url.startsWith("data:audio") || url.endsWith(".wav") || url.endsWith(".mp3")) return "audio";
  return "image";
}

export function addAssetToProject(
  project: VideoProject,
  asset: MediaAsset
): VideoProject {
  const targetTrack = project.tracks.find((t) => t.type === asset.type);
  if (!targetTrack) return { ...project, assets: [...project.assets, asset] };

  const newClipId = `clip-${asset.id}`;
  const usedEnd = targetTrack.clips.reduce(
    (max, c) => Math.max(max, c.startTime + c.duration),
    0
  );

  const newClip = {
    id: newClipId,
    assetId: asset.id,
    startTime: usedEnd,
    duration: asset.duration ?? 5,
    trackId: targetTrack.id,
  };

  const updatedTracks = project.tracks.map((t) =>
    t.id === targetTrack.id
      ? { ...t, clips: [...t.clips, newClip] }
      : t
  );

  return {
    ...project,
    assets: [...project.assets, asset],
    tracks: updatedTracks,
  };
}
