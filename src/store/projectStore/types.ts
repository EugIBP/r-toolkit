export interface ProjectStore {
  projectData: any | null;
  projectPath: string | null;
  baseDir: string | null;
  scannedFiles: string[];

  // projectSlice
  setProject: (arg1: any, arg2: any) => void;
  saveProject: () => Promise<void>;
  scanDirectory: () => Promise<void>;

  // objectsSlice
  updateProjectObject: (oldName: string, updates: Partial<any>) => void;
  deleteProjectObject: (name: string) => void;
  addProjectObject: (newObj: any) => void;
  registerAllAssets: () => void;
  registerAndAddInstances: (screenIdx: number) => Promise<void>;
  convertAssetType: (assetName: string, targetType: "icon" | "sprite") => Promise<boolean>;
  isNameUnique: (name: string) => boolean;
  getAssetInstances: (assetName: string) => Array<{ screenIdx: number; iconIdx: number; icon: any }>;

  // iconsSlice
  updateScreen: (screenIdx: number, updates: Partial<any>) => void;
  addScreen: () => void;
  duplicateScreen: (index: number) => void;
  deleteScreen: (index: number) => void;
  addColor: (name: string, hex: string) => void;
  updateColor: (oldName: string, newName: string, newHex: string) => void;
  deleteColor: (name: string) => void;
  updateIcon: (screenIdx: number, iconIdx: number, updates: Partial<any>) => void;
  addIconState: (screenIdx: number, iconIdx: number) => void;
  updateIconState: (screenIdx: number, iconIdx: number, stateIdx: number, updates: Partial<any>) => void;
  deleteIconState: (screenIdx: number, iconIdx: number, stateIdx: number) => void;
  addInstance: (screenIdx: number, assetName: string, options?: { name?: string; x?: number; y?: number; states?: any[] }) => boolean;
  renameInstance: (screenIdx: number, iconIdx: number, newName: string) => boolean;
  duplicateIcon: (screenIdx: number, iconIdx: number) => boolean;
  deleteIcon: (screenIdx: number, iconIdx: number) => void;
}
