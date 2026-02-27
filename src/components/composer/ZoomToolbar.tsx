import { useCanvasStore } from "@/store/useCanvasStore";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ZoomToolbar() {
  const { zoom, setZoom } = useCanvasStore();

  return (
    <div className="absolute bottom-6 right-8 z-50 flex items-center p-1.5 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setZoom(Math.max(zoom - 0.1, 0.25))}
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      
      <div className="min-w-[60px] flex items-center justify-center px-3 py-1.5 bg-white/5 rounded-xl text-sm font-mono text-white">
        {Math.round(zoom * 100)}%
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      
      <div className="w-px h-5 bg-white/10 mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setZoom(1)}
        title="Reset Zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}
