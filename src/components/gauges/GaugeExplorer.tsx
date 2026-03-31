import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useGaugeStore } from "@/store/useGaugeStore";
import { invoke } from "@tauri-apps/api/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Layout,
  Gauge,
  ChevronRight,
  ChevronLeft,
  HardDrive,
  FolderOpen,
  Box,
  PlusCircle,
  Loader2,
  Trash2,
  Copy,
} from "lucide-react";
import { ProjectData } from "@/types/project";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export const GaugeExplorer = () => {
  const { recentProjects, loadRecent, loadSettings } = useAppStore();
  const { projectData, setProject, baseDir } = useProjectStore();
  const { activeScreenIdx, setActiveScreenIdx, resetCanvas, loadWorkspace } =
    useCanvasStore();
  const {
    activeType,
    arrows,
    selectedGaugeId,
    selectGauge,
    addGauge,
    deleteGauge,
    duplicateGauge,
    loadGauges,
  } = useGaugeStore();

  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<"projects" | "screens" | "detail">(
    projectData ? "screens" : "projects",
  );

  useEffect(() => {
    const initializeView = async () => {
      setIsLoading(true);
      try {
        await loadRecent();
        await loadSettings();
        if (!projectData) {
          setMode("projects");
        } else {
          if (baseDir) await loadGauges(baseDir);
          setMode("screens");
        }
      } catch (err) {
        console.error("Init failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeView();
  }, []);

  const handleLoadProject = async (path: string, name: string) => {
    try {
      resetCanvas();
      const content = await invoke<string>("load_project", { filePath: path });
      const data = JSON.parse(content) as ProjectData;
      const lastIdx = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
      const dir = path.substring(0, lastIdx);

      await setProject(data, path);
      await loadWorkspace(dir);
      await loadGauges(dir);

      setMode("screens");
      toast.success(`Workspace loaded: ${name}`);
    } catch (err) {
      toast.error("Failed to load workspace");
    }
  };

  const handleScreenSelect = (idx: number) => {
    setActiveScreenIdx(idx);
    setMode("detail");
  };

  const filteredArrows = useMemo(() => {
    return arrows.filter((a) => (a.type || "arrow") === activeType);
  }, [arrows, activeType]);

  const activeTypeName =
    activeType === "arc"
      ? "Arcs"
      : activeType === "slider"
        ? "Sliders"
        : "Arrows";

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
        <span className="text-[11px] font-bold uppercase tracking-widest">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ScrollArea className="flex-1 w-full">
        <div className="p-4 space-y-6 pb-6">
          {mode === "projects" && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-primary" /> Recent
                Workspaces
              </h3>
              {recentProjects.length === 0 ? (
                <div className="py-10 text-center opacity-30 border-2 border-dashed border-white/5 rounded-2xl mx-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest px-4">
                    No projects found
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recentProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleLoadProject(p.path, p.displayName)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all text-left border border-transparent hover:border-white/5 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10 group-hover:border-primary/30 transition-colors">
                        <FolderOpen className="w-4.5 h-4.5 text-primary opacity-80" />
                      </div>
                      <span className="text-sm font-semibold text-foreground/90 truncate">
                        {p.displayName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === "screens" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Select Context Screen
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("projects")}
                  className="h-6 px-2.5 text-[10px] uppercase font-bold tracking-wider"
                >
                  Switch Project
                </Button>
              </div>
              <div className="space-y-1">
                {projectData?.Screens.map((screen, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleScreenSelect(idx)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                      idx === activeScreenIdx
                        ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.05)]"
                        : "border-transparent text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/20 border border-white/5 shrink-0">
                      <Layout className="w-4 h-4 opacity-60" />
                    </div>
                    <span className="text-xs font-bold truncate">
                      {screen.Name}
                    </span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "detail" && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("screens")}
                  className="h-7 px-2 -ml-2 text-[10px] font-bold uppercase text-muted-foreground"
                >
                  <ChevronLeft className="w-3 h-3 mr-1" /> Screens
                </Button>
                <div className="flex items-center gap-2 bg-primary/10 px-2 py-0.5 rounded border border-primary/20 max-w-[120px]">
                  <Layout className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-[10px] font-bold text-primary truncate uppercase">
                    {projectData?.Screens[activeScreenIdx]?.Name}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Gauge className="w-3 h-3 text-emerald-500" />{" "}
                    {activeTypeName}
                  </h3>
                  <button
                    onClick={addGauge}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {filteredArrows.length === 0 ? (
                    <div className="py-8 text-center opacity-20 border-2 border-dashed border-white/5 rounded-2xl mx-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest px-4">
                        No {activeTypeName.toLowerCase()}
                      </p>
                    </div>
                  ) : (
                    filteredArrows.map((arrow) => (
                      <ContextMenu key={arrow.id}>
                        <ContextMenuTrigger asChild>
                          <button
                            onClick={() => selectGauge(arrow.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                              selectedGaugeId === arrow.id
                                ? "bg-primary/20 border-primary/40 text-primary shadow-sm"
                                : "bg-white/[0.03] border-transparent text-muted-foreground hover:border-white/10"
                            }`}
                          >
                            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                              <Box className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold truncate">
                              {arrow.id}
                            </span>
                            <div
                              className={`w-1.5 h-1.5 rounded-full ml-auto shrink-0 transition-colors ${selectedGaugeId === arrow.id ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-muted-foreground opacity-50"}`}
                            />
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-40">
                          <ContextMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateGauge(arrow.id);
                            }}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Copy className="w-3.5 h-3.5 opacity-70" />{" "}
                            Duplicate
                          </ContextMenuItem>
                          <ContextMenuSeparator className="bg-border/50" />
                          <ContextMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGauge(arrow.id);
                            }}
                            className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
