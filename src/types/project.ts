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
  dir?: string; // Используется при сканировании
  isRegistered?: boolean; // Флаг для новых ассетов
}

export interface ProjectData {
  DisplayWidth?: number;
  DisplayHeight?: number;
  Screens: ScreenData[];
  Objects: AssetObject[];
  Colors: Record<string, string>;
}
