import { Plus, Trash2, PaintBucket, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  if (color.length === 9 && color.startsWith("#00"))
    return "#" + color.substring(3);
  return color;
};

export function IconColorStates({
  screenIdx,
  iconIdx,
  assetName,
  isViewMode,
}: Props) {
  const { projectData, addIconState, updateIconState, deleteIconState } =
    useProjectStore();
  const { selectedStates, setSelectedState } = useCanvasStore();
  const { confirm } = useAppStore();

  if (!projectData) return null;
  const icon = projectData.Screens[screenIdx]?.Icons[iconIdx];
  if (!icon) return null;

  const activeStateIdx = selectedStates[`${screenIdx}_${assetName}`];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <PaintBucket className="w-3 h-3 text-primary" /> Color States
        </h4>
        {!isViewMode && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addIconState(screenIdx, iconIdx)}
            className="w-6 h-6 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {icon.States?.map((state: any, idx: number) => {
          const isPreviewing = activeStateIdx === idx;
          const colorHex = getDisplayHex(
            projectData.Colors[state.Color] || "#fff",
          );
          const showColoring = isViewMode && isPreviewing;

          return (
            <div
              key={idx}
              onClick={() =>
                setSelectedState(
                  screenIdx,
                  assetName,
                  isPreviewing ? null : idx,
                )
              }
              className={`group relative w-full rounded-xl border transition-all duration-200 text-left overflow-hidden ${
                showColoring
                  ? "bg-primary/10 border-primary/30 shadow-sm"
                  : isPreviewing
                    ? "bg-muted/30 border-primary/50 ring-1 ring-primary/20"
                    : "bg-muted/10 border-border hover:border-border/80"
              }`}
              style={
                showColoring ? { backgroundColor: `${colorHex}15` } : undefined
              }
            >
              <div className="flex items-start gap-3 p-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <Input
                    value={state.Name}
                    readOnly={isViewMode}
                    onChange={(e) =>
                      updateIconState(screenIdx, iconIdx, idx, {
                        Name: e.target.value.toUpperCase(),
                      })
                    }
                    className={`h-8 px-3 text-xs font-bold transition-colors ${isViewMode ? "bg-transparent border-transparent cursor-pointer shadow-none px-0" : "bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"}`}
                    placeholder="STATE NAME"
                  />
                  {!isViewMode && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-md border border-border shadow-sm shrink-0"
                        style={{ backgroundColor: colorHex }}
                      />
                      <select
                        value={state.Color}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          updateIconState(screenIdx, iconIdx, idx, {
                            Color: e.target.value,
                          });
                          setSelectedState(screenIdx, assetName, idx);
                        }}
                        className="flex h-8 w-full items-center justify-between rounded-md border border-border/50 bg-background px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                      >
                        {Object.keys(projectData.Colors).map((c) => (
                          <option key={c} value={c}>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={async () => {
                          if (
                            await confirm(
                              "Delete State",
                              `Remove "${state.Name}"?`,
                            )
                          )
                            deleteIconState(screenIdx, iconIdx, idx);
                        }}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive text-xs gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete State
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
