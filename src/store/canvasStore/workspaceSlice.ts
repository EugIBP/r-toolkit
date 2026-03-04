// src/store/canvasStore/workspaceSlice.ts
import { invoke } from "@tauri-apps/api/core";
import { LazyStore } from "@tauri-apps/plugin-store";
import { toast } from "sonner";
import type { StateCreator } from "zustand";
import type { CanvasStore } from "./types";
import { useProjectStore } from "../useProjectStore";
import { useHistoryStore } from "../useHistory";

export const appSettings = new LazyStore("settings.json");
const MAX_DEFAULT_STEPS = 50;

export const createWorkspaceSlice: StateCreator<
  CanvasStore,
  [],
  [],
  Pick<
    CanvasStore,
    | "hasUnsavedChanges"
    | "setHasUnsavedChanges"
    | "resetCanvas"
    | "saveWorkspace"
    | "loadWorkspace"
  >
> = (set, get) => ({
  hasUnsavedChanges: false,

  setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),

  resetCanvas: () => {
    useHistoryStore.getState().closeProject();
    set({
      selectedIconIndex: null,
      selectedColorKey: null,
      selectedAssetPath: null,
      selectedStates: {},
      iconFrames: {},
      iconFrameCounts: {},
      iconOrientations: {},
      zoom: 0.85,
      searchQuery: "",
      activeTab: "screens",
      activeScreenIdx: 0,
      showScreenSettings: false,
      hasUnsavedChanges: false,
      expandedStackIndices: null,
      previewBgPath: null,
    });
  },

  saveWorkspace: async () => {
    const { baseDir, projectData } = useProjectStore.getState();
    if (!baseDir) return;
    const base = baseDir.replace(/[\\/]$/, "");

    const {
      iconFrames,
      iconFrameCounts,
      iconOrientations,
      selectedStates,
      snapToGrid,
      gridSize,
      allowDnd,
      autoSaveEnabled,
      autoSaveInterval,
      stackThreshold,
    } = get();

    const historyMaxSteps = useHistoryStore.getState().maxSteps;

    // Build spriteAssets map from current projectData
    const spriteAssets: Record<string, boolean> = {};
    if (projectData?.Objects) {
      for (const obj of projectData.Objects) {
        if (obj.isSprite) spriteAssets[obj.Name] = true;
      }
    }

    try {
      await Promise.all([
        invoke("save_text_file", {
          path: `${base}/.rtoolkit/canvas.json`,
          content: JSON.stringify(
            {
              spriteAssets,
              screens: { iconFrames, iconFrameCounts, iconOrientations },
              selectedStates,
            },
            null,
            2,
          ),
        }),
        invoke("save_text_file", {
          path: `${base}/.rtoolkit/settings.json`,
          content: JSON.stringify(
            {
              snapToGrid,
              gridSize,
              allowDnd,
              autoSaveEnabled,
              autoSaveInterval,
              stackThreshold,
              historyMaxSteps,
              lastModified: Date.now(),
            },
            null,
            2,
          ),
        }),
      ]);
      set({ hasUnsavedChanges: false });
      toast.success("Workspace saved", { id: "save-workspace" });
    } catch (e) {
      toast.error(`Save failed: ${e}`, { id: "project-save-failed" });
    }
  },

  loadWorkspace: async (baseDir: string) => {
    if (!baseDir) return;
    const base = baseDir.replace(/[\\/]$/, "");

    try {
      const canvasContent = await invoke<string>("load_project", {
        filePath: `${base}/.rtoolkit/canvas.json`,
      });
      const canvas = JSON.parse(canvasContent);
      set({
        iconFrames: canvas.screens?.iconFrames || {},
        iconFrameCounts: canvas.screens?.iconFrameCounts || {},
        iconOrientations: canvas.screens?.iconOrientations || {},
        selectedStates: canvas.selectedStates || {},
      });
    } catch {
      // No canvas.json yet
    }

    let historyMaxSteps = MAX_DEFAULT_STEPS;
    let projectSnapToGrid = false;
    let projectGridSize = 10;
    let projectAllowDnd = true;
    let projectAutoSaveEnabled = true;
    let projectAutoSaveInterval = 10000;
    let projectStackThreshold = 5;

    try {
      const settingsContent = await invoke<string>("load_project", {
        filePath: `${base}/.rtoolkit/settings.json`,
      });
      const settings = JSON.parse(settingsContent);
      historyMaxSteps = settings.historyMaxSteps ?? MAX_DEFAULT_STEPS;
      projectSnapToGrid = settings.snapToGrid ?? false;
      projectGridSize = settings.gridSize ?? 10;
      projectAllowDnd = settings.allowDnd ?? true;
      projectAutoSaveEnabled = settings.autoSaveEnabled ?? true;
      projectAutoSaveInterval = settings.autoSaveInterval ?? 10000;
      projectStackThreshold = settings.stackThreshold ?? 5;
    } catch {
      console.log("No project settings.json, using global store");
    }

    const globalAutoSaveEnabled =
      (await appSettings.get<boolean>("autoSaveEnabled")) ??
      projectAutoSaveEnabled;
    const globalAutoSaveInterval =
      (await appSettings.get<number>("autoSaveInterval")) ??
      projectAutoSaveInterval;

    const finalAutoSaveEnabled =
      projectAutoSaveEnabled !== undefined
        ? projectAutoSaveEnabled
        : globalAutoSaveEnabled;
    const finalAutoSaveInterval =
      projectAutoSaveInterval !== undefined
        ? projectAutoSaveInterval
        : globalAutoSaveInterval;

    set({
      snapToGrid: projectSnapToGrid,
      gridSize: projectGridSize,
      allowDnd: projectAllowDnd,
      autoSaveEnabled: finalAutoSaveEnabled,
      autoSaveInterval: finalAutoSaveInterval,
      stackThreshold: projectStackThreshold,
      hasUnsavedChanges: false,
    });

    await useHistoryStore.getState().initialize(baseDir, historyMaxSteps);
  },
});
