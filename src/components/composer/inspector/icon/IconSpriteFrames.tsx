import { LayoutGrid } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Input } from "@/components/ui/input";

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
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-primary/80">
          <LayoutGrid className="w-3 h-3" /> Sprite Frames
        </h4>
        <span className="text-[10px] font-mono font-bold text-primary">
          {currentFrame + 1} / {frames}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max={Math.max(0, frames - 1)}
        value={currentFrame}
        onChange={(e) =>
          setIconFrame(screenIdx, assetName, parseInt(e.target.value))
        }
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
      />

      {!isViewMode && (
        <div className="pt-3 border-t border-primary/10 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">
              Frames
            </label>
            <Input
              type="number"
              min="1"
              value={frames}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                setIconFrameCount(
                  screenIdx,
                  assetName,
                  Math.max(1, parseInt(e.target.value) || 1),
                )
              }
              // Добавлен font-medium
              className="h-8 bg-background border-border/50 text-xs font-medium [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">
              Orientation
            </label>
            <select
              value={orientation}
              onChange={(e) =>
                setIconOrientation(
                  screenIdx,
                  assetName,
                  e.target.value as "horizontal" | "vertical",
                )
              }
              className="flex h-8 w-full items-center justify-between rounded-md border border-border/50 bg-background px-3 py-1 text-xs font-medium shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
