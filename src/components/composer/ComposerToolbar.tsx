import { Button } from "@/components/ui/button";
import { FloatingToolbar } from "@/components/ui/floating-toolbar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCanvasStore } from "@/store/useCanvasStore";
import {
  Image as BgIcon,
  Box,
  Film,
  Hand,
  Layers,
  MousePointer2,
  Move,
  RotateCcw,
  Search,
  SquareStack,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export function AssetsToolbar({
  searchInputRef,
}: {
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const {
    searchQuery,
    setSearchQuery,
    assetFilter,
    setAssetFilter,
    setActiveTab,
    stackThreshold,
    setStackThreshold,
  } = useCanvasStore();

  return (
    <div className="absolute top-6 left-8 z-50 flex flex-col items-start p-3 bg-bg-elevated/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-2 w-80">
      {/* ПОИСК */}
      <Input
        variant="dark"
        icon={<Search className="w-3.5 h-3.5" />}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          if (e.target.value) setActiveTab("objects");
        }}
        placeholder="Find asset..."
        className="w-full"
        ref={searchInputRef}
      />

      {/* ФИЛЬТРЫ + THRESHOLD */}
      <div className="flex items-center gap-1 w-full">
        <div className="flex items-center gap-0.5 flex-1 flex-wrap">
          <FilterBtn
            active={assetFilter === "all"}
            onClick={() => {
              setAssetFilter("all");
              setActiveTab("objects");
            }}
            icon={<Layers className="w-4 h-4" />}
            title="All"
          />
          <FilterBtn
            active={assetFilter === "bg"}
            onClick={() => {
              setAssetFilter("bg");
              setActiveTab("objects");
            }}
            icon={<BgIcon className="w-4 h-4" />}
            title="Background"
          />
          <FilterBtn
            active={assetFilter === "icons"}
            onClick={() => {
              setAssetFilter("icons");
              setActiveTab("objects");
            }}
            icon={<Box className="w-4 h-4" />}
            title="Icons"
          />
          <FilterBtn
            active={assetFilter === "sprites"}
            onClick={() => {
              setAssetFilter("sprites");
              setActiveTab("objects");
            }}
            icon={<Film className="w-4 h-4" />}
            title="Sprites"
          />
          <FilterBtn
            active={assetFilter === "stacked"}
            onClick={() => {
              setAssetFilter("stacked");
              setActiveTab("objects");
            }}
            icon={<SquareStack className="w-4 h-4" />}
            title="Stacked"
          />
        </div>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
            Threshold
          </span>
          <input
            type="number"
            min={1}
            max={100}
            value={stackThreshold}
            onChange={(e) => setStackThreshold(parseInt(e.target.value) || 5)}
            className="w-14 h-6 bg-white/5 border border-white/10 rounded px-1.5 text-xs font-medium text-white text-center outline-none focus:border-primary/50 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}

export function ModeToolbar() {
  const { canvasMode, setCanvasMode, allowDnd, setAllowDnd, zoom, setZoom } =
    useCanvasStore();

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 5));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1));
  const handleZoomReset = () => setZoom(0.85);

  return (
    <FloatingToolbar position="top-center">
      <ModeBtn
        active={canvasMode === "view"}
        onClick={() => setCanvasMode("view")}
        icon={<Hand className="w-3.5 h-3.5" />}
        label="View"
        activeClass="bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
      />
      <ModeBtn
        active={canvasMode === "edit"}
        onClick={() => setCanvasMode("edit")}
        icon={<MousePointer2 className="w-3.5 h-3.5" />}
        label="Edit"
        activeClass="bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
      />

      <ModeBtn
        active={allowDnd}
        onClick={() => setAllowDnd(!allowDnd)}
        icon={<Move className="w-3.5 h-3.5" />}
        label="D&D"
        activeClass="bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
      />

      {/* ZOOM CONTROLS */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost-dark"
          size="icon-xs"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <span className="px-2 py-1 text-xs font-mono text-white min-w-[50px] text-center whitespace-nowrap">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost-dark"
          size="icon-xs"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost-dark"
          size="icon-xs"
          onClick={handleZoomReset}
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </FloatingToolbar>
  );
}

/** @deprecated use AssetsToolbar + ModeToolbar */
export function ComposerToolbar() {
  return null;
}

function FilterBtn({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${
        active
          ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30"
          : "text-muted-foreground hover:text-white hover:bg-white/10"
      }`}
    >
      {icon}
    </button>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  label,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClass: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
        active
          ? activeClass
          : "text-muted-foreground hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
