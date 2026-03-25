"use client";

import { useState, useRef } from "react";
import { Upload, Download, Trash2, Film, Image, Mic, Plus } from "lucide-react";
import { MediaAsset } from "@/types";
import { downloadDataURL } from "@/lib/project";
import { generateId } from "@/lib/huggingface";

interface AssetLibraryProps {
  assets: MediaAsset[];
  onAddAsset: (asset: MediaAsset) => void;
  onRemoveAsset: (assetId: string) => void;
  onAssetDrop?: (asset: MediaAsset) => void;
}

const TYPE_ICONS = {
  video: Film,
  image: Image,
  audio: Mic,
};

const TYPE_COLORS = {
  video: "text-violet-400",
  image: "text-pink-400",
  audio: "text-blue-400",
};

export function AssetLibrary({ assets, onAddAsset, onRemoveAsset, onAssetDrop }: AssetLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFileUpload(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        let type: MediaAsset["type"] = "image";
        if (file.type.startsWith("video")) type = "video";
        else if (file.type.startsWith("audio")) type = "audio";

        const asset: MediaAsset = {
          id: generateId(),
          name: file.name,
          type,
          url,
          createdAt: Date.now(),
          source: "upload",
          duration: type === "video" || type === "audio" ? 5 : undefined,
        };
        onAddAsset(asset);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
          Assets
        </h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,image/*,audio/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => assets.length === 0 && fileInputRef.current?.click()}
        className={`flex-1 overflow-y-auto rounded-lg border-2 border-dashed transition-colors ${
          dragging
            ? "border-violet-500 bg-violet-500/10"
            : "border-zinc-800 hover:border-zinc-700"
        } ${assets.length === 0 ? "cursor-pointer" : ""}`}
      >
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <Upload className="w-8 h-8 text-zinc-700 mb-2" />
            <p className="text-zinc-600 text-sm">Drop files or click to upload</p>
            <p className="text-zinc-700 text-xs mt-1">Video, image, audio</p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {assets.map((asset) => {
              const Icon = TYPE_ICONS[asset.type];
              const color = TYPE_COLORS[asset.type];
              return (
                <div
                  key={asset.id}
                  className="flex items-center gap-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg p-2 group cursor-pointer transition-colors"
                  onClick={() => onAssetDrop?.(asset)}
                  title="Click to add to timeline"
                >
                  {/* Preview */}
                  <div className="w-10 h-10 rounded bg-zinc-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {asset.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className={`w-5 h-5 ${color}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{asset.name}</p>
                    <p className={`text-xs ${color} capitalize`}>
                      {asset.type}
                      {asset.source === "generated" && " · AI"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadDataURL(asset.url, asset.name);
                      }}
                      className="p-1 text-zinc-400 hover:text-white transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAsset(asset.id);
                      }}
                      className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
