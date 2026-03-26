// src/store/canvasStore/uiSlice.ts
import type { StateCreator } from "zustand";
import type { CanvasStore } from "./types";
import type { LayoutGrid } from "@/types/project";

export const createUISlice: StateCreator<
  CanvasStore,
  [],
  [],
  Pick<
    CanvasStore,
    | "zoom"
    | "searchQuery"
    | "activeTab"
    | "activeScreenIdx"
    | "assetFilter"
    | "canvasMode"
    | "showScreenSettings"
    | "screenListMode"
    | "previewBgPath"
    | "activeGuides"
    | "screenLayouts"
    | "setZoom"
    | "resetZoom"
    | "setSearchQuery"
    | "setActiveTab"
    | "setActiveScreenIdx"
    | "setAssetFilter"
    | "setCanvasMode"
    | "setShowScreenSettings"
    | "setScreenListMode"
    | "setPreviewBgPath"
    | "setActiveGuides"
    | "addLayout"
    | "updateLayout"
    | "deleteLayout"
    | "duplicateLayout"
    | "setScreenLayouts"
  >
> = (set) => ({
  zoom: 0.85,
  searchQuery: "",
  activeTab: "screens",
  activeScreenIdx: 0,
  assetFilter: "all",
  canvasMode: "view",
  showScreenSettings: false,
  screenListMode: "list",
  previewBgPath: null,
  activeGuides: [],
  screenLayouts: {},

  setZoom: (value) => set({ zoom: value }),
  resetZoom: () => set({ zoom: 0.85 }),
  setSearchQuery: (val) => set({ searchQuery: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveScreenIdx: (idx) => set({ activeScreenIdx: idx }),
  setAssetFilter: (filter) => set({ assetFilter: filter }),
  setCanvasMode: (mode) => set({ canvasMode: mode }),
  setShowScreenSettings: (show) => set({ showScreenSettings: show }),
  setScreenListMode: (mode) => set({ screenListMode: mode }),
  setPreviewBgPath: (path) => set({ previewBgPath: path }),
  setActiveGuides: (guides) => set({ activeGuides: guides }),

  addLayout: (screenIdx) => {
    const newId = Math.random().toString(36).substring(2, 9);
    set((state) => {
      const current = state.screenLayouts[screenIdx] || [];
      const newLayout: LayoutGrid = {
        id: newId,
        name: `Grid ${current.length + 1}`,
        color: "#3b82f6",
        visible: true,
        type: "columns",
        count: 5,
        rows: 5, // Добавлено для Mesh
        offset: 0,
        offsetY: 0, // Добавлено для Mesh
        size: 80,
        gaps: "10",
      };
      return {
        screenLayouts: {
          ...state.screenLayouts,
          [screenIdx]: [...current, newLayout],
        },
        hasUnsavedChanges: true,
      };
    });
    return newId;
  },

  updateLayout: (screenIdx, layoutId, updates) =>
    set((state) => ({
      screenLayouts: {
        ...state.screenLayouts,
        [screenIdx]: (state.screenLayouts[screenIdx] || []).map((l) =>
          l.id === layoutId ? { ...l, ...updates } : l,
        ),
      },
      hasUnsavedChanges: true,
    })),

  deleteLayout: (screenIdx, layoutId) =>
    set((state) => ({
      screenLayouts: {
        ...state.screenLayouts,
        [screenIdx]: (state.screenLayouts[screenIdx] || []).filter(
          (l) => l.id !== layoutId,
        ),
      },
      hasUnsavedChanges: true,
    })),

  duplicateLayout: (screenIdx, layoutId) => {
    const newId = Math.random().toString(36).substring(2, 9);
    let success = false;
    set((state) => {
      const current = state.screenLayouts[screenIdx] || [];
      const target = current.find((l) => l.id === layoutId);
      if (!target) return state;

      success = true;
      return {
        screenLayouts: {
          ...state.screenLayouts,
          [screenIdx]: [
            ...current,
            { ...target, id: newId, name: `${target.name} Copy` },
          ],
        },
        hasUnsavedChanges: true,
      };
    });
    return success ? newId : undefined;
  },

  setScreenLayouts: (screenIdx, layouts) =>
    set((state) => ({
      screenLayouts: { ...state.screenLayouts, [screenIdx]: layouts },
      hasUnsavedChanges: true,
    })),
});
