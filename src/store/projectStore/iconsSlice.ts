import { toast } from "sonner";
import type { ProjectStore } from "./types";
import type { StateCreator } from "zustand";
import { useHistoryStore } from "../useHistory";

export const createIconsSlice: StateCreator<
  ProjectStore,
  [],
  [],
  Pick<
    ProjectStore,
    | "updateScreen"
    | "addScreen"
    | "duplicateScreen"
    | "deleteScreen"
    | "addColor"
    | "updateColor"
    | "deleteColor"
    | "updateIcon"
    | "addIconState"
    | "updateIconState"
    | "deleteIconState"
    | "addInstance"
    | "renameInstance"
    | "duplicateIcon"
    | "deleteIcon"
    | "deleteColors"
    | "deleteScreens"
    | "duplicateScreens"
    | "deleteIcons"
  >
> = (set, get) => ({
  updateScreen: (screenIdx, updates) => {
    set((state) => {
      if (!state.projectData) return state;
      const newScreens = [...state.projectData.Screens];
      newScreens[screenIdx] = { ...newScreens[screenIdx], ...updates };
      return { projectData: { ...state.projectData, Screens: newScreens } };
    });
    useHistoryStore.getState().push("Updated screen");
  },

  addScreen: () => {
    set((state) => {
      if (!state.projectData) return state;
      const screenNumber = state.projectData.Screens.length + 1;
      return {
        projectData: {
          ...state.projectData,
          Screens: [
            ...state.projectData.Screens,
            { Name: `SCREEN_${screenNumber}`, Background: "", Icons: [] },
          ],
        },
      };
    });
    useHistoryStore.getState().push("Added screen");
  },

  duplicateScreen: (index: number) => {
    set((state) => {
      if (!state.projectData) return state;
      const screenToDuplicate = state.projectData.Screens[index];
      if (!screenToDuplicate) return state;
      const newScreens = [...state.projectData.Screens];
      newScreens.splice(index + 1, 0, {
        ...screenToDuplicate,
        Name: `${screenToDuplicate.Name} Copy`,
      });
      return { projectData: { ...state.projectData, Screens: newScreens } };
    });
    useHistoryStore.getState().push("Duplicated screen");
  },

  deleteScreen: (index: number) => {
    set((state) => {
      if (!state.projectData) return state;
      return {
        projectData: {
          ...state.projectData,
          Screens: state.projectData.Screens.filter(
            (_: any, i: number) => i !== index,
          ),
        },
      };
    });
    useHistoryStore.getState().push("Deleted screen");
  },

  addColor: (name, hex) => {
    set((state) => {
      if (!state.projectData) return state;
      let formatted = hex.toLowerCase();
      if (!formatted.startsWith("#00"))
        formatted = "#00" + formatted.substring(1);
      return {
        projectData: {
          ...state.projectData,
          Colors: {
            ...state.projectData.Colors,
            [name.toUpperCase()]: formatted,
          },
        },
      };
    });
    useHistoryStore.getState().push(`Added color "${name}"`);
  },

  updateColor: (oldName, newName, newHex) => {
    set((state) => {
      if (!state.projectData) return state;
      const colors = { ...state.projectData.Colors };
      let formatted = newHex.toLowerCase();
      if (!formatted.startsWith("#00"))
        formatted = "#00" + formatted.substring(1);
      if (oldName !== newName) delete colors[oldName];
      colors[newName.toUpperCase()] = formatted;
      return { projectData: { ...state.projectData, Colors: colors } };
    });
    useHistoryStore.getState().push(`Updated color "${newName}"`);
  },

  deleteColor: (name) => {
    set((state) => {
      if (!state.projectData) return state;
      const newColors = { ...state.projectData.Colors };
      delete newColors[name];
      return { projectData: { ...state.projectData, Colors: newColors } };
    });
    useHistoryStore.getState().push(`Deleted color "${name}"`);
  },

  updateIcon: (screenIdx, iconIdx, updates) => {
    set((state) => {
      if (!state.projectData) return state;
      const newScreens = [...state.projectData.Screens];
      const newIcons = [...newScreens[screenIdx].Icons];
      newIcons[iconIdx] = { ...newIcons[iconIdx], ...updates };
      newScreens[screenIdx] = { ...newScreens[screenIdx], Icons: newIcons };
      return { projectData: { ...state.projectData, Screens: newScreens } };
    });
  },

  addIconState: (screenIdx, iconIdx) => {
    set((state) => {
      if (!state.projectData) return state;
      const newScreens = [...state.projectData.Screens];
      const icon = newScreens[screenIdx].Icons[iconIdx];
      const newStates = [
        ...(icon.States || []),
        { Name: "NEW_STATE", Color: "WHITE" },
      ];
      newScreens[screenIdx] = {
        ...newScreens[screenIdx],
        Icons: newScreens[screenIdx].Icons.map((ic: any, i: number) =>
          i === iconIdx ? { ...ic, States: newStates } : ic,
        ),
      };
      return { projectData: { ...state.projectData, Screens: newScreens } };
    });
    useHistoryStore.getState().push("Added icon state");
  },

  updateIconState: (screenIdx, iconIdx, stateIdx, updates) => {
    set((state) => {
      if (!state.projectData) return state;
      const newScreens = [...state.projectData.Screens];
      const icon = newScreens[screenIdx].Icons[iconIdx];
      const newStates = (icon.States || []).map((s: any, i: number) =>
        i === stateIdx ? { ...s, ...updates } : s,
      );
      newScreens[screenIdx] = {
        ...newScreens[screenIdx],
        Icons: newScreens[screenIdx].Icons.map((ic: any, i: number) =>
          i === iconIdx ? { ...ic, States: newStates } : ic,
        ),
      };
      return { projectData: { ...state.projectData, Screens: newScreens } };
    });
    useHistoryStore.getState().push("Updated icon state");
  },

  deleteIconState: (screenIdx, iconIdx, stateIdx) => {
    set((state) => {
      if (!state.projectData) return state;
      const newScreens = [...state.projectData.Screens];
      const icon = newScreens[screenIdx].Icons[iconIdx];
      const newStates = (icon.States || []).filter(
        (_: any, i: number) => i !== stateIdx,
      );
      newScreens[screenIdx] = {
        ...newScreens[screenIdx],
        Icons: newScreens[screenIdx].Icons.map((ic: any, i: number) =>
          i === iconIdx ? { ...ic, States: newStates } : ic,
        ),
      };
      return { projectData: { ...state.projectData, Screens: newScreens } };
    });
    useHistoryStore.getState().push("Deleted icon state");
  },

  addInstance: (screenIdx, assetName, options) => {
    const { projectData, isNameUnique, getUniqueInstanceName } = get();
    if (!projectData) return false;

    const asset = projectData.Objects.find(
      (obj: any) => obj.Name === assetName,
    );
    if (!asset) return false;

    let instanceName = options?.name;
    if (!instanceName) {
      instanceName = getUniqueInstanceName(assetName, asset.Path);
    } else if (!isNameUnique(instanceName, asset.Path)) {
      toast.error(`Name "${instanceName}" already exists`, {
        id: "name-exists-error",
      });
      return false;
    }

    const newInstance = {
      Name: instanceName,
      X: options?.x ?? 0,
      Y: options?.y ?? 0,
      States: options?.states ?? [{ Name: "DEFAULT", Color: "PURE_WHITE" }],
    };

    set((state) => {
      if (!state.projectData) return state;
      const screens = [...state.projectData.Screens];
      const screen = { ...screens[screenIdx] };
      screen.Icons = [...(screen.Icons || []), newInstance];
      screens[screenIdx] = screen;

      let newObjects = [...state.projectData.Objects];
      if (!newObjects.some((obj: any) => obj.Name === instanceName)) {
        newObjects.push({
          Name: instanceName,
          Path: asset.Path,
          Type: asset.Type,
        });
      }

      return {
        projectData: {
          ...state.projectData,
          Screens: screens,
          Objects: newObjects,
        },
      };
    });

    toast.success(`Added "${instanceName}"`, { id: "instance-created" });
    useHistoryStore.getState().push(`Added instance "${instanceName}"`);
    return true;
  },

  renameInstance: (screenIdx, iconIdx, newName) => {
    const { projectData } = get();
    if (!projectData) return false;

    const icon = projectData.Screens[screenIdx]?.Icons?.[iconIdx];
    if (!icon) return false;

    const oldName = icon.Name;
    if (oldName === newName) return true;

    const asset = projectData.Objects.find((obj: any) => obj.Name === oldName);

    if (!get().isNameUnique(newName, asset?.Path || "")) {
      toast.error(`Name "${newName}" already exists`, {
        id: "rename-exists-error",
      });
      return false;
    }

    set((state) => {
      if (!state.projectData) return state;
      const screens = [...state.projectData.Screens];
      const screen = { ...screens[screenIdx] };
      screen.Icons = [...(screen.Icons || [])];
      screen.Icons[iconIdx] = { ...screen.Icons[iconIdx], Name: newName };
      screens[screenIdx] = screen;

      let newObjects = [...state.projectData.Objects];
      if (asset && !newObjects.some((o: any) => o.Name === newName)) {
        newObjects.push({ ...asset, Name: newName });
      }

      const isOldNameUsed = screens.some(
        (s) =>
          s.Background === oldName ||
          s.Icons?.some((i: any) => i.Name === oldName),
      );
      if (!isOldNameUsed) {
        newObjects = newObjects.filter((o: any) => o.Name !== oldName);
      }

      return {
        projectData: {
          ...state.projectData,
          Screens: screens,
          Objects: newObjects,
        },
      };
    });

    toast.success(`Renamed to "${newName}"`, { id: "instance-renamed" });
    useHistoryStore.getState().push(`Renamed to "${newName}"`);
    return true;
  },

  duplicateIcon: (screenIdx, iconIdx) => {
    const { projectData } = get();
    if (!projectData) return false;

    const icon = projectData.Screens[screenIdx]?.Icons?.[iconIdx];
    if (!icon) return false;

    const asset = projectData.Objects.find(
      (obj: any) => obj.Name === icon.Name,
    );

    const baseName = icon.Name.replace(/(_copy\d*|_\d+)$/, "");
    const newName = get().getUniqueInstanceName(baseName, asset?.Path || "");

    const duplicate = {
      ...icon,
      Name: newName,
      X: icon.X + 20,
      Y: icon.Y + 20,
      States: icon.States
        ? [...icon.States]
        : [{ Name: "DEFAULT", Color: "PURE_WHITE" }],
    };

    set((state) => {
      if (!state.projectData) return state;
      const screens = [...state.projectData.Screens];
      const screen = { ...screens[screenIdx] };
      screen.Icons = [...(screen.Icons || []), duplicate];
      screens[screenIdx] = screen;

      let newObjects = [...state.projectData.Objects];
      if (asset && !newObjects.some((o: any) => o.Name === newName)) {
        newObjects.push({ ...asset, Name: newName });
      }

      return {
        projectData: {
          ...state.projectData,
          Screens: screens,
          Objects: newObjects,
        },
      };
    });

    toast.success(`Duplicated as "${newName}"`, { id: "instance-duplicated" });
    useHistoryStore.getState().push(`Duplicated "${icon.Name}"`);
    return true;
  },

  deleteIcon: (screenIdx, iconIdx) => {
    const { projectData } = get();
    if (!projectData) return;

    const icon = projectData.Screens[screenIdx]?.Icons?.[iconIdx];
    if (!icon) return;

    const iconName = icon.Name;

    set((state) => {
      if (!state.projectData) return state;
      const screens = [...state.projectData.Screens];
      const screen = { ...screens[screenIdx] };
      screen.Icons = (screen.Icons || []).filter(
        (_: any, i: number) => i !== iconIdx,
      );
      screens[screenIdx] = screen;

      const isUsedElsewhere = screens.some(
        (s: any) =>
          s.Background === iconName ||
          s.Icons?.some((ic: any) => ic.Name === iconName),
      );
      const newObjects = isUsedElsewhere
        ? state.projectData.Objects
        : state.projectData.Objects.filter((obj: any) => obj.Name !== iconName);

      return {
        projectData: {
          ...state.projectData,
          Screens: screens,
          Objects: newObjects,
        },
      };
    });

    useHistoryStore.getState().push(`Deleted "${iconName}"`);
    toast.success(`Removed "${iconName}"`, { id: "instance-removed" });
  },

  // === ВОССТАНОВЛЕННЫЕ ФУНКЦИИ МАССОВЫХ ДЕЙСТВИЙ ===

  deleteColors: (names) => {
    set((state) => {
      if (!state.projectData) return state;
      const newColors = { ...state.projectData.Colors };
      names.forEach((name) => delete newColors[name]);
      return { projectData: { ...state.projectData, Colors: newColors } };
    });
    useHistoryStore.getState().push(`Deleted ${names.length} colors`);
  },

  deleteScreens: (indices) => {
    set((state) => {
      if (!state.projectData) return state;
      const toDelete = new Set(indices);
      return {
        projectData: {
          ...state.projectData,
          Screens: state.projectData.Screens.filter(
            (_: any, i: number) => !toDelete.has(i),
          ),
        },
      };
    });
    useHistoryStore.getState().push(`Deleted ${indices.length} screens`);
  },

  duplicateScreens: (indices) => {
    set((state) => {
      if (!state.projectData) return state;
      const newScreens = [...state.projectData.Screens];
      const copies = indices.map((i: number) => ({
        ...state.projectData!.Screens[i],
        Name: `${state.projectData!.Screens[i].Name} Copy`,
      }));
      return {
        projectData: {
          ...state.projectData,
          Screens: [...newScreens, ...copies],
        },
      };
    });
    useHistoryStore.getState().push(`Duplicated ${indices.length} screens`);
  },

  deleteIcons: (screenIdx, iconIndices) => {
    set((state) => {
      if (!state.projectData) return state;
      const screens = [...state.projectData.Screens];
      const screen = { ...screens[screenIdx] };
      const toDelete = new Set(iconIndices);

      screen.Icons = (screen.Icons || []).filter(
        (_: any, i: number) => !toDelete.has(i),
      );
      screens[screenIdx] = screen;

      return { projectData: { ...state.projectData, Screens: screens } };
    });
    useHistoryStore.getState().push(`Deleted ${iconIndices.length} instances`);
  },
});
