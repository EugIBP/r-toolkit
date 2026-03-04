// src/store/canvasStore/uiSlice.ts
import type { StateCreator } from "zustand";
import type { CanvasStore } from "./types";

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
    | "setZoom"
    | "setSearchQuery"
    | "setActiveTab"
    | "setActiveScreenIdx"
    | "setAssetFilter"
    | "setCanvasMode"
    | "setShowScreenSettings"
    | "setScreenListMode"
    | "setPreviewBgPath"
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

  setZoom: (value) => set({ zoom: value }),
  setSearchQuery: (val) => set({ searchQuery: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveScreenIdx: (idx) => set({ activeScreenIdx: idx }),
  setAssetFilter: (filter) => set({ assetFilter: filter }),
  setCanvasMode: (mode) => set({ canvasMode: mode }),
  setShowScreenSettings: (show) => set({ showScreenSettings: show }),
  setScreenListMode: (mode) => set({ screenListMode: mode }),
  setPreviewBgPath: (path) => set({ previewBgPath: path }),
});
