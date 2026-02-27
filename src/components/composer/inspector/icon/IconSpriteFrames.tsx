import { LayoutGrid } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";

interface Props {
  screenIdx: number;
  assetName: string;
  isViewMode: boolean;
}

export function IconSpriteFrames({ screenIdx, assetName, isViewMode }: Props) {
  const {
    iconFrameCounts,
    setIconFrameCount,
    iconOrientations,
    setIconOrientation,
    iconFrames,
    setIconFrame,
  } = useCanvasStore();

  const frames = iconFrameCounts[screenIdx]?.[assetName] || 1;
  const currentFrame = iconFrames[screenIdx]?.[assetName] || 0;
  const orientation = iconOrientations[screenIdx]?.[assetName] || "vertical";

  return (
    <div className={`p-4 rounded-xl space-y-3 transition-colors ${
      isViewMode
        ? "bg-emerald-500/5 border border-emerald-500/10"
        : "bg-amber-500/5 border border-amber-500/10"
    }`}>
      <div className="flex items-center justify-between">
        <h4 className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
          isViewMode ? "text-emerald-400/80" : "text-amber-400/80"
        }`}>
          <LayoutGrid className="w-3 h-3" /> Frame Preview
        </h4>
        <span className={`text-[10px] font-mono ${isViewMode ? "text-emerald-400" : "text-amber-400"}`}>
          {currentFrame + 1} / {frames}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max={Math.max(0, frames - 1)}
        value={currentFrame}
        onChange={(e) => setIconFrame(screenIdx, assetName, parseInt(e.target.value))}
        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${
          isViewMode ? "accent-emerald-500" : "accent-amber-500"
        } bg-white/10`}
      />

      {!isViewMode && (
        <div className="pt-3 border-t border-amber-500/10 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] uppercase text-muted-foreground font-bold ml-1">
                Frames
              </label>
              <input
                type="number"
                min="1"
                value={frames}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  setIconFrameCount(screenIdx, assetName, Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-amber-500/30 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase text-muted-foreground font-bold ml-1">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) =>
                  setIconOrientation(screenIdx, assetName, e.target.value as "horizontal" | "vertical")
                }
                className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white outline-none cursor-pointer hover:bg-black/60 transition-all"
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
