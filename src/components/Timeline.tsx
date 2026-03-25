"use client";

import { useState } from "react";
import { Film, Image, Mic, Trash2, GripHorizontal } from "lucide-react";
import { TimelineTrack, MediaAsset } from "@/types";

interface TimelineProps {
  tracks: TimelineTrack[];
  assets: MediaAsset[];
  currentTime: number;
  duration: number;
  onClipRemove: (trackId: string, clipId: string) => void;
  onTimeClick: (time: number) => void;
}

const TRACK_ICONS = {
  video: Film,
  image: Image,
  audio: Mic,
};

const TRACK_COLORS = {
  video: "bg-violet-600",
  image: "bg-pink-600",
  audio: "bg-blue-600",
};

const PIXELS_PER_SECOND = 60;

export function Timeline({
  tracks,
  assets,
  currentTime,
  duration,
  onClipRemove,
  onTimeClick,
}: TimelineProps) {
  const [hoveredClip, setHoveredClip] = useState<string | null>(null);

  const totalWidth = Math.max(duration * PIXELS_PER_SECOND, 600);

  function getAsset(assetId: string): MediaAsset | undefined {
    return assets.find((a) => a.id === assetId);
  }

  function handleRulerClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / PIXELS_PER_SECOND;
    onTimeClick(Math.max(0, Math.min(time, duration)));
  }

  const timeMarkers: number[] = [];
  for (let i = 0; i <= duration; i += 5) {
    timeMarkers.push(i);
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <div className="text-xs text-zinc-500 uppercase tracking-wide px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
        <Film className="w-3.5 h-3.5" />
        Timeline
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Track labels */}
        <div className="w-28 flex-shrink-0 border-r border-zinc-800">
          {/* Ruler space */}
          <div className="h-6 border-b border-zinc-800" />
          {tracks.map((track) => {
            const Icon = TRACK_ICONS[track.type];
            return (
              <div
                key={track.id}
                className="h-14 flex items-center gap-2 px-3 border-b border-zinc-800"
              >
                <Icon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400 truncate">{track.name}</span>
              </div>
            );
          })}
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div style={{ width: totalWidth + 40, minWidth: "100%" }}>
            {/* Time ruler */}
            <div
              className="h-6 relative border-b border-zinc-800 cursor-pointer bg-zinc-900 select-none"
              onClick={handleRulerClick}
            >
              {timeMarkers.map((t) => (
                <div
                  key={t}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: t * PIXELS_PER_SECOND }}
                >
                  <div className="w-px h-2 bg-zinc-700 mt-1" />
                  <span className="text-[10px] text-zinc-600 mt-0.5 -translate-x-1/2">
                    {Math.floor(t / 60)}:{(t % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              ))}
              {/* Playhead */}
              <div
                className="absolute top-0 w-px h-full bg-red-500 z-10 pointer-events-none"
                style={{ left: currentTime * PIXELS_PER_SECOND }}
              />
            </div>

            {/* Tracks */}
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-14 relative border-b border-zinc-800 bg-zinc-900/50"
              >
                {/* Background grid */}
                {timeMarkers.map((t) => (
                  <div
                    key={t}
                    className="absolute top-0 h-full w-px bg-zinc-800"
                    style={{ left: t * PIXELS_PER_SECOND }}
                  />
                ))}

                {/* Clips */}
                {track.clips.map((clip) => {
                  const asset = getAsset(clip.assetId);
                  if (!asset) return null;
                  const clipColor = TRACK_COLORS[track.type];
                  const isHovered = hoveredClip === clip.id;

                  return (
                    <div
                      key={clip.id}
                      className={`absolute top-1 bottom-1 ${clipColor} rounded flex items-center overflow-hidden cursor-pointer group`}
                      style={{
                        left: clip.startTime * PIXELS_PER_SECOND,
                        width: Math.max(clip.duration * PIXELS_PER_SECOND, 20),
                      }}
                      onMouseEnter={() => setHoveredClip(clip.id)}
                      onMouseLeave={() => setHoveredClip(null)}
                    >
                      <GripHorizontal className="w-3 h-3 text-white/50 mx-1 flex-shrink-0" />
                      <span className="text-white text-[10px] truncate flex-1">
                        {asset.name}
                      </span>
                      {isHovered && (
                        <button
                          onClick={() => onClipRemove(track.id, clip.id)}
                          className="mr-1 p-0.5 rounded hover:bg-black/30 transition-colors flex-shrink-0"
                          aria-label="Remove clip"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Playhead */}
                <div
                  className="absolute top-0 w-px h-full bg-red-500/50 pointer-events-none z-10"
                  style={{ left: currentTime * PIXELS_PER_SECOND }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
