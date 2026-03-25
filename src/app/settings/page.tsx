"use client";

import { useState } from "react";
import { Key, CheckCircle, AlertCircle, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/store/appStore";

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.hfApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateSettings({ hfApiKey: apiKey.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const hasKey = Boolean(settings.hfApiKey);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-zinc-400 mb-10">Configure your HuggingFace connection and platform preferences.</p>

      {/* API Key Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-violet-500/10 rounded-lg">
            <Key className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">HuggingFace API Key</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Your API key is stored locally in your browser. It is never sent to any server other than HuggingFace.
            </p>
          </div>
        </div>

        {hasKey && (
          <div className="flex items-center gap-2 text-green-400 text-sm mb-4 bg-green-400/10 rounded-lg px-3 py-2 border border-green-400/20">
            <CheckCircle className="w-4 h-4" />
            API key is configured — AI generation is enabled.
          </div>
        )}
        {!hasKey && (
          <div className="flex items-center gap-2 text-amber-400 text-sm mb-4 bg-amber-400/10 rounded-lg px-3 py-2 border border-amber-400/20">
            <AlertCircle className="w-4 h-4" />
            No API key set — please add your HuggingFace token to use AI models.
          </div>
        )}

        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="hf_..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
          />
          <button
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <a
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Get your free HuggingFace token
          </a>
          <button
            onClick={handleSave}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
          >
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* HuggingFace Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">About HuggingFace Integration</h2>
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            Social Shorter uses the{" "}
            <a href="https://huggingface.co/inference-api" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
              HuggingFace Inference API
            </a>{" "}
            to run AI models directly in your browser session.
          </p>
          <p>
            Supported tasks include:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Text-to-Speech (SpeechT5, MMS-TTS)</li>
            <li>Image Generation (FLUX.1, Stable Diffusion XL)</li>
            <li>Video Generation (Text-to-Video MS)</li>
            <li>Voice Cloning (XTTS v2)</li>
            <li>Text-to-Image (any compatible model)</li>
          </ul>
          <p>
            A free HuggingFace account gives you access to thousands of models with generous rate limits.
            For higher throughput, consider a{" "}
            <a href="https://huggingface.co/pricing" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
              PRO subscription
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
