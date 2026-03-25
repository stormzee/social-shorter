import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VideoProject, AppSettings, GenerationJob } from "@/types";

interface AppStore {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Projects
  projects: VideoProject[];
  addProject: (project: VideoProject) => void;
  updateProject: (id: string, updates: Partial<VideoProject>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => VideoProject | undefined;

  // Generation jobs
  generationJobs: GenerationJob[];
  addGenerationJob: (job: GenerationJob) => void;
  updateGenerationJob: (id: string, updates: Partial<GenerationJob>) => void;
  clearCompletedJobs: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      settings: {
        hfApiKey: "",
        defaultOutputDir: "downloads",
      },

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      projects: [],

      addProject: (project) =>
        set((state) => ({
          projects: [project, ...state.projects],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),

      generationJobs: [],

      addGenerationJob: (job) =>
        set((state) => ({
          generationJobs: [job, ...state.generationJobs],
        })),

      updateGenerationJob: (id, updates) =>
        set((state) => ({
          generationJobs: state.generationJobs.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        })),

      clearCompletedJobs: () =>
        set((state) => ({
          generationJobs: state.generationJobs.filter(
            (j) => j.status === "pending" || j.status === "running"
          ),
        })),
    }),
    {
      name: "social-shorter-storage",
    }
  )
);
