import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { FloatingToolbar } from "@/components/ui/floating-toolbar";
import { Separator } from "@/components/ui/separator";

export function ZoomToolbar() {
  const { zoom, setZoom, resetZoom } = useCanvasStore();

  return (
    <FloatingToolbar position="bottom-right">
      <button
        onClick={() => setZoom(zoom - 0.1)}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <span className="text-xs font-mono w-12 text-center text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <button
        onClick={resetZoom}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        title="Reset Zoom"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </FloatingToolbar>
  );
}
