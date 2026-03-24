import { toast } from "sonner";
import { useCanvasStore } from "../useCanvasStore";
import { useHistoryStore } from "../useHistory";
import type { ProjectStore } from "./types";
import type { StateCreator } from "zustand";

export const createObjectsSlice: StateCreator<
  ProjectStore,
  [],
  [],
  Pick<
    ProjectStore,
    | "updateProjectObject"
    | "deleteProjectObject"
    | "addProjectObject"
    | "registerAllAssets"
    | "registerAndAddInstances"
    | "convertAssetType"
    | "isNameUnique"
    | "getAssetInstances"
    | "deleteProjectObjects"
    | "registerAsset"
    | "registerAssets"
    | "getUniqueInstanceName"
  >
> = (set, get) => ({
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
      const newObjects = state.projectData.Objects.filter(
        (obj: any) => obj.Name !== name,
      );
      const newScreens = state.projectData.Screens.map((screen: any) => ({
        ...screen,
        Icons: screen.Icons.filter((icon: any) => icon.Name !== name),
        Background: screen.Background === name ? "" : screen.Background,
      }));
      return {
        projectData: {
          ...state.projectData,
          Objects: newObjects,
          Screens: newScreens,
        },
      };
    });
    useHistoryStore.getState().push(`Deleted asset "${name}"`);
  },

  deleteProjectObjects: (names: string[]) => {
    set((state) => {
      if (!state.projectData) return state;
      const nameSet = new Set(names);

      const newObjects = state.projectData.Objects.filter(
        (obj: any) => !nameSet.has(obj.Name),
      );

      const newScreens = state.projectData.Screens.map((screen: any) => ({
        ...screen,
        Icons: screen.Icons.filter((icon: any) => !nameSet.has(icon.Name)),
        Background: nameSet.has(screen.Background) ? "" : screen.Background,
      }));

      return {
        projectData: {
          ...state.projectData,
          Objects: newObjects,
          Screens: newScreens,
        },
      };
    });
    useHistoryStore.getState().push(`Deleted ${names.length} assets`);
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
      const existingPaths = new Set(
        state.projectData.Objects.map((o: any) => o.Path),
      );
      const newObjects = [...state.projectData.Objects];

      console.log("[registerAllAssets] scannedFiles:", state.scannedFiles);

      state.scannedFiles.forEach((file) => {
        if (!existingPaths.has(file.path)) {
          const name =
            file.path
              .split(/[\\/]/)
              .pop()
              ?.replace(/\.[^/.]+$/, "") || file.path;
          const type =
            file.asset_type === "bin"
              ? "Bin"
              : file.asset_type === "pal"
                ? "Pal"
                : "Ico";
          console.log(
            "[registerAllAssets] file:",
            file.path,
            "assetType:",
            file.asset_type,
            "-> Type:",
            type,
          );
          newObjects.push({ Name: name, Path: file.path, Type: type });
        }
      });

      return {
        projectData: { ...state.projectData, Objects: newObjects },
        scannedFiles: [],
      };
    });
  },

  registerAsset: (path: string) => {
    set((state) => {
      if (!state.projectData) return state;
      const file = state.scannedFiles.find((f) => f.path === path);
      if (!file) return state;

      const name =
        file.path
          .split(/[\\/]/)
          .pop()
          ?.replace(/\.[^/.]+$/, "") || file.path;
      const type =
        file.asset_type === "bin"
          ? "Bin"
          : file.asset_type === "pal"
            ? "Pal"
            : "Ico";

      const newObjects = [
        ...state.projectData.Objects,
        { Name: name, Path: file.path, Type: type as "Bin" | "Pal" | "Ico" },
      ];
      const newScanned = state.scannedFiles.filter((f) => f.path !== path);

      return {
        projectData: { ...state.projectData, Objects: newObjects },
        scannedFiles: newScanned,
      };
    });
    toast.success("Asset registered successfully");
  },

  registerAssets: (paths: string[]) => {
    set((state) => {
      if (!state.projectData || !state.scannedFiles.length) return state;
      const pathsSet = new Set(paths);
      const newObjects = [...state.projectData.Objects];

      const filesToRegister = state.scannedFiles.filter((f) =>
        pathsSet.has(f.path),
      );

      filesToRegister.forEach((file) => {
        const name =
          file.path
            .split(/[\\/]/)
            .pop()
            ?.replace(/\.[^/.]+$/, "") || file.path;
        const type =
          file.asset_type === "bin"
            ? "Bin"
            : file.asset_type === "pal"
              ? "Pal"
              : "Ico";
        newObjects.push({ Name: name, Path: file.path, Type: type });
      });

      const newScanned = state.scannedFiles.filter(
        (f) => !pathsSet.has(f.path),
      );

      return {
        projectData: { ...state.projectData, Objects: newObjects },
        scannedFiles: newScanned,
      };
    });
    toast.success(`${paths.length} asset(s) registered`);
  },

  registerAndAddInstances: async (screenIdx: number) => {
    const { scannedFiles, projectData } = get();
    if (!projectData || !scannedFiles.length) return;

    const newInstances: Array<{ name: string; path: string }> = [];
    const newObjects = [...projectData.Objects];
    const existingPaths = new Set(projectData.Objects.map((o: any) => o.Path));

    scannedFiles.forEach((file) => {
      if (!existingPaths.has(file.path)) {
        const name =
          file.path
            .split(/[\\/]/)
            .pop()
            ?.replace(/\.[^/.]+$/, "") || file.path;
        const isBackground = file.asset_type === "bin";
        const type = isBackground
          ? "Bin"
          : file.asset_type === "pal"
            ? "Pal"
            : "Ico";

        newObjects.push({
          Name: name,
          Path: file.path,
          Type: type,
        });

        if (!isBackground) {
          newInstances.push({ name, path: file.path });
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
        projectData: {
          ...state.projectData,
          Screens: screens,
          Objects: newObjects,
        },
        scannedFiles: [],
      };
    });

    toast.success(
      `Added ${newInstances.length} instance${newInstances.length !== 1 ? "s" : ""} to screen`,
      { id: "instances-added" },
    );
  },

  convertAssetType: async (
    assetName: string,
    targetType: "icon" | "sprite" | "pal",
  ) => {
    const { projectData } = get();
    if (!projectData) return false;

    const asset = projectData.Objects.find((o: any) => o.Name === assetName);
    if (!asset) return false;

    const isSprite = targetType === "sprite";
    const isPal = targetType === "pal";

    set((state) => {
      if (!state.projectData) return state;
      const newObjects = state.projectData.Objects.map((obj: any) =>
        obj.Name === assetName
          ? { ...obj, isSprite, Type: isPal ? "Pal" : "Ico" }
          : obj,
      );
      return { projectData: { ...state.projectData, Objects: newObjects } };
    });

    useCanvasStore.getState().setHasUnsavedChanges(true);

    toast.success(`Converted to ${targetType}`, { id: "asset-converted" });
    useHistoryStore
      .getState()
      .push(`Converted "${assetName}" to ${targetType}`);
    return true;
  },

  isNameUnique: (name: string, targetPath?: string) => {
    const { projectData } = get();
    if (!projectData) return true;

    // 1. Проверяем, занято ли имя на каком-либо экране (как иконка или фон)
    const usedOnScreen = projectData.Screens.some(
      (s: any) =>
        s.Background === name || s.Icons?.some((i: any) => i.Name === name),
    );
    if (usedOnScreen) return false;

    // 2. Проверяем, не занято ли это имя другим файлом-исходником
    if (targetPath) {
      const existingObj = projectData.Objects.find((o: any) => o.Name === name);
      if (existingObj && existingObj.Path !== targetPath) {
        return false; // Имя занято другой картинкой!
      }
    }

    return true;
  },

  getUniqueInstanceName: (baseName: string, targetPath: string) => {
    let uniqueName = baseName;
    let counter = 1;
    // Умно инкрементируем, пока не найдем свободное
    while (!get().isNameUnique(uniqueName, targetPath)) {
      uniqueName = `${baseName}_${counter}`;
      counter++;
    }
    return uniqueName;
  },

  getAssetInstances: (assetName: string) => {
    const { projectData } = get();
    if (!projectData) return [];

    const instances: Array<{ screenIdx: number; iconIdx: number; icon: any }> =
      [];
    projectData.Screens.forEach((screen: any, screenIdx: number) => {
      screen.Icons?.forEach((icon: any, iconIdx: number) => {
        if (icon.Name === assetName)
          instances.push({ screenIdx, iconIdx, icon });
      });
    });
    return instances;
  },
});
