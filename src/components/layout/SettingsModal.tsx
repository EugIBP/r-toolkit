import { useAppStore } from "@/store/useAppStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { X, Grid3X3, Check } from "lucide-react";

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen } = useAppStore();

  const { snapToGrid, setSnapToGrid, gridSize, setGridSize } = useCanvasStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 w-[360px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Шапка */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-primary" /> Workspace Settings
          </h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Grid & Snapping
            </h3>

            {/* Тоггл Привязки к сетке */}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                Snap to Grid
              </span>
              <div
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${snapToGrid ? "bg-primary" : "bg-white/10"}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${snapToGrid ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
            </label>

            {/* Выбор размера сетки */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-white/60">
                Grid Size (px)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 4, 8, 16].map((size) => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    disabled={!snapToGrid}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      !snapToGrid
                        ? "opacity-30 cursor-not-allowed bg-white/5 text-white/40"
                        : gridSize === size
                          ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {gridSize === size && <Check className="w-3 h-3" />} {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
