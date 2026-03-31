export interface ColorState {
  Name: string;
  Color: string;
}

export interface IconInstance {
  Name: string;
  X: number;
  Y: number;
  States?: ColorState[];
}

export interface LayoutGrid {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  type: "columns" | "rows" | "mesh" | "islands";
  count: number;
  rows?: number;
  offset: number;
  offsetY?: number;
  size: number;
  gaps: string;
}

export interface ScreenData {
  Name: string;
  Background: string;
  Icons: IconInstance[];
}

export interface AssetObject {
  Name: string;
  Path: string;
  Type: "Ico" | "Bin" | "Pal";
  isSprite?: boolean;
  dir?: string;
  isRegistered?: boolean;
}

export interface ProjectData {
  DisplayWidth?: number;
  DisplayHeight?: number;
  Screens: ScreenData[];
  Objects: AssetObject[];
  Colors: Record<string, string>;
  PriorityAssets?: string[];
  Assets?: string[];
}
