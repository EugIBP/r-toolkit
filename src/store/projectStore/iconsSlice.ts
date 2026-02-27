import { toast } from "sonner";
import type { ProjectStore } from "./types";
import type { StateCreator } from "zustand";
import { useHistoryStore } from "../useHistory";

export const createIconsSlice: StateCreator<ProjectStore, [], [], Pick<ProjectStore,
  "updateScreen" | "addScreen" | "duplicateScreen" | "deleteScreen" |
  "addColor" | "updateColor" | "deleteColor" |
  "updateIcon" | "addIconState" | "updateIconState" | "deleteIconState" |
  "addInstance" | "renameInstance" | "duplicateIcon" | "deleteIcon"
>> = (set, get) => ({
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
      newScreens.splice(index + 1, 0, { ...screenToDuplicate, Name: `${screenToDuplicate.Name} Copy` });
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
          Screens: state.projectData.Screens.filter((_: any, i: number) => i !== index),
        },
      };
    });
    useHistoryStore.getState().push("Deleted screen");
  },

  addColor: (name, hex) => {
    set((state) => {
      if (!state.projectData) return state;
      let formatted = hex.toLowerCase();
      if (!formatted.startsWith("#00")) formatted = "#00" + formatted.substring(1);
      return {
        projectData: {
          ...state.projectData,
          Colors: { ...state.projectData.Colors, [name.toUpperCase()]: formatted },
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
      if (!formatted.startsWith("#00")) formatted = "#00" + formatted.substring(1);
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
      const newStates = [...(icon.States || []), { Name: "NEW_STATE", Color: "WHITE" }];
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
      const newStates = icon.States.map((s: any, i: number) =>
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
      const newStates = icon.States.filter((_: any, i: number) => i !== stateIdx);
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
    const { projectData } = get();
    if (!projectData) return false;

    const instanceName = options?.name || assetName;

    if (!get().isNameUnique(instanceName)) {
      toast.error(`Name "${instanceName}" already exists`);
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
      return { projectData: { ...state.projectData, Screens: screens } };
    });

    if (!projectData.Objects.some((obj: any) => obj.Name === instanceName)) {
      const asset = projectData.Objects.find((obj: any) => obj.Name === assetName);
      if (asset) {
        set((state) => {
          if (!state.projectData) return state;
          return {
            projectData: {
              ...state.projectData,
              Objects: [
                ...state.projectData.Objects,
                { Name: instanceName, Path: asset.Path, Type: asset.Type },
              ],
            },
          };
        });
      }
    }

    toast.success(`Instance "${instanceName}" created`);
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

    if (!get().isNameUnique(newName)) {
      toast.error(`Name "${newName}" already exists`);
      return false;
    }

    set((state) => {
      if (!state.projectData) return state;
      const screens = [...state.projectData.Screens];
      const screen = { ...screens[screenIdx] };
      screen.Icons = [...(screen.Icons || [])];
      screen.Icons[iconIdx] = { ...screen.Icons[iconIdx], Name: newName };
      screens[screenIdx] = screen;
      const objects = state.projectData.Objects.map((obj: any) =>
        obj.Name === oldName ? { ...obj, Name: newName } : obj,
      );
      return { projectData: { ...state.projectData, Screens: screens, Objects: objects } };
    });

    toast.success(`Renamed to "${newName}"`);
    useHistoryStore.getState().push(`Renamed to "${newName}"`);
    return true;
  },

  duplicateIcon: (screenIdx, iconIdx) => {
    const { projectData } = get();
    if (!projectData) return false;

    const icon = projectData.Screens[screenIdx]?.Icons?.[iconIdx];
    if (!icon) return false;

    let newName = `${icon.Name}_copy`;
    let counter = 1;
    while (!get().isNameUnique(newName)) {
      newName = `${icon.Name}_copy${counter++}`;
    }

    const duplicate = {
      ...icon,
      Name: newName,
      X: icon.X + 20,
      Y: icon.Y + 20,
      States: icon.States ? [...icon.States] : [{ Name: "DEFAULT", Color: "PURE_WHITE" }],
    };

    const asset = projectData.Objects.find((obj: any) => obj.Name === icon.Name);

    set((state) => {
      if (!state.projectData) return state;
      const screens = [...state.projectData.Screens];
      const screen = { ...screens[screenIdx] };
      screen.Icons = [...(screen.Icons || []), duplicate];
      screens[screenIdx] = screen;
      const newObjects = asset
        ? [...state.projectData.Objects, { ...asset, Name: newName }]
        : state.projectData.Objects;
      return { projectData: { ...state.projectData, Screens: screens, Objects: newObjects } };
    });

    toast.success(`Duplicated as "${newName}"`);
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
      screen.Icons = (screen.Icons || []).filter((_: any, i: number) => i !== iconIdx);
      screens[screenIdx] = screen;

      const isUsedElsewhere = state.projectData.Screens.some((s: any, si: number) =>
        si !== screenIdx && s.Icons?.some((ic: any) => ic.Name === iconName),
      );

      const newObjects = isUsedElsewhere
        ? state.projectData.Objects
        : state.projectData.Objects.filter((obj: any) => obj.Name !== iconName);

      return { projectData: { ...state.projectData, Screens: screens, Objects: newObjects } };
    });

    useHistoryStore.getState().push(`Deleted "${iconName}"`);

    toast.success(`Removed "${iconName}"`);
  },
});
