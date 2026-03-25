"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { MediaAsset } from "@/types";

interface PreviewPlayerProps {
  assets: MediaAsset[];
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function PreviewPlayer({
  assets,
  currentTime,
  duration,
  onTimeUpdate,
}: PreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef<number>(currentTime);

  useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);

  const visibleAsset = assets.find((a) => a.type === "image" || a.type === "video");
  const audioAsset = assets.find((a) => a.type === "audio");

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const next = timeRef.current + 0.1;
        if (next >= duration) {
          setIsPlaying(false);
          onTimeUpdate(0);
          return;
        }
        onTimeUpdate(next);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, duration, onTimeUpdate]);

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    onTimeUpdate(parseFloat(e.target.value));
  }

  function togglePlay() {
    if (currentTime >= duration) {
      onTimeUpdate(0);
    }
    setIsPlaying((v) => !v);
  }

  return (
    <div className="flex flex-col h-full bg-black rounded-lg overflow-hidden">
      <div className="flex-1 flex items-center justify-center bg-zinc-950 relative min-h-0">
        {visibleAsset ? (
          visibleAsset.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={visibleAsset.url}
              alt={visibleAsset.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <video
              src={visibleAsset.url}
              className="max-h-full max-w-full object-contain"
              controls={false}
              muted={!audioAsset}
            />
          )
        ) : (
          <div className="text-zinc-700 text-sm text-center">
            <p className="text-4xl mb-2">▶</p>
            <p>Add assets to preview</p>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 rounded px-2 py-0.5 text-xs text-white font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="bg-zinc-900 p-3 border-t border-zinc-800">
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 accent-violet-500 cursor-pointer mb-3"
        />
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onTimeUpdate(0)}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Skip to start"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center text-white transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={() => onTimeUpdate(duration)}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Skip to end"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
