// src/store/projectStore/types.ts
import type {
  ProjectData,
  AssetObject,
  ScreenData,
  IconInstance,
  ColorState,
} from "@/types/project";

export interface ScannedFile {
  path: string;
  dir: string;
  asset_type: "bin" | "ico" | "pal";
}

export interface ProjectStore {
  // Меняем any на ProjectData
  projectData: ProjectData | null;
  projectPath: string | null;
  baseDir: string | null;
  scannedFiles: ScannedFile[];

  // projectSlice
  setProject: (
    data: ProjectData | string,
    pathOrData: string | ProjectData,
  ) => void;
  saveProject: () => Promise<void>;
  scanDirectory: () => Promise<void>;
  clearScannedFiles: () => void;

  // objectsSlice
  updateProjectObject: (oldName: string, updates: Partial<AssetObject>) => void;
  deleteProjectObject: (name: string) => void;
  addProjectObject: (newObj: AssetObject) => void;
  registerAllAssets: () => void;
  registerAsset: (path: string) => void;
  registerAssets: (paths: string[]) => void;
  registerAndAddInstances: (screenIdx: number) => Promise<void>;
  convertAssetType: (
    assetName: string,
    targetType: "icon" | "sprite" | "pal",
  ) => Promise<boolean>;
  isNameUnique: (name: string, targetPath?: string) => boolean;
  getUniqueInstanceName: (baseName: string, targetPath: string) => string;
  getAssetInstances: (
    assetName: string,
  ) => Array<{ screenIdx: number; iconIdx: number; icon: IconInstance }>;
  deleteProjectObjects: (names: string[]) => void;

  // iconsSlice
  updateScreen: (screenIdx: number, updates: Partial<ScreenData>) => void;
  addScreen: () => void;
  duplicateScreen: (index: number) => void;
  deleteScreen: (index: number) => void;
  addColor: (name: string, hex: string) => void;
  updateColor: (oldName: string, newName: string, newHex: string) => void;
  deleteColor: (name: string) => void;

  // Меняем Partial<any> на Partial<IconInstance>
  updateIcon: (
    screenIdx: number,
    iconIdx: number,
    updates: Partial<IconInstance>,
  ) => void;

  addIconState: (screenIdx: number, iconIdx: number) => void;

  // Меняем Partial<any> на Partial<ColorState>
  updateIconState: (
    screenIdx: number,
    iconIdx: number,
    stateIdx: number,
    updates: Partial<ColorState>,
  ) => void;

  deleteIconState: (
    screenIdx: number,
    iconIdx: number,
    stateIdx: number,
  ) => void;
  addInstance: (
    screenIdx: number,
    assetName: string,
    options?: { name?: string; x?: number; y?: number; states?: ColorState[] },
  ) => boolean;
  renameInstance: (
    screenIdx: number,
    iconIdx: number,
    newName: string,
  ) => boolean;
  duplicateIcon: (screenIdx: number, iconIdx: number) => boolean;
  deleteIcon: (screenIdx: number, iconIdx: number) => void;

  deleteColors: (names: string[]) => void;
  deleteScreens: (indices: number[]) => void;
  duplicateScreens: (indices: number[]) => void;
  deleteIcons: (screenIdx: number, iconIndices: number[]) => void;
}
