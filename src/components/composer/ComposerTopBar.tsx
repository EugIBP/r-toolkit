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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    <div className="h-[80px] shrink-0 flex items-center border-b border-border bg-muted/30 px-10 relative">
      {/* ЛЕВАЯ СЕКЦИЯ: Поиск + Фильтры ассетов */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setActiveTab("objects");
            }}
            placeholder="Find asset (Ctrl+K)..."
            className="w-56 pl-9 h-9 bg-muted/50 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary/50"
            ref={searchInputRef}
          />
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

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
      </div>

      {/* ЦЕНТРАЛЬНАЯ СЕКЦИЯ: Переключатель режимов (Стилизовано под Tabs shadcn) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        {/* Контейнер имитирует TabsList (rounded-lg) */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted/50 border border-border p-1">
          <ModeBtn
            active={canvasMode === "view"}
            onClick={() => setCanvasMode("view")}
            icon={<Hand className="w-3.5 h-3.5" />}
            label="View"
            activeClass="bg-emerald-500/20 text-emerald-400"
          />
          <ModeBtn
            active={canvasMode === "edit"}
            onClick={() => setCanvasMode("edit")}
            icon={<MousePointer2 className="w-3.5 h-3.5" />}
            label="Edit"
            activeClass="bg-amber-500/20 text-amber-400"
          />
          <Separator orientation="vertical" className="h-4 mx-1.5 opacity-50" />
          <ModeBtn
            active={allowDnd}
            onClick={() => setAllowDnd(!allowDnd)}
            icon={<Move className="w-3.5 h-3.5" />}
            label="D&D"
            activeClass="bg-blue-500/20 text-blue-400"
          />
        </div>
      </div>

      {/* ПРАВАЯ СЕКЦИЯ: Zoom */}
      <div className="absolute right-10 flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-medium">Zoom</span>
        {/* Контейнер зума тоже rounded-lg, кнопки rounded-md */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-md"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="px-2 py-1 text-xs font-mono min-w-[60px] text-center whitespace-nowrap text-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-md"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1 opacity-50" />
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-md"
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
      className={`p-1.5 rounded-md transition-all ${
        active
          ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
      // Имитируем поведение TabsTrigger из shadcn (rounded-md)
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
        active
          ? `${activeClass} shadow-sm`
          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        {label}
      </div>
    </button>
  );
}
