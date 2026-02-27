import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { useProjectStore } from "./useProjectStore";
import { useCanvasStore } from "./useCanvasStore";

export interface HistoryEntry {
  id: string;
  description: string;
  timestamp: number;
  projectData: any;
  canvasData: {
    iconFrames: Record<number, Record<string, number>>;
    iconFrameCounts: Record<number, Record<string, number>>;
    iconOrientations: Record<number, Record<string, "horizontal" | "vertical">>;
    selectedStates: Record<string, number | null>;
  };
}

interface HistoryStore {
  entries: HistoryEntry[];
  currentIndex: number;
  maxSteps: number;
  isInitialized: boolean;

  initialize: (baseDir: string | null, historyMaxSteps?: number) => Promise<void>;
  closeProject: () => void;
  push: (description: string) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  setMaxSteps: (steps: number) => Promise<void>;
  canUndo: () => boolean;
  canRedo: () => boolean;
  jumpTo: (index: number) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const MAX_DEFAULT_STEPS = 50;

const saveSettings = async (baseDir: string, maxSteps: number) => {
  const base = baseDir.replace(/[\\/]$/, "");
  const settingsPath = `${base}/.rtoolkit/settings.json`;

  const canvasStore = useCanvasStore.getState();

  const settingsToSave = {
    historyMaxSteps: maxSteps,
    snapToGrid: canvasStore.snapToGrid,
    gridSize: canvasStore.gridSize,
    allowDnd: canvasStore.allowDnd,
    autoSaveEnabled: canvasStore.autoSaveEnabled,
    autoSaveInterval: canvasStore.autoSaveInterval,
  };

  console.log("saveSettings:", { baseDir, base, settingsPath, settingsToSave });

  try {
    const content = await invoke<string>("load_project", { filePath: settingsPath });
    const settings = JSON.parse(content);
    const updatedSettings = { ...settings, ...settingsToSave };
    await invoke("save_text_file", {
      path: settingsPath,
      content: JSON.stringify(updatedSettings, null, 2),
    });
    console.log("Settings updated successfully");
  } catch (e) {
    console.error("Failed to update settings:", e);
    try {
      await invoke("save_text_file", {
        path: settingsPath,
        content: JSON.stringify(settingsToSave, null, 2),
      });
      console.log("Settings created successfully");
    } catch (e2) {
      console.error("Failed to create settings:", e2);
    }
  }
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  entries: [],
  currentIndex: -1,
  maxSteps: MAX_DEFAULT_STEPS,
  isInitialized: false,

  initialize: async (baseDir: string | null, historyMaxSteps?: number) => {
    if (!baseDir) {
      set({ entries: [], currentIndex: -1, maxSteps: MAX_DEFAULT_STEPS, isInitialized: true });
      return;
    }

    const maxSteps = historyMaxSteps ?? MAX_DEFAULT_STEPS;
    console.log("History init:", { baseDir, historyMaxSteps, maxSteps });
    set({ entries: [], currentIndex: -1, maxSteps, isInitialized: true });
  },

  closeProject: () => {
    set({ entries: [], currentIndex: -1 });
  },

  push: (description: string) => {
    const { currentIndex, entries, maxSteps } = get();
    const projectData = useProjectStore.getState().projectData;
    const canvasStore = useCanvasStore.getState();

    if (!projectData) return;

    const canvasData = {
      iconFrames: canvasStore.iconFrames,
      iconFrameCounts: canvasStore.iconFrameCounts,
      iconOrientations: canvasStore.iconOrientations,
      selectedStates: canvasStore.selectedStates,
    };

    const newEntry: HistoryEntry = {
      id: generateId(),
      description,
      timestamp: Date.now(),
      projectData: JSON.parse(JSON.stringify(projectData)),
      canvasData: JSON.parse(JSON.stringify(canvasData)),
    };

    const newEntries = entries.slice(0, currentIndex + 1);
    newEntries.push(newEntry);

    while (newEntries.length > maxSteps) {
      newEntries.shift();
    }

    set({
      entries: newEntries,
      currentIndex: newEntries.length - 1,
    });
  },

  undo: () => {
    const { currentIndex, entries } = get();
    if (currentIndex <= 0) return;

    const newIndex = currentIndex - 1;
    const entry = entries[newIndex];

    useProjectStore.setState({ projectData: entry.projectData });
    useCanvasStore.setState({
      iconFrames: entry.canvasData.iconFrames,
      iconFrameCounts: entry.canvasData.iconFrameCounts,
      iconOrientations: entry.canvasData.iconOrientations,
      selectedStates: entry.canvasData.selectedStates,
    });

    set({ currentIndex: newIndex });
  },

  redo: () => {
    const { currentIndex, entries } = get();
    if (currentIndex >= entries.length - 1) return;

    const newIndex = currentIndex + 1;
    const entry = entries[newIndex];

    useProjectStore.setState({ projectData: entry.projectData });
    useCanvasStore.setState({
      iconFrames: entry.canvasData.iconFrames,
      iconFrameCounts: entry.canvasData.iconFrameCounts,
      iconOrientations: entry.canvasData.iconOrientations,
      selectedStates: entry.canvasData.selectedStates,
    });

    set({ currentIndex: newIndex });
  },

  clear: () => {
    set({ entries: [], currentIndex: -1 });
  },

  setMaxSteps: async (steps: number) => {
    const clamped = Math.max(1, Math.min(100, steps));
    const baseDir = useProjectStore.getState().baseDir;
    console.log("setMaxSteps:", { steps, clamped, baseDir });
    set({ maxSteps: clamped });

    if (baseDir) {
      await saveSettings(baseDir, clamped);
      console.log("Settings saved!");
    } else {
      console.log("No baseDir, settings not saved!");
    }
  },

  canUndo: () => get().currentIndex > 0,

  canRedo: () => get().currentIndex < get().entries.length - 1,

  jumpTo: (index: number) => {
    const { entries } = get();
    if (index < 0 || index >= entries.length) return;

    const entry = entries[index];
    useProjectStore.setState({ projectData: entry.projectData });
    useCanvasStore.setState({
      iconFrames: entry.canvasData.iconFrames,
      iconFrameCounts: entry.canvasData.iconFrameCounts,
      iconOrientations: entry.canvasData.iconOrientations,
      selectedStates: entry.canvasData.selectedStates,
    });

    set({ currentIndex: index });
  },
}));
