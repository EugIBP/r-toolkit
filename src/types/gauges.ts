export type GaugeCategory = "arrow" | "slider" | "arc";

export interface ArrowGauge {
  id: string;
  sourceImage: string | null;
  cx: number;
  cy: number;
  r0: number;
  r1: number;
  d0: number;
  d1: number;
  minVal: number;
  maxVal: number;
  frames: number;
}

export interface SliderGauge {
  id: string;
  // TODO: Add slider specific properties (width, height, orientation)
}

export interface ArcGauge {
  id: string;
  // TODO: Add arc specific properties (radius, thickness, startAngle, endAngle)
}

export interface GaugesFileData {
  arrows: ArrowGauge[];
  sliders: SliderGauge[];
  arcs: ArcGauge[];
}
