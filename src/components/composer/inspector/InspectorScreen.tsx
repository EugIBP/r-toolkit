import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Monitor, Grid3X3, Save, FileJson, Clock, Layers } from "lucide-react";

export function InspectorScreen() {
  const { projectData, updateScreen, saveProject } = useProjectStore();
  const {
    snapToGrid,
    setSnapToGrid,
    gridSize,
    setGridSize,
    allowDnd,
    saveWorkspace,
    autoSaveEnabled,
    setAutoSaveEnabled,
    autoSaveInterval,
    setAutoSaveInterval,
    hasUnsavedChanges,
    activeScreenIdx,
    canvasMode,
    stackThreshold,
    setStackThreshold,
    assetFilter, // Достаем текущий фильтр
  } = useCanvasStore();

  const currentScreen = projectData?.Screens?.[activeScreenIdx];
  const [nameValue, setNameValue] = useState(currentScreen?.Name ?? "");

  useEffect(() => {
    setNameValue(currentScreen?.Name ?? "");
  }, [activeScreenIdx, currentScreen?.Name]);

  if (!projectData) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full animate-in fade-in slide-in-from-right-2 duration-200">
      {/* Скроллируемая область настроек */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-4 pb-6">
          {/* SECTION: SCREEN INFO */}
          <div className="flex flex-col gap-3 bg-muted/10 p-4 rounded-xl border border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary opacity-80" /> Screen
              Info
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                Screen Name
              </label>
              {canvasMode === "edit" ? (
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={() => {
                    const trimmed = nameValue.trim();
                    if (trimmed && trimmed !== currentScreen?.Name) {
                      updateScreen(activeScreenIdx, { Name: trimmed });
                    } else {
                      setNameValue(currentScreen?.Name ?? "");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="h-8 bg-muted/50 border-border text-xs font-medium" // Убрали font-mono
                />
              ) : (
                <div className="h-8 flex items-center px-3 bg-muted/30 border border-border rounded-md text-xs font-medium text-foreground/80">
                  {currentScreen?.Name ?? "—"}
                </div>
              )}
            </div>

            <div className="space-y-1.5 mt-1">
              <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                Display Size
              </label>
              <div className="text-xs font-medium text-foreground/80">
                {projectData.DisplayWidth} × {projectData.DisplayHeight}
              </div>
            </div>
          </div>

          {/* SECTION: CANVAS SETTINGS (Stack Threshold) - Показываем только при фильтре Stacked */}
          {assetFilter === "stacked" && (
            <div className="flex flex-col gap-3 bg-muted/10 p-4 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400 opacity-80" /> Canvas
                Settings
              </h3>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-foreground font-medium tracking-wider">
                  Stack Threshold (px)
                </label>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Icons placed closer than this distance will be visually
                  grouped into a stack on the canvas.
                </p>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={stackThreshold}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setStackThreshold(parseInt(e.target.value) || 5)
                  }
                  className="h-8 bg-muted/50 border-border text-xs font-medium [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          )}

          {/* SECTION: GRID SYSTEM */}
          <div
            className={`flex flex-col gap-3 bg-muted/10 p-4 rounded-xl border border-border transition-opacity ${!allowDnd ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-blue-400 opacity-80" /> Grid
              System
            </h3>

            <div
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                snapToGrid
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-muted/50 border-border"
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`text-xs font-bold ${snapToGrid ? "text-blue-400" : "text-foreground"}`}
                >
                  Snap to Grid
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Lock to pixel grid
                </span>
              </div>

              <div
                className={`w-8 h-4 rounded-full relative transition-colors ${snapToGrid ? "bg-blue-500" : "bg-muted"}`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${snapToGrid ? "left-4" : "left-0.5"}`}
                />
              </div>
            </div>

            {snapToGrid && (
              <div className="space-y-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
                <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                  Grid Step Size
                </label>
                <Input
                  type="number"
                  value={gridSize}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="h-8 bg-muted/50 border-border text-xs font-medium [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Убрали font-mono
                />
              </div>
            )}
          </div>

          {/* SECTION: AUTO-SAVE */}
          <div className="flex flex-col gap-3 bg-muted/10 p-4 rounded-xl border border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400 opacity-80" /> Auto-Save
            </h3>

            <div
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                autoSaveEnabled
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-muted/50 border-border"
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`text-xs font-bold ${autoSaveEnabled ? "text-purple-400" : "text-foreground"}`}
                >
                  Auto-Save
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {autoSaveEnabled
                    ? "Settings save automatically"
                    : "Click to enable"}
                </span>
              </div>

              <div
                className={`w-8 h-4 rounded-full relative transition-colors ${autoSaveEnabled ? "bg-purple-500" : "bg-muted"}`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoSaveEnabled ? "left-4" : "left-0.5"}`}
                />
              </div>
            </div>

            {autoSaveEnabled && (
              <div className="space-y-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
                <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                  Save Interval (seconds)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={autoSaveInterval / 1000}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setAutoSaveInterval(Number(e.target.value) * 1000)
                  }
                  className="h-8 bg-muted/50 border-border text-xs font-medium [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Убрали font-mono
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* FOOTER PANELS: Save Buttons */}
      <div className="border-t border-border bg-muted/30 p-4 space-y-3 shrink-0">
        <Button
          onClick={saveWorkspace}
          variant={hasUnsavedChanges ? "default" : "secondary"}
          className={`w-full gap-2 ${
            hasUnsavedChanges
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-900/20"
              : "text-muted-foreground"
          }`}
        >
          <Save className="w-4 h-4" />
          Save Workspace
          {hasUnsavedChanges && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-1" />
          )}
        </Button>

        <Button
          onClick={saveProject}
          variant="outline"
          className="w-full gap-2 text-amber-500 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-600"
        >
          <FileJson className="w-4 h-4" /> Save Project
        </Button>
      </div>
    </div>
  );
}
