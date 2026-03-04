// src/store/canvasStore/settingsSlice.ts
import type { StateCreator } from "zustand";
import type { CanvasStore } from "./types";
import { appSettings } from "./workspaceSlice"; // Переиспользуем LazyStore

export const createSettingsSlice: StateCreator<
  CanvasStore,
  [],
  [],
  Pick<
    CanvasStore,
    | "stackThreshold"
    | "snapToGrid"
    | "gridSize"
    | "allowDnd"
    | "assetScope"
    | "autoSaveEnabled"
    | "autoSaveInterval"
    | "setStackThreshold"
    | "setSnapToGrid"
    | "setGridSize"
    | "setAllowDnd"
    | "setAssetScope"
    | "setAutoSaveEnabled"
    | "setAutoSaveInterval"
  >
> = (set) => ({
  stackThreshold: 5,
  snapToGrid: false,
  gridSize: 10,
  allowDnd: true,
  assetScope: "global",
  autoSaveEnabled: true,
  autoSaveInterval: 10000, // 10 seconds default

  setStackThreshold: (value) =>
    set({
      stackThreshold: Math.max(1, Math.min(100, value)),
      hasUnsavedChanges: true,
    }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap, hasUnsavedChanges: true }),
  setGridSize: (size) => set({ gridSize: size, hasUnsavedChanges: true }),
  setAllowDnd: (val) => set({ allowDnd: val, hasUnsavedChanges: true }),
  setAssetScope: (scope) => set({ assetScope: scope }),

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
});
