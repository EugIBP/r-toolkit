import { create } from "zustand";
import { createProjectSlice } from "./projectStore/projectSlice";
import { createObjectsSlice } from "./projectStore/objectsSlice";
import { createIconsSlice } from "./projectStore/iconsSlice";
import type { ProjectStore } from "./projectStore/types";

export { type ProjectStore };

export const useProjectStore = create<ProjectStore>()((...a) => ({
  ...createProjectSlice(...a),
  ...createObjectsSlice(...a),
  ...createIconsSlice(...a),
}));
