"use client";

import Link from "next/link";
import { Film, Sparkles, Zap, Download, Wand2, Mic, Image, Video } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Text-to-Speech",
    description: "Convert your scripts to natural-sounding voiceovers using state-of-the-art TTS models.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Image,
    title: "Image Generation",
    description: "Generate stunning visuals from text prompts with FLUX, Stable Diffusion and more.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    icon: Video,
    title: "Video Generation",
    description: "Turn text descriptions into short video clips with AI video generation models.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Wand2,
    title: "Voice Cloning",
    description: "Clone voices and produce customized speech for your short video content.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Film,
    title: "Video Editor",
    description: "Arrange clips, images, and audio on an intuitive timeline editor.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Download,
    title: "Export & Download",
    description: "Save your projects and download generated assets in various formats.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          Powered by HuggingFace AI Models
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Create AI-Powered
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            Short Videos
          </span>
        </h1>
        <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-12">
          Connect your HuggingFace API key and access hundreds of AI models for text-to-speech,
          image generation, video creation, and voice cloning — all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            <Film className="w-5 h-5" />
            Start Creating
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors border border-zinc-700"
          >
            <Zap className="w-5 h-5" />
            Connect HuggingFace
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.bg} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="bg-gradient-to-r from-violet-900/50 to-pink-900/50 border border-violet-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-zinc-300 mb-8">
            Add your HuggingFace API key in settings, then create your first project.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            <Zap className="w-5 h-5" />
            Configure API Key
          </Link>
        </div>
      </section>
    </div>
  );
}
