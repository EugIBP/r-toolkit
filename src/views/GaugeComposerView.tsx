import { GaugeExplorer } from "@/components/gauges/GaugeExplorer";
import { GaugeInspector } from "@/components/gauges/GaugeInspector";
import { GaugeCanvas } from "@/components/gauges/GaugeCanvas";
import { useAppStore } from "@/store/useAppStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useGaugeStore } from "@/store/useGaugeStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Gauge as GaugeIcon, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/ui/back-button";
import { useMemo, useEffect } from "react";

export const GaugeComposerView = () => {
  const { projectPath } = useProjectStore();
  const { recentProjects, setCurrentView, setWorkspaceTab } = useAppStore();
  const { activeType, openGaugeGenerator, selectGauge } = useGaugeStore();
  const { zoom, setZoom, resetZoom } = useCanvasStore();

  const currentProjectDisplayName = useMemo(() => {
    if (!projectPath) return null;
    const project = recentProjects.find((p) => p.path === projectPath);
    return project?.displayName || "Select Project";
  }, [projectPath, recentProjects]);

  const handleBack = () => {
    setWorkspaceTab("tools");
    setCurrentView("dashboard");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "Escape") {
        selectGauge(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectGauge]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <aside className="shrink-0 flex flex-col border-r border-border bg-[#121212] w-95 z-10">
        <div className="h-20 px-5 flex items-center border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <BackButton
              label="Back"
              onClick={handleBack}
              className="shrink-0"
            />
            {currentProjectDisplayName && (
              <>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <span
                  className="text-xs font-medium text-muted-foreground truncate max-w-[150px]"
                  title={currentProjectDisplayName}
                >
                  {currentProjectDisplayName}
                </span>
              </>
            )}
          </div>
        </div>
        <GaugeExplorer />
      </aside>

      <div className="flex-1 relative flex flex-col min-w-0 bg-bg-canvas">
        <div className="h-[80px] shrink-0 flex items-center border-b border-border bg-muted/30 px-10 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <GaugeIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Gauge Composer
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Asset Generator Mode
              </span>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted/50 border border-border p-1">
              <AssetTypeBtn
                active={activeType === "arrow"}
                onClick={() => openGaugeGenerator("arrow")}
                label="Arrow"
              />
              <AssetTypeBtn
                active={activeType === "arc"}
                onClick={() => openGaugeGenerator("arc")}
                label="Arc"
              />
              <AssetTypeBtn
                active={activeType === "slider"}
                onClick={() => openGaugeGenerator("slider")}
                label="Slider"
              />
            </div>
          </div>

          <div className="absolute right-10 flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium">
              Zoom
            </span>
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-md"
                onClick={() => setZoom(Math.max(zoom - 0.1, 0.1))}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 py-1 text-xs font-medium min-w-[50px] text-center text-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-md"
                onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Separator
                orientation="vertical"
                className="h-4 mx-1 opacity-50"
              />
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-md"
                onClick={resetZoom}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <GaugeCanvas />
        </div>
      </div>

      <GaugeInspector />
    </div>
  );
};

function AssetTypeBtn({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-md text-[11px] font-bold transition-all focus-visible:outline-none ${
        active
          ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30"
          : "text-muted-foreground hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
