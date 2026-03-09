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

type Density = "small" | "medium" | "large";
type SortBy = "lastOpened" | "name";
type SortOrder = "asc" | "desc";

interface AppStore {
  currentView: "dashboard" | "composer" | "dither";
  viewMode: "grid" | "list";
  workspaceTab: "workspace" | "tools";
  recentProjects: RecentProject[];
  isSettingsOpen: boolean;
  editingWorkspaceId: string | null;
  pendingUpdate: UpdateInfo | null;
  availableUpdate: string | null;

  // Density & Pagination
  density: Density;
  currentPage: number;
  sortBy: SortBy;
  sortOrder: SortOrder;

  // Bulk selection
  selectedProjectIds: Set<string>;

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

  // Density & Pagination setters
  setDensity: (density: Density) => void;
  setCurrentPage: (page: number) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;

  // Bulk selection setters
  toggleProjectSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;

  loadRecent: () => Promise<void>;
  addRecent: (path: string, name: string, silent?: boolean) => Promise<void>;
  removeRecent: (id: string) => Promise<void>;
  updateProjectMeta: (
    id: string,
    newName: string,
    newDesc: string,
  ) => Promise<void>;
  refreshRecent: () => Promise<void>;

  // Persistence
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;

  // Method to show confirmation dialog (returns Promise)
  confirm: (title: string, message: string) => Promise<boolean>;
  closeConfirm: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentView: (typeof window !== 'undefined' && sessionStorage.getItem('currentView') as 'dashboard' | 'composer' | 'dither') || 'dashboard',
  viewMode: "grid",
  workspaceTab: (typeof window !== 'undefined' && sessionStorage.getItem('workspaceTab') as 'workspace' | 'tools') || 'workspace',
  recentProjects: [],
  isSettingsOpen: false,
  editingWorkspaceId: null,
  pendingUpdate: null,
  availableUpdate: null,
  confirmDialog: null,

  // Density & Pagination
  density: "medium",
  currentPage: 1,
  sortBy: "lastOpened",
  sortOrder: "desc",
  selectedProjectIds: new Set(),

  setCurrentView: (view) => {
    sessionStorage.setItem('currentView', view);
    set({ currentView: view });
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  setWorkspaceTab: (tab: "workspace" | "tools") => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('workspaceTab', tab);
    }
    set({ workspaceTab: tab });
  },
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setEditingWorkspaceId: (id) => set({ editingWorkspaceId: id }),
  setPendingUpdate: (update) => set({ pendingUpdate: update }),
  setAvailableUpdate: (version) => set({ availableUpdate: version }),

  // Density & Pagination setters
  setDensity: (density) => {
    set({ density, currentPage: 1 });
    get().saveSettings();
  },
  setCurrentPage: (page) => set({ currentPage: page }),
  setSortBy: (sortBy) => {
    set({ sortBy, currentPage: 1 });
    get().saveSettings();
  },
  setSortOrder: (order) => {
    set({ sortOrder: order, currentPage: 1 });
    get().saveSettings();
  },

  // Bulk selection setters
  toggleProjectSelection: (id) => {
    const selected = new Set(get().selectedProjectIds);
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    set({ selectedProjectIds: selected });
  },
  clearSelection: () => set({ selectedProjectIds: new Set() }),
  selectAll: (ids) => set({ selectedProjectIds: new Set(ids) }),

  // Persistence for dashboard settings
  loadSettings: async () => {
    try {
      const savedSettings = await persistentStore.get<{
        density?: Density;
        sortBy?: SortBy;
        sortOrder?: SortOrder;
      }>("dashboard_settings");

      if (savedSettings) {
        set({
          density: savedSettings.density || "medium",
          sortBy: savedSettings.sortBy || "lastOpened",
          sortOrder: savedSettings.sortOrder || "desc",
        });
      }
    } catch (e) {
      console.warn("Failed to load dashboard settings", e);
    }
  },

  saveSettings: async () => {
    try {
      const { density, sortBy, sortOrder } = get();
      await persistentStore.set("dashboard_settings", {
        density,
        sortBy,
        sortOrder,
      });
      await persistentStore.save();
    } catch (e) {
      console.warn("Failed to save dashboard settings", e);
    }
  },

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

  addRecent: async (path, folderName, silent = false) => {
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
    if (!silent) {
      set({ recentProjects: updated });
    }
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
