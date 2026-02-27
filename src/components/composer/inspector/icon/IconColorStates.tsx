import { Plus, Trash2, PaintBucket, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  screenIdx: number;
  iconIdx: number;
  assetName: string;
  isViewMode: boolean;
}

const getDisplayHex = (color: string) => {
  if (color.length === 9 && color.startsWith("#00")) {
    return "#" + color.substring(3);
  }
  return color;
};

export function IconColorStates({ screenIdx, iconIdx, assetName, isViewMode }: Props) {
  const { projectData, addIconState, updateIconState, deleteIconState } = useProjectStore();
  const { selectedStates, setSelectedState } = useCanvasStore();
  const { confirm } = useAppStore();

  if (!projectData) return null;
  const icon = projectData.Screens[screenIdx]?.Icons[iconIdx];
  if (!icon) return null;

  const activeStateIdx = selectedStates[`${screenIdx}_${assetName}`];

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-2">
          <PaintBucket className="w-3 h-3 text-blue-400" /> Color States
        </h4>
        {!isViewMode && (
          <button
            onClick={() => addIconState(screenIdx, iconIdx)}
            className="p-1 hover:bg-blue-500/20 text-blue-400 bg-blue-500/10 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <ScrollArea className="pr-4 -mr-4">
        <div className="space-y-2">
          {icon.States?.map((state: any, idx: number) => {
            const isPreviewing = activeStateIdx === idx;
            const colorHex = getDisplayHex(projectData.Colors[state.Color] || "#fff");

            const showColoring = isViewMode && isPreviewing;

            return (
              <button
                key={idx}
                onClick={() => setSelectedState(screenIdx, assetName, isPreviewing ? null : idx)}
                className={`group relative w-full rounded-xl border transition-all duration-200 text-left ${
                  showColoring
                    ? "bg-primary/20 border-primary/30 shadow-lg cursor-pointer"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10 cursor-pointer"
                }`}
                style={showColoring ? { backgroundColor: `${colorHex}30` } : undefined}
              >
                <div className="flex items-start gap-3 p-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      value={state.Name}
                      readOnly={isViewMode}
                      onChange={(e) =>
                        updateIconState(screenIdx, iconIdx, idx, { Name: e.target.value.toUpperCase() })
                      }
                      className={`w-full rounded-md py-1.5 px-2 text-[10px] font-bold outline-none transition-colors ${
                        isViewMode
                          ? "bg-transparent border-none text-white cursor-pointer pointer-events-none"
                          : "bg-black/40 border border-white/5 text-white focus:border-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
                      }`}
                      placeholder="STATE NAME"
                    />
                    {!isViewMode && (
                      <div className="flex gap-2">
                        <div
                          className="w-8 h-8 rounded-md border border-white/5 bg-black/40 shrink-0"
                          style={{ backgroundColor: colorHex }}
                        />
                        <select
                          value={state.Color}
                          disabled={isViewMode}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            updateIconState(screenIdx, iconIdx, idx, { Color: e.target.value });
                            setSelectedState(screenIdx, assetName, idx);
                          }}
                          className="flex-1 bg-black/40 hover:bg-black/60 border border-white/5 rounded-md py-1.5 px-2 text-[9px] font-bold text-muted-foreground hover:text-white outline-none cursor-pointer appearance-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {Object.keys(projectData.Colors).map((c) => (
                            <option key={c} value={c} className="bg-[#121212]">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {!isViewMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-muted-foreground/50 hover:text-white hover:bg-white/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#121212] border-white/10 text-white min-w-[140px] z-50"
                      >
                        <DropdownMenuItem
                          onClick={async () => {
                            if (await confirm("Delete State", `Remove "${state.Name}"?`))
                              deleteIconState(screenIdx, iconIdx, idx);
                          }}
                          className="gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
