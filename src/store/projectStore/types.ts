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
  projectData: ProjectData | null;
  projectPath: string | null;
  baseDir: string | null;
  scannedFiles: ScannedFile[];

  setProject: (
    data: ProjectData | string,
    pathOrData: string | ProjectData,
  ) => void;
  saveProject: () => Promise<void>;
  scanDirectory: () => Promise<void>;
  clearScannedFiles: () => void;

  updateProjectObject: (oldName: string, updates: Partial<AssetObject>) => void;
  deleteProjectObject: (name: string) => void;
  addProjectObject: (newObj: AssetObject) => void;

  // ДОБАВЛЯЕМ ЭТУ СТРОКУ:
  addProjectAsset: (path: string) => void;

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

  updateScreen: (screenIdx: number, updates: Partial<ScreenData>) => void;
  addScreen: () => void;
  duplicateScreen: (index: number) => void;
  deleteScreen: (index: number) => void;
  addColor: (name: string, hex: string) => void;
  updateColor: (oldName: string, newName: string, newHex: string) => void;
  deleteColor: (name: string) => void;

  updateIcon: (
    screenIdx: number,
    iconIdx: number,
    updates: Partial<IconInstance>,
  ) => void;

  addIconState: (screenIdx: number, iconIdx: number) => void;
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
