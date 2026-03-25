"use client";

import { useState } from "react";
import {
  Mic,
  Image,
  Video,
  Wand2,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle,

} from "lucide-react";
import { RECOMMENDED_MODELS, getModelsByTask, generateId } from "@/lib/huggingface";
import { useAppStore } from "@/store/appStore";
import { HFTaskType, MediaAsset } from "@/types";

const TASKS: { id: HFTaskType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "text-to-speech", label: "Text-to-Speech", icon: Mic, color: "text-blue-400" },
  { id: "text-to-image", label: "Text-to-Image", icon: Image, color: "text-pink-400" },
  { id: "image-generation", label: "Image Generation", icon: Image, color: "text-purple-400" },
  { id: "text-to-video", label: "Text-to-Video", icon: Video, color: "text-violet-400" },
  { id: "video-generation", label: "Video Generation", icon: Video, color: "text-indigo-400" },
  { id: "voice-cloning", label: "Voice Cloning", icon: Wand2, color: "text-amber-400" },
];

interface GenerationPanelProps {
  projectId: string;
  onAssetGenerated: (asset: MediaAsset) => void;
}

export function GenerationPanel({ projectId, onAssetGenerated }: GenerationPanelProps) {
  const { settings, addGenerationJob, updateGenerationJob } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<HFTaskType>("text-to-speech");
  const [selectedModel, setSelectedModel] = useState(
    getModelsByTask("text-to-speech")[0]?.id ?? ""
  );
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState("");
  const [lastSuccess, setLastSuccess] = useState("");

  const availableModels = getModelsByTask(selectedTask);

  function handleTaskChange(task: HFTaskType) {
    setSelectedTask(task);
    const models = getModelsByTask(task);
    setSelectedModel(models[0]?.id ?? "");
    setLastError("");
    setLastSuccess("");
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    if (!settings.hfApiKey) {
      setLastError("No HuggingFace API key configured. Go to Settings to add it.");
      return;
    }

    const jobId = generateId();
    const job = {
      id: jobId,
      status: "running" as const,
      task: selectedTask,
      model: selectedModel,
      prompt: prompt.trim(),
      createdAt: Date.now(),
    };
    addGenerationJob(job);
    setIsGenerating(true);
    setLastError("");
    setLastSuccess("");

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
        duration: mediaType === "audio" ? 5 : mediaType === "video" ? 5 : undefined,
      };

      updateGenerationJob(jobId, { status: "completed", result: asset });
      onAssetGenerated(asset);
      setLastSuccess(`Generated: ${asset.name}`);
      setPrompt("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      updateGenerationJob(jobId, { status: "failed", error: message });
      setLastError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  const getTaskLabel = (task: HFTaskType) =>
    TASKS.find((t) => t.id === task)?.label ?? task;

  const currentTask = TASKS.find((t) => t.id === selectedTask);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
        AI Generation
      </h2>

      {/* Task Selector */}
      <div className="mb-4">
        <label className="block text-xs text-zinc-500 mb-1.5">Task</label>
        <div className="relative">
          <select
            value={selectedTask}
            onChange={(e) => handleTaskChange(e.target.value as HFTaskType)}
            className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 pr-8"
          >
            {TASKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* Model Selector */}
      <div className="mb-4">
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
        {selectedModel && (
          <p className="text-xs text-zinc-600 mt-1 truncate">
            {RECOMMENDED_MODELS.find((m) => m.id === selectedModel)?.description}
          </p>
        )}
      </div>

      {/* Prompt */}
      <div className="mb-4 flex-1">
        <label className="block text-xs text-zinc-500 mb-1.5">
          Prompt / Text
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            selectedTask === "text-to-speech" || selectedTask === "voice-cloning"
              ? "Enter the text to convert to speech..."
              : "Describe what you want to generate..."
          }
          rows={5}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>

      {/* Status */}
      {lastError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {lastError}
        </div>
      )}
      {lastSuccess && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-3 text-xs text-green-400">
          <CheckCircle className="w-3.5 h-3.5" />
          {lastSuccess}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            {currentTask && <currentTask.icon className="w-4 h-4" />}
            Generate {getTaskLabel(selectedTask)}
          </>
        )}
      </button>

      {!settings.hfApiKey && (
        <p className="text-xs text-amber-400 text-center mt-2">
          ⚠ API key required.{" "}
          <a href="/settings" className="underline">
            Configure in Settings
          </a>
        </p>
      )}
    </div>
  );
}
