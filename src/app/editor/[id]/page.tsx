"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Download,
  Loader2,
  Wand2,
  FolderOpen,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { GenerationPanel } from "@/components/GenerationPanel";
import { AssetLibrary } from "@/components/AssetLibrary";
import { Timeline } from "@/components/Timeline";
import { PreviewPlayer } from "@/components/PreviewPlayer";
import { MediaAsset, VideoProject } from "@/types";
import { addAssetToProject, downloadDataURL } from "@/lib/project";

type SidebarTab = "generate" | "assets";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getProject, updateProject } = useAppStore();

  const [project, setProject] = useState<VideoProject | null>(() => getProject(id) ?? null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("generate");
  const [currentTime, setCurrentTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!project) {
      router.replace("/projects");
    }
  }, [project, router]);

  const handleTimeUpdate = useCallback((t: number) => {
    setCurrentTime(t);
  }, []);

  function handleAssetGenerated(asset: MediaAsset) {
    if (!project) return;
    const updated = addAssetToProject(project, asset);
    setProject(updated);
    setSidebarTab("assets");
  }

  function handleAddAsset(asset: MediaAsset) {
    if (!project) return;
    const updated = addAssetToProject(project, asset);
    setProject(updated);
  }

  function handleRemoveAsset(assetId: string) {
    if (!project) return;
    const updated: VideoProject = {
      ...project,
      assets: project.assets.filter((a) => a.id !== assetId),
      tracks: project.tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.assetId !== assetId),
      })),
    };
    setProject(updated);
  }

  function handleClipRemove(trackId: string, clipId: string) {
    if (!project) return;
    const updated: VideoProject = {
      ...project,
      tracks: project.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) }
          : t
      ),
    };
    setProject(updated);
  }

  function handleSave() {
    if (!project) return;
    setSaving(true);
    updateProject(project.id, project);
    setTimeout(() => {
      setSaving(false);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    }, 400);
  }

  function handleExport() {
    if (!project) return;
    // Export project as JSON manifest
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    downloadDataURL(url, `${project.name.replace(/\s+/g, "-")}-project.json`);
  }

  function handleDownloadAssets() {
    if (!project) return;
    project.assets.forEach((asset) => {
      downloadDataURL(asset.url, asset.name);
    });
  }

  function handleAssetAddToTimeline(asset: MediaAsset) {
    handleAddAsset(asset);
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-zinc-950 overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center gap-4 px-4 flex-shrink-0">
        <button
          onClick={() => router.push("/projects")}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="Back to projects"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-white truncate">{project.name}</span>
        {project.description && (
          <span className="text-zinc-500 text-sm truncate hidden md:block">
            — {project.description}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {saveMsg && <span className="text-green-400 text-sm">{saveMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
          <button
            onClick={handleDownloadAssets}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Assets
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Project
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-900">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setSidebarTab("generate")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                sidebarTab === "generate"
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Generate
            </button>
            <button
              onClick={() => setSidebarTab("assets")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                sidebarTab === "assets"
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Assets {project.assets.length > 0 && `(${project.assets.length})`}
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            {sidebarTab === "generate" ? (
              <GenerationPanel
                projectId={project.id}
                onAssetGenerated={handleAssetGenerated}
              />
            ) : (
              <AssetLibrary
                assets={project.assets}
                onAddAsset={handleAddAsset}
                onRemoveAsset={handleRemoveAsset}
                onAssetDrop={handleAssetAddToTimeline}
              />
            )}
          </div>
        </div>

        {/* Center: Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 min-h-0">
            <PreviewPlayer
              assets={project.assets}
              currentTime={currentTime}
              duration={project.duration}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>

          {/* Timeline */}
          <div className="h-52 flex-shrink-0 border-t border-zinc-800">
            <Timeline
              tracks={project.tracks}
              assets={project.assets}
              currentTime={currentTime}
              duration={project.duration}
              onClipRemove={handleClipRemove}
              onTimeClick={handleTimeUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
