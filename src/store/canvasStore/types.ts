// src/store/canvasStore/types.ts

export interface CanvasStore {
  // --- UI Store ---
  zoom: number;
  searchQuery: string;
  activeTab: string;
  activeScreenIdx: number;
  assetFilter: "all" | "bg" | "icons" | "sprites" | "stacked";
  canvasMode: "view" | "edit";
  showScreenSettings: boolean;
  screenListMode: "list" | "detail";
  previewBgPath: string | null;

  setZoom: (value: number) => void;
  resetZoom: () => void;
  setSearchQuery: (val: string) => void;
  setActiveTab: (tab: string) => void;
  setActiveScreenIdx: (idx: number) => void;
  setAssetFilter: (
    filter: "all" | "bg" | "icons" | "sprites" | "stacked",
  ) => void;
  setCanvasMode: (mode: "view" | "edit") => void;
  setShowScreenSettings: (show: boolean) => void;
  setScreenListMode: (mode: "list" | "detail") => void;
  setPreviewBgPath: (path: string | null) => void;

  // --- Selection Store ---
  selectedIconIndex: number | null;
  selectedColorKey: string | null;
  selectedAssetPath: string | null;
  hoveredAssetName: string | null;
  selectedStates: Record<string, number | null>;
  expandedStackIndices: number[] | null;

  setSelectedIcon: (index: number | null) => void;
  setSelectedColorKey: (key: string | null) => void;
  setSelectedAssetPath: (path: string | null) => void;
  setHoveredAssetName: (name: string | null) => void;
  setSelectedState: (
    screenIdx: number,
    assetName: string,
    stateIdx: number | null,
  ) => void;
  setExpandedStackIndices: (indices: number[] | null) => void;

  // --- Settings Store ---
  stackThreshold: number;
  snapToGrid: boolean;
  gridSize: number;
  allowDnd: boolean;
  assetScope: "global" | "local";
  autoSaveEnabled: boolean;
  autoSaveInterval: number;

  setStackThreshold: (value: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setAllowDnd: (val: boolean) => void;
  setAssetScope: (scope: "global" | "local") => void;
  setAutoSaveEnabled: (val: boolean) => Promise<void>;
  setAutoSaveInterval: (val: number) => Promise<void>;

  // --- Icon Data Store ---
  iconFrames: Record<number, Record<string, number>>;
  iconFrameCounts: Record<number, Record<string, number>>;
  iconOrientations: Record<number, Record<string, "horizontal" | "vertical">>;
  iconNaturalSizes: Record<string, { width: number; height: number }>;

  setIconFrame: (screenIdx: number, assetName: string, frame: number) => void;
  setIconFrameCount: (
    screenIdx: number,
    assetName: string,
    count: number,
  ) => void;
  setIconOrientation: (
    screenIdx: number,
    assetName: string,
    orientation: "horizontal" | "vertical",
  ) => void;
  setIconNaturalSize: (
    assetPath: string,
    size: { width: number; height: number },
  ) => void;

  // --- Workspace Store ---
  hasUnsavedChanges: boolean;

  setHasUnsavedChanges: (val: boolean) => void;
  resetCanvas: () => void;
  saveWorkspace: () => Promise<void>;
  loadWorkspace: (baseDir: string) => Promise<void>;
}
