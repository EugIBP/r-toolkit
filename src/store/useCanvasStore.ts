import { create } from "zustand";
import { createUISlice } from "./canvasStore/uiSlice";
import { createSelectionSlice } from "./canvasStore/selectionSlice";
import { createSettingsSlice } from "./canvasStore/settingsSlice";
import { createIconDataSlice } from "./canvasStore/iconDataSlice";
import { createWorkspaceSlice } from "./canvasStore/workspaceSlice";
import type { CanvasStore } from "./canvasStore/types";

export const useCanvasStore = create<CanvasStore>()((...a) => ({
  ...createUISlice(...a),
  ...createSelectionSlice(...a),
  ...createSettingsSlice(...a),
  ...createIconDataSlice(...a),
  ...createWorkspaceSlice(...a),
}));
