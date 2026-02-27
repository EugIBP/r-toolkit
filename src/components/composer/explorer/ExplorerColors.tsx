import { useCanvasStore } from "@/store/useCanvasStore";
import { useProjectStore } from "@/store/useProjectStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaintBucket, Palette, Plus } from "lucide-react";

export function ExplorerColors() {
  const { projectData, addColor } = useProjectStore();
  const { selectedColorKey, setSelectedColorKey, canvasMode } =
    useCanvasStore();

  if (!projectData) return null;

  const isEditMode = canvasMode === "edit";

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="flex flex-col gap-2 px-3 py-3 border-b border-white/5 bg-white/[0.01] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 ml-1">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Colors
            </span>
          </div>
          <button
            onClick={() => isEditMode && addColor("NEW_COLOR", "#00ffffff")}
            disabled={!isEditMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isEditMode
                ? "bg-primary/20 text-primary hover:bg-primary/30 ring-1 ring-primary/30"
                : "bg-white/5 text-muted-foreground cursor-not-allowed opacity-50"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Color
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-3 space-y-2 pb-20">
          {Object.entries(projectData.Colors).length === 0 ? (
            <div className="py-10 text-center opacity-30 text-[10px] uppercase tracking-widest font-medium">
              No colors defined
            </div>
          ) : (
            Object.entries(projectData.Colors).map(
              ([name]: [string, any]) => (
                <div
                  key={name}
                  onClick={() => setSelectedColorKey(name)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-xl cursor-pointer transition-all group ${
                    selectedColorKey === name
                      ? "bg-primary/20 border border-primary/30 shadow-sm"
                      : "bg-white/5 border border-transparent hover:bg-white/10"
                  }`}
                >
                  <PaintBucket className="w-5 h-5 shrink-0 opacity-60" />
                  <span className="truncate text-xs font-semibold uppercase tracking-wide">
                    {name}
                  </span>
                </div>
              ),
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
