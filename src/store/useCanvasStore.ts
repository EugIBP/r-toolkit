import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { LazyStore } from "@tauri-apps/plugin-store";
import { useProjectStore } from "./useProjectStore";
import { useHistoryStore } from "./useHistory";
import { toast } from "sonner";

const MAX_DEFAULT_STEPS = 50;

const appSettings = new LazyStore("settings.json");

interface CanvasStore {
  selectedIconIndex: number | null;
  selectedColorKey: string | null;
  selectedAssetPath: string | null;
  hoveredAssetName: string | null;
  zoom: number;
  searchQuery: string;
  activeTab: string;
  activeScreenIdx: number;
  assetFilter: "all" | "bg" | "icons" | "sprites" | "stacked";
  // New structure: { screenIdx: { assetName: value } }
  iconFrames: Record<number, Record<string, number>>;
  iconFrameCounts: Record<number, Record<string, number>>;
  iconOrientations: Record<number, Record<string, "horizontal" | "vertical">>;
  canvasMode: "view" | "edit";
  snapToGrid: boolean;
  gridSize: number;
  allowDnd: boolean;
  assetScope: "global" | "local";
  // Key format: "screenIdx_assetName" → stateIdx
  selectedStates: Record<string, number | null>;
  showScreenSettings: boolean;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  expandedStackIndices: number[] | null;
  // assetPath → { width, height } — натуральный размер загруженного изображения
  iconNaturalSizes: Record<string, { width: number; height: number }>;
  screenListMode: "list" | "detail";
  previewBgPath: string | null;

  setSelectedState: (
    screenIdx: number,
    assetName: string,
    stateIdx: number | null,
  ) => void;
  setActiveScreenIdx: (idx: number) => void;
  setCanvasMode: (mode: "view" | "edit") => void;
  setShowScreenSettings: (show: boolean) => void;
  setSelectedIcon: (index: number | null) => void;
  setSelectedColorKey: (key: string | null) => void;
  setSelectedAssetPath: (path: string | null) => void;
  setHoveredAssetName: (name: string | null) => void;
  setZoom: (value: number) => void;
  setSearchQuery: (val: string) => void;
  setActiveTab: (tab: string) => void;
  setAssetFilter: (filter: "all" | "bg" | "icons" | "sprites" | "stacked") => void;
  setIconFrame: (screenIdx: number, assetName: string, frame: number) => void;
  setIconFrameCount: (screenIdx: number, assetName: string, count: number) => void;
  setIconOrientation: (
    screenIdx: number,
    assetName: string,
    orientation: "horizontal" | "vertical",
  ) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setAllowDnd: (val: boolean) => void;
  setAssetScope: (scope: "global" | "local") => void;
  setScreenListMode: (mode: "list" | "detail") => void;
  setPreviewBgPath: (path: string | null) => void;
  setHasUnsavedChanges: (val: boolean) => void;
  setAutoSaveEnabled: (val: boolean) => Promise<void>;
  setAutoSaveInterval: (val: number) => Promise<void>;
  setExpandedStackIndices: (indices: number[] | null) => void;
  setIconNaturalSize: (assetPath: string, size: { width: number; height: number }) => void;
  resetCanvas: () => void;
  saveWorkspace: () => Promise<void>;
  loadWorkspace: (baseDir: string) => Promise<void>;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  selectedIconIndex: null,
  selectedColorKey: null,
  selectedAssetPath: null,
  hoveredAssetName: null,
  zoom: 0.85,
  searchQuery: "",
  activeTab: "screens",
  activeScreenIdx: 0,
  assetFilter: "all",
  iconFrames: {},
  iconFrameCounts: {},
  iconOrientations: {},
  canvasMode: "view",
  snapToGrid: false,
  gridSize: 10,
  allowDnd: true,
  assetScope: "global",
  selectedStates: {},
  showScreenSettings: false,
  hasUnsavedChanges: false,
  autoSaveEnabled: true,
  autoSaveInterval: 10000, // 10 seconds default
  expandedStackIndices: null,
  iconNaturalSizes: {},
  screenListMode: "list",
  previewBgPath: null,

  setIconNaturalSize: (assetPath, size) =>
    set((state) => ({
      iconNaturalSizes: { ...state.iconNaturalSizes, [assetPath]: size },
    })),

  setAllowDnd: (val: boolean) => set({ allowDnd: val, hasUnsavedChanges: true }),
  setAssetScope: (scope: "global" | "local") => set({ assetScope: scope }),
  setScreenListMode: (mode) => set({ screenListMode: mode }),
  setPreviewBgPath: (path) => set({ previewBgPath: path }),
  setShowScreenSettings: (show: boolean) => set({ showScreenSettings: show }),
  setActiveScreenIdx: (idx) => set({ activeScreenIdx: idx }),
  setCanvasMode: (mode) => set({ canvasMode: mode }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap, hasUnsavedChanges: true }),
  setGridSize: (size) => set({ gridSize: size, hasUnsavedChanges: true }),

  setSelectedState: (screenIdx, assetName, stateIdx) =>
    set((state) => ({
      selectedStates: {
        ...state.selectedStates,
        [`${screenIdx}_${assetName}`]: stateIdx,
      },
      hasUnsavedChanges: true,
    })),

  setSelectedIcon: (index) => {
    set((state) => ({
      selectedIconIndex: index,
      selectedColorKey: null,
      selectedAssetPath: null,
      // Only switch to objects tab if we're not in the screens tab (detail mode)
      activeTab: index !== null && state.activeTab !== "screens" ? "objects" : state.activeTab,
      searchQuery: index !== null && state.activeTab !== "screens" ? "" : state.searchQuery,
    }));
  },

  setSelectedAssetPath: (path) =>
    set({
      selectedAssetPath: path,
      selectedIconIndex: null,
      selectedColorKey: null,
    }),

  setSelectedColorKey: (key) =>
    set({
      selectedColorKey: key,
      selectedIconIndex: null,
      selectedAssetPath: null,
    }),

  setHoveredAssetName: (name) => set({ hoveredAssetName: name }),
  setZoom: (value) => set({ zoom: value }),
  setSearchQuery: (val) => set({ searchQuery: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAssetFilter: (filter) => set({ assetFilter: filter }),
  setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),
  setExpandedStackIndices: (indices: number[] | null) => 
    set({ expandedStackIndices: indices }),
  setAutoSaveEnabled: async (val) => {
    set({ autoSaveEnabled: val });
    await appSettings.set("autoSaveEnabled", val);
    await appSettings.save();
  },
  setAutoSaveInterval: async (val) => {
    const clamped = Math.max(1000, Math.min(60000, val));
    set({ autoSaveInterval: clamped });
    await appSettings.set("autoSaveInterval", clamped);
    await appSettings.save();
  },

  setIconFrame: (screenIdx, assetName, frame) =>
    set((state) => ({
      iconFrames: {
        ...state.iconFrames,
        [screenIdx]: {
          ...(state.iconFrames[screenIdx] || {}),
          [assetName]: frame,
        },
      },
      hasUnsavedChanges: true,
    })),

  setIconFrameCount: (screenIdx, assetName, count) =>
    set((state) => ({
      iconFrameCounts: {
        ...state.iconFrameCounts,
        [screenIdx]: {
          ...(state.iconFrameCounts[screenIdx] || {}),
          [assetName]: count,
        },
      },
      hasUnsavedChanges: true,
    })),

  setIconOrientation: (screenIdx, assetName, orientation) =>
    set((state) => ({
      iconOrientations: {
        ...state.iconOrientations,
        [screenIdx]: {
          ...(state.iconOrientations[screenIdx] || {}),
          [assetName]: orientation,
        },
      },
      hasUnsavedChanges: true,
    })),

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
    });
  },

  saveWorkspace: async () => {
    const { baseDir, projectData } = useProjectStore.getState();
    if (!baseDir) return;
    const base = baseDir.replace(/[\\/]$/, "");

    const { iconFrames, iconFrameCounts, iconOrientations, selectedStates, snapToGrid, gridSize, allowDnd, autoSaveEnabled, autoSaveInterval } = get();
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
        // canvas.json — per-project icon/sprite data
        invoke("save_text_file", {
          path: `${base}/.rtoolkit/canvas.json`,
          content: JSON.stringify(
            { spriteAssets, screens: { iconFrames, iconFrameCounts, iconOrientations }, selectedStates },
            null, 2,
          ),
        }),
        // settings.json — canvas flags and app preferences
        invoke("save_text_file", {
          path: `${base}/.rtoolkit/settings.json`,
          content: JSON.stringify(
            { snapToGrid, gridSize, allowDnd, autoSaveEnabled, autoSaveInterval, historyMaxSteps, lastModified: Date.now() },
            null, 2,
          ),
        }),
      ]);
      set({ hasUnsavedChanges: false });
      toast.success("Workspace saved");
    } catch (e) {
      toast.error(`Save failed: ${e}`);
    }
  },

  loadWorkspace: async (baseDir: string) => {
    if (!baseDir) return;
    const base = baseDir.replace(/[\\/]$/, "");

    // Load canvas.json — icon/sprite data
    try {
      const canvasContent = await invoke<string>("load_project", { filePath: `${base}/.rtoolkit/canvas.json` });
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

    // Load settings.json from project folder first
    let historyMaxSteps = MAX_DEFAULT_STEPS;
    let projectSnapToGrid = false;
    let projectGridSize = 10;
    let projectAllowDnd = true;
    let projectAutoSaveEnabled = true;
    let projectAutoSaveInterval = 10000;

    try {
      const settingsContent = await invoke<string>("load_project", { filePath: `${base}/.rtoolkit/settings.json` });
      const settings = JSON.parse(settingsContent);
      historyMaxSteps = settings.historyMaxSteps ?? MAX_DEFAULT_STEPS;
      projectSnapToGrid = settings.snapToGrid ?? false;
      projectGridSize = settings.gridSize ?? 10;
      projectAllowDnd = settings.allowDnd ?? true;
      projectAutoSaveEnabled = settings.autoSaveEnabled ?? true;
      projectAutoSaveInterval = settings.autoSaveInterval ?? 10000;
      console.log("Loaded settings from project:", settings);
    } catch {
      // No settings.json in project folder, use global Tauri store as fallback
      console.log("No project settings.json, using global store");
    }

    // Load global app settings from tauri store (fallback)
    const globalAutoSaveEnabled = await appSettings.get<boolean>("autoSaveEnabled") ?? projectAutoSaveEnabled;
    const globalAutoSaveInterval = await appSettings.get<number>("autoSaveInterval") ?? projectAutoSaveInterval;

    // Use project settings if they exist, otherwise fall back to global
    const finalAutoSaveEnabled = projectAutoSaveEnabled !== undefined 
      ? projectAutoSaveEnabled 
      : globalAutoSaveEnabled;
    const finalAutoSaveInterval = projectAutoSaveInterval !== undefined 
      ? projectAutoSaveInterval 
      : globalAutoSaveInterval;

    set({
      snapToGrid: projectSnapToGrid,
      gridSize: projectGridSize,
      allowDnd: projectAllowDnd,
      autoSaveEnabled: finalAutoSaveEnabled,
      autoSaveInterval: finalAutoSaveInterval,
    });

    set({ hasUnsavedChanges: false });

    await useHistoryStore.getState().initialize(baseDir, historyMaxSteps);
  },
}));
