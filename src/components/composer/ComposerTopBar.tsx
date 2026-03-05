import { useCanvasStore } from "@/store/useCanvasStore";
import {
  Hand,
  MousePointer2,
  Search,
  Layers,
  Box,
  Image as BgIcon,
  Film,
  Move,
  SquareStack,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { ToolbarDivider } from "@/components/ui/floating-toolbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ComposerTopBar({
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
    canvasMode,
    setCanvasMode,
    allowDnd,
    setAllowDnd,
    zoom,
    setZoom,
  } = useCanvasStore();

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 5));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1));
  const handleZoomReset = () => setZoom(0.85);

  return (
    <div className="h-[80px] shrink-0 flex items-center border-b border-white/10 bg-white/[0.02] px-10">
      {/* ЛЕВАЯ СЕКЦИЯ: Фильтр ассетов + Поиск + Stack Threshold */}
      <div className="flex items-center gap-4">
        <Input
          variant="dark"
          icon={<Search className="w-3.5 h-3.5" />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value) setActiveTab("objects");
          }}
          placeholder="Find asset..."
          className="w-56"
          ref={searchInputRef}
        />
        <ToolbarDivider className="h-8" />
        <div className="flex items-center gap-1">
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
        <ToolbarDivider className="h-8" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
            Stack threshold (px)
          </span>
          <input
            type="number"
            min={1}
            max={100}
            value={stackThreshold}
            onChange={(e) => setStackThreshold(parseInt(e.target.value) || 5)}
            className="w-16 h-8 bg-white/5 border border-white/10 rounded-md px-2 text-xs font-medium text-white text-center outline-none focus:border-primary/50 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* ЦЕНТРАЛЬНАЯ СЕКЦИЯ: Переключатель режимов - абсолютно по центру */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div className="flex items-center gap-1 p-1.5 bg-white/5 rounded-xl border border-white/10">
          <ModeBtn
            active={canvasMode === "view"}
            onClick={() => setCanvasMode("view")}
            icon={<Hand className="w-4 h-4" />}
            label="View"
            activeClass="bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
          />
          <ToolbarDivider className="h-5" />
          <ModeBtn
            active={canvasMode === "edit"}
            onClick={() => setCanvasMode("edit")}
            icon={<MousePointer2 className="w-4 h-4" />}
            label="Edit"
            activeClass="bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
          />
          <ToolbarDivider className="h-5" />
          <ModeBtn
            active={allowDnd}
            onClick={() => setAllowDnd(!allowDnd)}
            icon={<Move className="w-4 h-4" />}
            label="D&D"
            activeClass="bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
          />
        </div>
      </div>

      {/* ПРАВАЯ СЕКЦИЯ: Zoom - прижат вправо */}
      <div className="absolute right-10 flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-medium">Zoom</span>
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          <Button
            variant="ghost-dark"
            size="icon-xs"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="px-3 py-1 text-xs font-mono text-white min-w-[60px] text-center whitespace-nowrap">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost-dark"
            size="icon-xs"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <ToolbarDivider className="h-5" />
          <Button
            variant="ghost-dark"
            size="icon-xs"
            onClick={handleZoomReset}
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
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
