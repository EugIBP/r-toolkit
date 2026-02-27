import { create } from "zustand";
import { LazyStore } from "@tauri-apps/plugin-store";
import { UpdateInfo } from "@/lib/updater";

const persistentStore = new LazyStore("settings.json");

export interface RecentProject {
  id: string;
  path: string;
  displayName: string;
  description?: string;
  lastOpened: number;
}

interface AppStore {
  currentView: "dashboard" | "composer" | "dither";
  viewMode: "grid" | "list";
  workspaceTab: "workspace" | "tools";
  recentProjects: RecentProject[];
  isSettingsOpen: boolean;
  editingWorkspaceId: string | null;
  pendingUpdate: UpdateInfo | null;
  availableUpdate: string | null;

  // Global confirmation dialog state
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    resolve: (value: boolean) => void;
  } | null;

  setCurrentView: (view: "dashboard" | "composer" | "dither") => void;
  setViewMode: (mode: "grid" | "list") => void;
  setWorkspaceTab: (tab: "workspace" | "tools") => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setEditingWorkspaceId: (id: string | null) => void;
  setPendingUpdate: (update: UpdateInfo | null) => void;
  setAvailableUpdate: (version: string | null) => void;

  loadRecent: () => Promise<void>;
  addRecent: (path: string, name: string) => Promise<void>;
  removeRecent: (id: string) => Promise<void>;
  updateProjectMeta: (
    id: string,
    newName: string,
    newDesc: string,
  ) => Promise<void>;
  refreshRecent: () => Promise<void>;

  // Method to show confirmation dialog (returns Promise)
  confirm: (title: string, message: string) => Promise<boolean>;
  closeConfirm: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentView: "dashboard",
  viewMode: "grid",
  workspaceTab: "workspace",
  recentProjects: [],
  isSettingsOpen: false,
  editingWorkspaceId: null,
  pendingUpdate: null,
  availableUpdate: null,
  confirmDialog: null,

  setCurrentView: (view) => set({ currentView: view }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setWorkspaceTab: (tab: "workspace" | "tools") => set({ workspaceTab: tab }),
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setEditingWorkspaceId: (id) => set({ editingWorkspaceId: id }),
  setPendingUpdate: (update) => set({ pendingUpdate: update }),
  setAvailableUpdate: (version) => set({ availableUpdate: version }),

  loadRecent: async () => {
    try {
      const saved =
        await persistentStore.get<RecentProject[]>("recent_projects_v3");

      if (saved && Array.isArray(saved)) {
        set({ recentProjects: saved });
      }
    } catch (e) {
      console.warn(
        "No recent projects found or failed to load settings.json",
        e,
      );
    }
  },

  addRecent: async (path, folderName) => {
    const id = btoa(encodeURIComponent(path));
    const current = get().recentProjects;
    const existing = current.find((p) => p.id === id);
    const newEntry: RecentProject = {
      id,
      path,
      displayName: existing?.displayName || folderName,
      description: existing?.description || "",
      lastOpened: Date.now(),
    };
    const updated = [newEntry, ...current.filter((p) => p.id !== id)].slice(
      0,
      15,
    );
    set({ recentProjects: updated });
    await persistentStore.set("recent_projects_v3", updated);
    await persistentStore.save();
  },

  removeRecent: async (id) => {
    const updated = get().recentProjects.filter((p) => p.id !== id);
    set({ recentProjects: updated });
    await persistentStore.set("recent_projects_v3", updated);
    await persistentStore.save();
  },

  updateProjectMeta: async (id, newName, newDesc) => {
    const updated = get().recentProjects.map((p) =>
      p.id === id ? { ...p, displayName: newName, description: newDesc, lastModified: Date.now() } : p,
    );
    set({ recentProjects: updated });
    await persistentStore.set("recent_projects_v3", updated);
    await persistentStore.save();
  },

  refreshRecent: async () => {
    await get().loadRecent();
  },

  confirm: (title, message) => {
    return new Promise((resolve) => {
      set({
        confirmDialog: { isOpen: true, title, message, resolve },
      });
    });
  },

  closeConfirm: () => set({ confirmDialog: null }),
}));
