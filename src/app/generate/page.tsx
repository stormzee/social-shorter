"use client";

import { useState } from "react";
import {
  Mic,
  Image,
  Video,
  Wand2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { RECOMMENDED_MODELS, getModelsByTask, generateId } from "@/lib/huggingface";
import { useAppStore } from "@/store/appStore";
import { HFTaskType, MediaAsset } from "@/types";
import { downloadDataURL } from "@/lib/project";

const TASKS: {
  id: HFTaskType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}[] = [
  { id: "text-to-speech", label: "Text-to-Speech", icon: Mic, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "text-to-image", label: "Text-to-Image", icon: Image, color: "text-pink-400", bg: "bg-pink-400/10" },
  { id: "image-generation", label: "Image Generation", icon: Image, color: "text-purple-400", bg: "bg-purple-400/10" },
  { id: "text-to-video", label: "Text-to-Video", icon: Video, color: "text-violet-400", bg: "bg-violet-400/10" },
  { id: "video-generation", label: "Video Generation", icon: Video, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { id: "voice-cloning", label: "Voice Cloning", icon: Wand2, color: "text-amber-400", bg: "bg-amber-400/10" },
];

function MediaPreview({ asset }: { asset: MediaAsset }) {
  if (asset.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.url}
        alt={asset.prompt ?? asset.name}
        className="max-h-72 w-auto rounded-lg object-contain mx-auto block"
      />
    );
  }
  if (asset.type === "audio") {
    return (
      <audio controls src={asset.url} className="w-full mt-2" />
    );
  }
  if (asset.type === "video") {
    return (
      <video controls src={asset.url} className="max-h-72 w-full rounded-lg" />
    );
  }
  return null;
}

export default function GeneratePage() {
  const { settings, addGenerationJob, updateGenerationJob } = useAppStore();

  const [selectedTask, setSelectedTask] = useState<HFTaskType>("text-to-speech");
  const [selectedModel, setSelectedModel] = useState(
    getModelsByTask("text-to-speech")[0]?.id ?? ""
  );
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState("");
  const [generatedAssets, setGeneratedAssets] = useState<MediaAsset[]>([]);

  const availableModels = getModelsByTask(selectedTask);
  const currentTask = TASKS.find((t) => t.id === selectedTask);
  const selectedModelInfo = RECOMMENDED_MODELS.find((m) => m.id === selectedModel);
  const hasApiKey = Boolean(settings.hfApiKey);

  function handleTaskChange(task: HFTaskType) {
    setSelectedTask(task);
    const models = getModelsByTask(task);
    setSelectedModel(models[0]?.id ?? "");
    setLastError("");
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    if (!hasApiKey) {
      setLastError("No HuggingFace API key configured. Go to Settings to add it.");
      return;
    }

    const jobId = generateId();
    addGenerationJob({
      id: jobId,
      status: "running",
      task: selectedTask,
      model: selectedModel,
      prompt: prompt.trim(),
      createdAt: Date.now(),
    });

    setIsGenerating(true);
    setLastError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: selectedTask,
          prompt: prompt.trim(),
          model: selectedModel,
          apiKey: settings.hfApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const { dataURL, mimeType, fileExt } = data as {
        dataURL: string;
        mimeType: string;
        fileExt: string;
      };

      const mediaType = mimeType.startsWith("video")
        ? "video"
        : mimeType.startsWith("audio")
        ? "audio"
        : "image";

      const asset: MediaAsset = {
        id: generateId(),
        name: `${selectedTask}-${Date.now()}.${fileExt}`,
        type: mediaType,
        url: dataURL,
        createdAt: Date.now(),
        source: "generated",
        prompt: prompt.trim(),
      };

      updateGenerationJob(jobId, { status: "completed", result: asset });
      setGeneratedAssets((prev) => [asset, ...prev]);
      setPrompt("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      updateGenerationJob(jobId, { status: "failed", error: message });
      setLastError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload(asset: MediaAsset) {
    downloadDataURL(asset.url, asset.name);
  }

  function handleRemove(assetId: string) {
    setGeneratedAssets((prev) => prev.filter((a) => a.id !== assetId));
  }

  function handleDownloadAll() {
    generatedAssets.forEach((asset) => downloadDataURL(asset.url, asset.name));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-1">Generate Media</h1>
      <p className="text-zinc-400 mb-8">
        Use HuggingFace AI models to create audio, images, and videos — then download them
        directly to your PC.
      </p>

      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3 mb-6 text-sm text-amber-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            No HuggingFace API key found.{" "}
            <a href="/settings" className="underline font-medium hover:text-amber-200">
              Add it in Settings
            </a>{" "}
            to start generating media.
          </span>
          <a
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-amber-400 hover:text-amber-200 whitespace-nowrap"
          >
            Get token <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Generation Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        {/* Task Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {TASKS.map((task) => {
            const active = selectedTask === task.id;
            return (
              <button
                key={task.id}
                onClick={() => handleTaskChange(task.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  active
                    ? `${task.bg} ${task.color} border-current`
                    : "bg-zinc-800 text-zinc-400 border-transparent hover:bg-zinc-700 hover:text-white"
                }`}
              >
                <task.icon className="w-4 h-4 flex-shrink-0" />
                {task.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Model Selector */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Model</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 pr-8"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
            {selectedModelInfo && (
              <p className="text-xs text-zinc-600 mt-1">{selectedModelInfo.description}</p>
            )}
          </div>

          {/* Output info */}
          <div className="flex items-end">
            {currentTask && (
              <div className={`flex items-center gap-2 text-sm ${currentTask.color} ${currentTask.bg} border border-current/20 rounded-lg px-3 py-2.5 w-full`}>
                <currentTask.icon className="w-4 h-4 flex-shrink-0" />
                <span>
                  {selectedModelInfo
                    ? `${selectedModelInfo.inputType} → ${selectedModelInfo.outputType}`
                    : currentTask.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-xs text-zinc-500 mb-1.5">
            {selectedTask === "text-to-speech" || selectedTask === "voice-cloning"
              ? "Text to speak"
              : "Prompt"}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && prompt.trim()) {
                handleGenerate();
              }
            }}
            placeholder={
              selectedTask === "text-to-speech" || selectedTask === "voice-cloning"
                ? "Enter the text to convert to speech..."
                : "Describe what you want to generate..."
            }
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <p className="text-xs text-zinc-600 mt-1">Press Ctrl+Enter to generate</p>
        </div>

        {/* Error */}
        {lastError && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {lastError}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || !hasApiKey}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              {currentTask && <currentTask.icon className="w-5 h-5" />}
              Generate {currentTask?.label ?? ""}
            </>
          )}
        </button>
      </div>

      {/* Generated Results */}
      {generatedAssets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Generated ({generatedAssets.length})
            </h2>
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          </div>

          <div className="space-y-4">
            {generatedAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                    {asset.prompt && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{asset.prompt}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(asset)}
                      className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      onClick={() => handleRemove(asset.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/10"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <MediaPreview asset={asset} />
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedAssets.length === 0 && !isGenerating && (
        <div className="text-center py-16 text-zinc-600">
          <Wand2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Your generated media will appear here.</p>
          <p className="text-xs mt-1">Each result can be previewed and downloaded directly to your PC.</p>
        </div>
      )}
    </div>
  );
}
