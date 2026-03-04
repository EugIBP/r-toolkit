// src/store/canvasStore/selectionSlice.ts
import type { StateCreator } from "zustand";
import type { CanvasStore } from "./types";

export const createSelectionSlice: StateCreator<
  CanvasStore,
  [],
  [],
  Pick<
    CanvasStore,
    | "selectedIconIndex"
    | "selectedColorKey"
    | "selectedAssetPath"
    | "hoveredAssetName"
    | "selectedStates"
    | "expandedStackIndices"
    | "setSelectedIcon"
    | "setSelectedColorKey"
    | "setSelectedAssetPath"
    | "setHoveredAssetName"
    | "setSelectedState"
    | "setExpandedStackIndices"
  >
> = (set) => ({
  selectedIconIndex: null,
  selectedColorKey: null,
  selectedAssetPath: null,
  hoveredAssetName: null,
  selectedStates: {},
  expandedStackIndices: null,

  setSelectedIcon: (index) => {
    set((state) => ({
      selectedIconIndex: index,
      selectedColorKey: null,
      selectedAssetPath: null,
      activeTab:
        index !== null && state.activeTab !== "screens"
          ? "objects"
          : state.activeTab,
      searchQuery:
        index !== null && state.activeTab !== "screens"
          ? ""
          : state.searchQuery,
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

  setSelectedState: (screenIdx, assetName, stateIdx) =>
    set((state) => ({
      selectedStates: {
        ...state.selectedStates,
        [`${screenIdx}_${assetName}`]: stateIdx,
      },
      hasUnsavedChanges: true,
    })),

  setExpandedStackIndices: (indices) => set({ expandedStackIndices: indices }),
});
