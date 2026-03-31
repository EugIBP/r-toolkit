import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { useProjectStore } from "./useProjectStore";
import { toast } from "sonner";

export type GaugeType = "arrow" | "slider" | "arc" | null;

export interface ArrowParams {
  id: string;
  type?: GaugeType;
  sourceImage: string | null;
  maskImage?: string | null;
  cx: number;
  cy: number;
  r0: number;
  r1: number;
  d0: number;
  d1: number;
  minVal: number;
  maxVal: number;
  frames: number;
  currentTestValue: number;
}

interface GaugeState {
  isActive: boolean;
  activeType: GaugeType;
  arrows: ArrowParams[];
  selectedGaugeId: string | null;
  rawGaugesData: any;
  hasUnsavedGauges: boolean;

  openGaugeGenerator: (type: GaugeType) => void;
  closeGaugeGenerator: () => void;
  loadGauges: (baseDir: string) => Promise<void>;
  saveGauges: () => Promise<void>;
  selectGauge: (id: string | null) => void;
  addGauge: () => void;
  duplicateGauge: (id: string) => void;
  deleteGauge: (id: string) => void;
  updateGauge: (id: string, params: Partial<ArrowParams>) => void;
}

const defaultArrowParams: Omit<ArrowParams, "id"> = {
  type: "arrow",
  sourceImage: null,
  cx: 960,
  cy: 360,
  r0: 50,
  r1: 250,
  d0: -135,
  d1: 135,
  minVal: 0,
  maxVal: 100,
  frames: 100,
  currentTestValue: 0,
};

export const useGaugeStore = create<GaugeState>((set, get) => ({
  isActive: true,
  activeType: "arrow",
  arrows: [],
  selectedGaugeId: null,
  rawGaugesData: {},
  hasUnsavedGauges: false,

  openGaugeGenerator: (type) => {
    set({ isActive: true, activeType: type, selectedGaugeId: null });
  },
  closeGaugeGenerator: () => set({ isActive: false, activeType: null }),

  loadGauges: async (baseDir: string) => {
    try {
      const content = await invoke<string>("load_project", {
        filePath: `${baseDir}/.rtoolkit/gauges.json`,
      });
      const data = JSON.parse(content);
      const loadedArrows = data.arrows || [];
      loadedArrows.forEach((a: ArrowParams) => {
        if (!a.type) a.type = "arrow";
      });

      set({
        rawGaugesData: data,
        arrows: loadedArrows,
        selectedGaugeId: null,
        hasUnsavedGauges: false,
      });
    } catch (e) {
      set({
        rawGaugesData: {},
        arrows: [],
        selectedGaugeId: null,
        hasUnsavedGauges: false,
      });
    }
  },

  saveGauges: async () => {
    const baseDir = useProjectStore.getState().baseDir;
    if (!baseDir) return;
    const { arrows, rawGaugesData } = get();

    const arrowsToSave = arrows.map(({ currentTestValue, ...rest }) => rest);
    const dataToSave = { ...rawGaugesData, arrows: arrowsToSave };

    try {
      await invoke("save_text_file", {
        path: `${baseDir}/.rtoolkit/gauges.json`,
        content: JSON.stringify(dataToSave, null, 2),
      });
      set({ hasUnsavedGauges: false });
      toast.success("Gauges saved successfully");
    } catch (e) {
      toast.error("Failed to save gauges.json");
    }
  },

  selectGauge: (id) => set({ selectedGaugeId: id }),

  addGauge: () => {
    const { arrows, activeType } = get();
    const prefix = activeType === "arc" ? "NEW_SHADER" : "NEW_ARROW";

    let newId = prefix;
    let counter = 1;
    while (arrows.some((a) => a.id === newId)) {
      newId = `${prefix}_${counter++}`;
    }
    const newArrow = {
      ...defaultArrowParams,
      id: newId,
      type: activeType || "arrow",
    };
    set({
      arrows: [...arrows, newArrow],
      selectedGaugeId: newId,
      hasUnsavedGauges: true,
    });
  },

  duplicateGauge: (id) => {
    const { arrows } = get();
    const target = arrows.find((a) => a.id === id);
    if (!target) return;

    let newId = `${target.id}_COPY`;
    let counter = 1;
    while (arrows.some((a) => a.id === newId)) {
      newId = `${target.id}_COPY_${counter++}`;
    }

    const newGauge = { ...target, id: newId };
    set({
      arrows: [...arrows, newGauge],
      selectedGaugeId: newId,
      hasUnsavedGauges: true,
    });
  },

  deleteGauge: (id) => {
    const { arrows, selectedGaugeId } = get();
    const newArrows = arrows.filter((a) => a.id !== id);
    set({
      arrows: newArrows,
      selectedGaugeId: selectedGaugeId === id ? null : selectedGaugeId,
      hasUnsavedGauges: true,
    });
  },

  updateGauge: (id, params) => {
    set((state) => {
      if (params.id !== undefined && params.id !== id) {
        if (state.arrows.some((a) => a.id === params.id)) {
          toast.error(`Gauge with ID ${params.id} already exists`);
          return state;
        }
      }

      const isOnlyPreviewChange =
        Object.keys(params).length === 1 &&
        params.currentTestValue !== undefined;
      const newArrows = state.arrows.map((a) =>
        a.id === id ? { ...a, ...params } : a,
      );

      return {
        arrows: newArrows,
        selectedGaugeId:
          params.id !== undefined ? params.id : state.selectedGaugeId,
        hasUnsavedGauges: isOnlyPreviewChange ? state.hasUnsavedGauges : true,
      };
    });
  },
}));
