import { toast } from "sonner";
import { useCanvasStore } from "../useCanvasStore";
import { useHistoryStore } from "../useHistory";
import type { ProjectStore } from "./types";
import type { StateCreator } from "zustand";

export const createObjectsSlice: StateCreator<ProjectStore, [], [], Pick<ProjectStore,
  "updateProjectObject" | "deleteProjectObject" | "addProjectObject" |
  "registerAllAssets" | "registerAndAddInstances" | "convertAssetType" |
  "isNameUnique" | "getAssetInstances"
>> = (set, get) => ({
  updateProjectObject: (oldName, updates) => {
    set((state) => {
      if (!state.projectData) return state;
      const newObjects = state.projectData.Objects.map((obj: any) =>
        obj.Name === oldName ? { ...obj, ...updates } : obj,
      );
      return { projectData: { ...state.projectData, Objects: newObjects } };
    });
  },

  deleteProjectObject: (name) => {
    set((state) => {
      if (!state.projectData) return state;
      const newObjects = state.projectData.Objects.filter((obj: any) => obj.Name !== name);
      const newScreens = state.projectData.Screens.map((screen: any) => ({
        ...screen,
        Icons: screen.Icons.filter((icon: any) => icon.Name !== name),
        Background: screen.Background === name ? "" : screen.Background,
      }));
      return { projectData: { ...state.projectData, Objects: newObjects, Screens: newScreens } };
    });
    useHistoryStore.getState().push(`Deleted asset "${name}"`);
  },

  addProjectObject: (newObj) => {
    set((state) => {
      if (!state.projectData) return state;
      return {
        projectData: {
          ...state.projectData,
          Objects: [...state.projectData.Objects, newObj],
        },
      };
    });
  },

  registerAllAssets: () => {
    set((state) => {
      if (!state.projectData || !state.scannedFiles.length) return state;
      const existingPaths = new Set(state.projectData.Objects.map((o: any) => o.Path));
      const newObjects = [...state.projectData.Objects];

      state.scannedFiles.forEach((path) => {
        if (!existingPaths.has(path)) {
          const name = path.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, "") || path;
          const isBackground = path.toLowerCase().includes("backgrounds");
          newObjects.push({ Name: name, Path: path, Type: isBackground ? "Bin" : "Ico" });
        }
      });

      return { projectData: { ...state.projectData, Objects: newObjects }, scannedFiles: [] };
    });
  },

  registerAndAddInstances: async (screenIdx: number) => {
    const { scannedFiles, projectData } = get();
    if (!projectData || !scannedFiles.length) return;

    const newInstances: Array<{ name: string; path: string }> = [];
    const newObjects = [...projectData.Objects];
    const existingPaths = new Set(projectData.Objects.map((o: any) => o.Path));

    scannedFiles.forEach((path) => {
      if (!existingPaths.has(path)) {
        const name = path.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, "") || path;
        const pathLower = path.toLowerCase();
        const isBackground = pathLower.includes("backgrounds");

        newObjects.push({
          Name: name,
          Path: path,
          Type: isBackground ? "Bin" : "Ico",
        });

        if (!isBackground) {
          newInstances.push({ name, path });
        }
      }
    });

    set((state) => {
      if (!state.projectData) return state;

      const screens = [...state.projectData.Screens];
      const screen = { ...screens[screenIdx] };
      const existingIcons = screen.Icons || [];

      newInstances.forEach((instance) => {
        existingIcons.push({
          Name: instance.name.toLowerCase(),
          X: 0,
          Y: 0,
          States: [{ Name: "OFF", Color: "PURE_BLANK" }],
        });
      });

      screen.Icons = existingIcons;
      screens[screenIdx] = screen;

      return {
        projectData: { ...state.projectData, Screens: screens, Objects: newObjects },
        scannedFiles: [],
      };
    });

    toast.success(`Added ${newInstances.length} instance${newInstances.length !== 1 ? "s" : ""} to screen`);
  },

  convertAssetType: async (assetName: string, targetType: "icon" | "sprite") => {
    const { projectData } = get();
    if (!projectData) return false;

    const asset = projectData.Objects.find((o: any) => o.Name === assetName);
    if (!asset) return false;

    const isSprite = targetType === "sprite";

    set((state) => {
      if (!state.projectData) return state;
      const newObjects = state.projectData.Objects.map((obj: any) =>
        obj.Name === assetName ? { ...obj, isSprite } : obj,
      );
      return { projectData: { ...state.projectData, Objects: newObjects } };
    });

    // Mark canvas as having unsaved changes so spriteAssets gets saved on next saveWorkspace
    useCanvasStore.getState().setHasUnsavedChanges(true);

    toast.success(`Converted to ${targetType}`);
    useHistoryStore.getState().push(`Converted "${assetName}" to ${targetType}`);
    return true;
  },

  isNameUnique: (name: string) => {
    const { projectData } = get();
    if (!projectData) return true;
    for (const screen of projectData.Screens) {
      if (screen.Icons?.some((icon: any) => icon.Name === name)) return false;
    }
    return true;
  },

  getAssetInstances: (assetName: string) => {
    const { projectData } = get();
    if (!projectData) return [];

    const instances: Array<{ screenIdx: number; iconIdx: number; icon: any }> = [];
    projectData.Screens.forEach((screen: any, screenIdx: number) => {
      screen.Icons?.forEach((icon: any, iconIdx: number) => {
        if (icon.Name === assetName) instances.push({ screenIdx, iconIdx, icon });
      });
    });
    return instances;
  },
});
