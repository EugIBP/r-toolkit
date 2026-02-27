import { useCanvasStore } from "@/store/useCanvasStore";
import { forwardRef } from "react";
import {
  Hand,
  MousePointer2,
  Search,
  X,
  Layers,
  Box,
  Image as BgIcon,
  Film,
  Move,
  SquareStack,
} from "lucide-react";

const AssetsToolbarSearchInput = forwardRef<HTMLInputElement>((props, ref) => {
  const { searchQuery, setSearchQuery, setActiveTab } = useCanvasStore();
  return (
    <input
      ref={ref}
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        if (e.target.value) setActiveTab("objects");
      }}
      placeholder="Find asset..."
      className="bg-transparent border-none outline-none text-xs font-medium text-white w-full placeholder:text-white/20"
      {...props}
    />
  );
});
AssetsToolbarSearchInput.displayName = "AssetsToolbarSearchInput";

export { AssetsToolbarSearchInput };

export function AssetsToolbar({ searchInputRef }: { searchInputRef?: React.RefObject<HTMLInputElement | null> }) {
  const {
    searchQuery,
    setSearchQuery,
    assetFilter,
    setAssetFilter,
    setActiveTab,
  } = useCanvasStore();

  return (
    <div className="absolute top-6 left-8 z-50 flex items-center p-1.5 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-2">
      {/* ПОИСК */}
      <div className="relative flex items-center bg-white/5 rounded-xl h-9 px-3 w-44 border border-white/5 focus-within:border-primary/50 transition-colors">
        <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
        <AssetsToolbarSearchInput ref={searchInputRef} />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 text-muted-foreground hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* ФИЛЬТРЫ */}
      <div className="flex items-center gap-0.5">
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
  );
}

export function ModeToolbar() {
  const { canvasMode, setCanvasMode, allowDnd, setAllowDnd } = useCanvasStore();

  return (
    <>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-1">
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

        <div className="w-px h-6 bg-white/10 mx-0.5" />

        <ModeBtn
          active={allowDnd}
          onClick={() => setAllowDnd(!allowDnd)}
          icon={<Move className="w-3.5 h-3.5" />}
          label="Drag & Drop"
          activeClass="bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
        />

      </div>
    </>
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
