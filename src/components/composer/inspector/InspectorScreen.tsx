import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Monitor, Grid3X3, Save, FileJson, Keyboard, Clock } from "lucide-react";

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
  } = useCanvasStore();

  const currentScreen = projectData?.Screens?.[activeScreenIdx];
  const [nameValue, setNameValue] = useState(currentScreen?.Name ?? "");

  useEffect(() => {
    setNameValue(currentScreen?.Name ?? "");
  }, [activeScreenIdx, currentScreen?.Name]);

  if (!projectData) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Scrollable Content */}
      <ScrollArea className="flex-1 min-h-0">
      <div className="px-5 py-6 space-y-8">
        {/* SECTION: CANVAS INFO */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-2">
            <Monitor className="w-3 h-3" /> Canvas Info
          </h3>
          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <div className="text-[8px] uppercase text-muted-foreground font-bold mb-2">
              Screen Name
            </div>
            {canvasMode === "edit" ? (
              <input
                type="text"
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
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") {
                    setNameValue(currentScreen?.Name ?? "");
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white outline-none focus:border-primary/40 transition-all"
              />
            ) : (
              <div className="text-xs font-mono text-white/80">
                {currentScreen?.Name ?? "—"}
              </div>
            )}
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <div className="text-[8px] uppercase text-muted-foreground font-bold mb-2">
              Display Size
            </div>
            <div className="text-xs font-mono text-white/80">
              {projectData.DisplayWidth}×{projectData.DisplayHeight}
            </div>
          </div>
        </div>

        {/* SECTION: GRID - Always visible, disabled when DnD is off */}
        <div className={`space-y-4 pt-4 border-t border-white/5 ${!allowDnd ? "pointer-events-none opacity-50 cursor-not-allowed" : ""}`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-2">
              <Grid3X3 className="w-3 h-3" /> Grid System
            </h3>

            <div
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                snapToGrid
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white">
                  Snap to Grid
                </span>
                <span className="text-[9px] text-muted-foreground">
                  Lock to pixel grid
                </span>
              </div>
              <div
                className={`w-8 h-4 rounded-full relative transition-colors ${snapToGrid ? "bg-blue-500" : "bg-white/10"}`}
              >
                <div
                  className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${snapToGrid ? "left-5" : "left-1"}`}
                />
              </div>
            </div>

            {snapToGrid && (
              <div className="space-y-2">
                <label className="text-[8px] uppercase text-muted-foreground font-bold ml-1">
                  Grid Step Size
                </label>
                <input
                  type="number"
                  value={gridSize}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-xs font-mono text-white outline-none focus:border-primary/40 transition-all"
                />
              </div>
            )}
          </div>

        {/* SECTION: AUTO-SAVE */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-2">
            <Clock className="w-3 h-3" /> Auto-Save
          </h3>

          {/* Enable/Disable Toggle */}
          <div
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              autoSaveEnabled
                ? "bg-purple-500/20 border-purple-500/40 shadow-sm"
                : "bg-white/5 border-white/5"
            }`}
          >
            <div className="flex flex-col">
              <span className={`text-[11px] font-bold ${autoSaveEnabled ? "text-purple-400" : "text-white"}`}>
                Auto-Save
              </span>
              <span className="text-[9px] text-muted-foreground">
                {autoSaveEnabled ? "Enabled - settings will be saved automatically" : "Click to enable auto-save"}
              </span>
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${autoSaveEnabled ? "bg-purple-500" : "bg-white/10"}`}
            >
              <div
                className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${autoSaveEnabled ? "left-5" : "left-1"}`}
              />
            </div>
          </div>

          {/* Interval Input - Only visible when auto-save is enabled */}
          {autoSaveEnabled && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-[8px] uppercase text-muted-foreground font-bold ml-1">
                Save Interval (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={autoSaveInterval / 1000}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAutoSaveInterval(Number(e.target.value) * 1000)}
                className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-xs font-mono text-white outline-none focus:border-purple-500/40 transition-all"
              />
            </div>
          )}
        </div>

      </div>
      </ScrollArea>

      {/* FOOTER PANELS - Fixed at bottom */}
      <div className="border-t border-white/5 bg-[#0a0a0a]">
        {/* Panel 1: Keyboard Shortcuts */}
        <div className="p-5 space-y-3">
          <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
            <Keyboard className="w-3 h-3" /> Shortcuts
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Pan Canvas</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">MMB</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">drag</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Zoom</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Scroll</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Search</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">K</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Save Workspace</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">S</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Save Project</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Shift</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">S</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Undo</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Z</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Redo</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Shift</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">Z</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-5" />

        {/* Panel 2: Save Buttons */}
        <div className="p-5 py-6 space-y-3">
          <button
            onClick={saveWorkspace}
            className={`w-full flex items-center justify-center gap-2 py-3.5 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
              hasUnsavedChanges
                ? "bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30 ring-1 ring-purple-500/30"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }`}
          >
            <Save className="w-3.5 h-3.5" /> 
            Save Workspace
            {hasUnsavedChanges && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse ml-1" />}
          </button>
          <button
            onClick={saveProject}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-amber-400 transition-all active:scale-95"
          >
            <FileJson className="w-3.5 h-3.5" /> Save Project
          </button>
        </div>
      </div>
    </div>
  );
}
