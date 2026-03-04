// src/store/canvasStore/iconDataSlice.ts
import type { StateCreator } from "zustand";
import type { CanvasStore } from "./types";

export const createIconDataSlice: StateCreator<
  CanvasStore,
  [],
  [],
  Pick<
    CanvasStore,
    | "iconFrames"
    | "iconFrameCounts"
    | "iconOrientations"
    | "iconNaturalSizes"
    | "setIconFrame"
    | "setIconFrameCount"
    | "setIconOrientation"
    | "setIconNaturalSize"
  >
> = (set) => ({
  iconFrames: {},
  iconFrameCounts: {},
  iconOrientations: {},
  iconNaturalSizes: {},

  setIconNaturalSize: (assetPath, size) =>
    set((state) => ({
      iconNaturalSizes: { ...state.iconNaturalSizes, [assetPath]: size },
    })),

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
});
