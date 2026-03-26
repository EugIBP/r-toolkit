import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import {
  X,
  Grid3X3,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Columns,
  Rows,
  Check,
  Grid,
  Component,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LayoutGrid } from "@/types/project";

export function LayoutManagerModal() {
  const { isSettingsOpen, setSettingsOpen } = useAppStore();
  const {
    activeScreenIdx,
    screenLayouts,
    addLayout,
    updateLayout,
    deleteLayout,
    duplicateLayout,
    setScreenLayouts,
  } = useCanvasStore();

  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [initialLayouts, setInitialLayouts] = useState<LayoutGrid[]>([]);

  const layouts = screenLayouts[activeScreenIdx] || [];

  useEffect(() => {
    if (isSettingsOpen) {
      setInitialLayouts(JSON.parse(JSON.stringify(layouts)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSettingsOpen, activeScreenIdx]);

  useEffect(() => {
    if (layouts.length > 0 && !selectedLayoutId) {
      setSelectedLayoutId(layouts[0].id);
    } else if (layouts.length === 0) {
      setSelectedLayoutId(null);
    }
  }, [layouts, selectedLayoutId]);

  if (!isSettingsOpen) return null;

  const activeLayout = layouts.find((l) => l.id === selectedLayoutId);
  const isIslands = activeLayout?.type === "islands";
  const isMesh = activeLayout?.type === "mesh";

  const handleAdd = () => {
    const newId = addLayout(activeScreenIdx);
    setSelectedLayoutId(newId);
  };

  const handleDuplicate = (id: string) => {
    const newId = duplicateLayout(activeScreenIdx, id);
    if (newId) setSelectedLayoutId(newId);
  };

  const handleDelete = (id: string) => {
    deleteLayout(activeScreenIdx, id);
    if (selectedLayoutId === id) {
      const remaining = layouts.filter((l) => l.id !== id);
      if (remaining.length > 0) setSelectedLayoutId(remaining[0].id);
      else setSelectedLayoutId(null);
    }
  };

  const handleCancel = () => {
    setScreenLayouts(activeScreenIdx, initialLayouts);
    setSettingsOpen(false);
  };

  const handleDone = () => {
    setSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 w-[700px] h-[550px] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-muted/30">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-primary" /> Layout Grids Manager
          </h2>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-[260px] shrink-0 border-r border-white/10 flex flex-col min-h-0 bg-muted/10">
            <div className="p-3 border-b border-white/5 shrink-0 flex justify-between items-center bg-muted/20">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Screen Grids
              </span>

              <div className="flex items-center gap-1">
                {activeLayout && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDuplicate(activeLayout.id)}
                      className="hover:bg-primary/20 hover:text-primary text-muted-foreground"
                      title="Duplicate Selected"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(activeLayout.id)}
                      className="hover:bg-destructive/20 hover:text-destructive text-muted-foreground"
                      title="Delete Selected"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <div className="w-px h-3 bg-border mx-1" />
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleAdd}
                  className="hover:bg-primary/20 hover:text-primary text-muted-foreground"
                  title="Add New Grid"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-2 space-y-1">
                {layouts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground opacity-50">
                    No grids added
                  </div>
                ) : (
                  layouts.map((layout) => (
                    <div
                      key={layout.id}
                      onClick={() => setSelectedLayoutId(layout.id)}
                      className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedLayoutId === layout.id
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-white/5 text-muted-foreground"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLayout(activeScreenIdx, layout.id, {
                            visible: !layout.visible,
                          });
                        }}
                        className="shrink-0 hover:text-white transition-colors"
                      >
                        {layout.visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 opacity-50" />
                        )}
                      </button>
                      <span className="text-xs font-medium truncate flex-1">
                        {layout.name}
                      </span>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/10"
                        style={{ backgroundColor: layout.color }}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-background relative">
            {activeLayout ? (
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                        Name
                      </label>
                      <Input
                        value={activeLayout.name}
                        onChange={(e) =>
                          updateLayout(activeScreenIdx, activeLayout.id, {
                            name: e.target.value,
                          })
                        }
                        className="h-8 text-xs bg-muted/50 border-border"
                      />
                    </div>
                    <div className="shrink-0 space-y-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                        Color
                      </label>
                      <div className="relative w-8 h-8 rounded-md overflow-hidden border border-border shadow-sm">
                        <input
                          type="color"
                          value={activeLayout.color}
                          onChange={(e) =>
                            updateLayout(activeScreenIdx, activeLayout.id, {
                              color: e.target.value,
                            })
                          }
                          className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                      Type
                    </label>
                    <div className="flex bg-muted/30 border border-border rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateLayout(activeScreenIdx, activeLayout.id, {
                            type: "columns",
                          })
                        }
                        className={`flex-1 flex items-center justify-center gap-2 h-8 text-[11px] font-medium rounded-md transition-all ${activeLayout.type === "columns" ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:text-white"}`}
                      >
                        <Columns className="w-3.5 h-3.5" /> Cols
                      </button>
                      <button
                        onClick={() =>
                          updateLayout(activeScreenIdx, activeLayout.id, {
                            type: "rows",
                          })
                        }
                        className={`flex-1 flex items-center justify-center gap-2 h-8 text-[11px] font-medium rounded-md transition-all ${activeLayout.type === "rows" ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:text-white"}`}
                      >
                        <Rows className="w-3.5 h-3.5" /> Rows
                      </button>
                      <button
                        onClick={() =>
                          updateLayout(activeScreenIdx, activeLayout.id, {
                            type: "mesh",
                          })
                        }
                        className={`flex-1 flex items-center justify-center gap-2 h-8 text-[11px] font-medium rounded-md transition-all ${activeLayout.type === "mesh" ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:text-white"}`}
                      >
                        <Grid className="w-3.5 h-3.5" /> Mesh
                      </button>
                      <button
                        onClick={() =>
                          updateLayout(activeScreenIdx, activeLayout.id, {
                            type: "islands",
                          })
                        }
                        className={`flex-1 flex items-center justify-center gap-2 h-8 text-[11px] font-medium rounded-md transition-all ${activeLayout.type === "islands" ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:text-white"}`}
                      >
                        <Component className="w-3.5 h-3.5" /> Islands
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {!isMesh && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                          {isIslands ? "Cols" : "Count"}
                        </label>
                        <Input
                          type="number"
                          min={1}
                          value={activeLayout.count}
                          onChange={(e) =>
                            updateLayout(activeScreenIdx, activeLayout.id, {
                              count: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="h-8 text-xs bg-muted/50 border-border"
                        />
                      </div>
                    )}
                    {isIslands && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                          Rows
                        </label>
                        <Input
                          type="number"
                          min={1}
                          value={activeLayout.rows || 1}
                          onChange={(e) =>
                            updateLayout(activeScreenIdx, activeLayout.id, {
                              rows: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="h-8 text-xs bg-muted/50 border-border"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                        {isMesh || isIslands
                          ? "Cell Size"
                          : activeLayout.type === "columns"
                            ? "Width"
                            : "Height"}
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={activeLayout.size}
                        onChange={(e) =>
                          updateLayout(activeScreenIdx, activeLayout.id, {
                            size: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="h-8 text-xs bg-muted/50 border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                        {isMesh || isIslands ? "Offset X" : "Offset"}
                      </label>
                      <Input
                        type="number"
                        value={activeLayout.offset}
                        onChange={(e) =>
                          updateLayout(activeScreenIdx, activeLayout.id, {
                            offset: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs bg-muted/50 border-border"
                      />
                    </div>
                    {(isMesh || isIslands) && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                          Offset Y
                        </label>
                        <Input
                          type="number"
                          value={activeLayout.offsetY || 0}
                          onChange={(e) =>
                            updateLayout(activeScreenIdx, activeLayout.id, {
                              offsetY: parseInt(e.target.value) || 0,
                            })
                          }
                          className="h-8 text-xs bg-muted/50 border-border"
                        />
                      </div>
                    )}
                  </div>

                  {!isMesh && !isIslands && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider flex justify-between">
                        <span>Gaps (px)</span>
                        <span className="normal-case font-normal opacity-50">
                          e.g. 10 or 0, 20, 5
                        </span>
                      </label>
                      <Input
                        value={activeLayout.gaps}
                        onChange={(e) =>
                          updateLayout(activeScreenIdx, activeLayout.id, {
                            gaps: e.target.value,
                          })
                        }
                        className="h-8 text-xs bg-muted/50 font-mono border-border"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col gap-3 items-center justify-center text-muted-foreground opacity-50">
                <Grid3X3 className="w-10 h-10" />
                <span className="text-xs">Select or create a layout grid</span>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-4 border-t border-white/10 bg-muted/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleDone}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm"
          >
            <Check className="w-4 h-4" /> Done
          </Button>
        </div>
      </div>
    </div>
  );
}
