import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import type { ProjectStore } from "./types";
import type { StateCreator } from "zustand";

export const createProjectSlice: StateCreator<ProjectStore, [], [], Pick<ProjectStore,
  "projectData" | "projectPath" | "baseDir" | "scannedFiles" |
  "setProject" | "saveProject" | "scanDirectory"
>> = (set, get) => ({
  projectData: null,
  projectPath: null,
  baseDir: null,
  scannedFiles: [],

  setProject: async (arg1, arg2) => {
    let data: any;
    let path: string;

    if (typeof arg1 === "string") {
      path = arg1;
      data = arg2;
    } else {
      data = arg1;
      path = arg2;
    }

    if (!path || typeof path !== "string") {
      console.error("Invalid project path provided to setProject:", path);
      return;
    }

    if (!data.Screens || data.Screens.length === 0) {
      data.Screens = [{ Name: "Screen 1", Background: "", Icons: [] }];
    }

    const cleanPath = path.trim().replace(/^["']|["']$/g, "");
    const lastIdx = Math.max(cleanPath.lastIndexOf("/"), cleanPath.lastIndexOf("\\"));
    const baseDir = lastIdx !== -1 ? cleanPath.substring(0, lastIdx) : "";

    // Load spriteAssets from .rtoolkit/canvas.json
    let spriteAssets: Record<string, boolean> = {};
    try {
      const canvasContent = await invoke<string>("load_project", {
        filePath: `${baseDir}/.rtoolkit/canvas.json`,
      });
      const canvasConfig = JSON.parse(canvasContent);
      spriteAssets = canvasConfig.spriteAssets || {};
    } catch {
      // No canvas.json yet — spriteAssets stays empty
    }

    if (data.Objects) {
      data.Objects = data.Objects.map((obj: any) => ({
        ...obj,
        isSprite: spriteAssets[obj.Name] ?? false,
      }));
    }

    set({ projectData: data, projectPath: cleanPath, baseDir });
  },

  scanDirectory: async () => {
    const { baseDir } = get();
    if (!baseDir) return;
    try {
      const files = await invoke<string[]>("scan_project_assets", { baseDir });
      set({ scannedFiles: files || [] });
    } catch (e) {
      console.error("Failed to scan directory:", e);
      set({ scannedFiles: [] });
    }
  },

  saveProject: async () => {
    const { projectData, projectPath } = get();
    if (!projectData || !projectPath) return;

    const updatedObjects = projectData.Objects.map((obj: any) => {
      const isBackground = obj.Path.toLowerCase().includes("backgrounds");
      const { isSprite: _isSprite, ...cleanObj } = obj;
      return { ...cleanObj, Type: isBackground ? "Bin" : "Ico" };
    }).sort((a: any, b: any) => {
      const getOrder = (obj: any) => {
        if (obj.Path.toLowerCase().includes("backgrounds")) return 0;
        if (obj.Path.toLowerCase().includes("sprites")) return 2;
        return 1;
      };
      return getOrder(a) - getOrder(b);
    });

    const sortedData = { ...projectData, Objects: updatedObjects };

    try {
      await invoke("save_text_file", {
        path: projectPath,
        content: JSON.stringify(sortedData, null, 2),
      });
      toast.success("Project saved");
    } catch (e) {
      toast.error(`Save failed: ${e}`);
    }
  },
});
