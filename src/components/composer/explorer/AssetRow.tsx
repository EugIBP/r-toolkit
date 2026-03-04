import { memo } from "react";
import type { AssetObject, IconInstance, ScreenData } from "@/types/project";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import {
  Box,
  Film,
  Image as BgIcon,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Trash2,
  Check,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AssetRowProps {
  obj: AssetObject & { isRegistered?: boolean; isSprite?: boolean };
  instances: Array<{
    iconIdx: number;
    icon: IconInstance;
    isBackground?: boolean;
    screenIdx: number;
  }>;
  isExpanded: boolean;
  onToggleGroup: () => void;
  onEditBg: () => void;
}

export const AssetRow = memo(function AssetRow({
  obj,
  instances,
  isExpanded,
  onToggleGroup,
  onEditBg,
}: AssetRowProps) {
  const { projectData, addInstance, updateScreen, deleteProjectObject } =
    useProjectStore();
  const {
    selectedAssetPath,
    setSelectedAssetPath,
    activeScreenIdx,
    canvasMode,
    previewBgPath,
    setPreviewBgPath,
  } = useCanvasStore();
  const { confirm } = useAppStore();

  const isEditMode = canvasMode === "edit";
  const activeScreen = projectData?.Screens?.[activeScreenIdx];

  const isSprite = obj.isSprite;
  const isBG = obj.Type === "Bin";
  const isSelected = selectedAssetPath === obj.Path;
  const hasInstances = instances.length > 0;

  const handleSetBackground = (assetName: string) => {
    const isCurrentBg = activeScreen?.Background === assetName;
    updateScreen(activeScreenIdx, { Background: isCurrentBg ? "" : assetName });
  };

  const handleDeleteAsset = async (assetName: string) => {
    const yes = await confirm(
      "Delete Asset?",
      `This will remove "${assetName}" from description.json. Files on disk will remain.`,
    );
    if (yes) {
      deleteProjectObject(assetName);
      setSelectedAssetPath(null);
    }
  };

  const handleQuickAdd = (assetName: string) => {
    addInstance(activeScreenIdx, assetName, {
      name: assetName,
      x: 0,
      y: 0,
      states: [{ Name: "OFF", Color: "PURE_WHITE" }],
    });
  };

  const handleAddToScreen = (assetName: string, screenIdx: number) => {
    addInstance(screenIdx, assetName, {
      name: assetName,
      x: 0,
      y: 0,
      states: [{ Name: "OFF", Color: "PURE_WHITE" }],
    });
  };

  return (
    <div className="space-y-1 ml-4">
      <div
        className={`flex items-center min-w-0 gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all group/asset ${
          isSelected
            ? "bg-primary/20 border border-primary/30"
            : isBG && previewBgPath === obj.Path
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-white/5 hover:bg-white/10 border border-transparent"
        }`}
        onClick={() => {
          setSelectedAssetPath(obj.Path);
          if (isBG) {
            setPreviewBgPath(previewBgPath === obj.Path ? null : obj.Path);
          } else if (hasInstances) {
            onToggleGroup();
          }
        }}
      >
        {/* Expand chevron for non-bg assets with instances */}
        {!isBG && hasInstances ? (
          isExpanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}

        {isBG ? (
          <BgIcon className="w-4 h-4 opacity-60 shrink-0" />
        ) : isSprite ? (
          <Film className="w-4 h-4 opacity-60 text-orange-400 shrink-0" />
        ) : (
          <Box className="w-4 h-4 opacity-60 text-blue-400 shrink-0" />
        )}

        <span className="text-xs font-semibold text-white truncate flex-1">
          {obj.Name}
        </span>

        {hasInstances && (
          <span className="text-xs text-muted-foreground font-mono shrink-0 opacity-0 group-hover/asset:opacity-100 transition-opacity">
            {instances.length}
          </span>
        )}

        {isBG && activeScreen?.Background === obj.Name && (
          <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase shrink-0">
            active
          </span>
        )}

        {!obj.isRegistered && (
          <span className="text-[8px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-bold uppercase shrink-0">
            new
          </span>
        )}

        {/* BG asset: edit-mode actions dropdown */}
        {obj.isRegistered && isBG && isEditMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                onClick={(e) => e.stopPropagation()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 text-muted-foreground hover:text-white hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover/asset:opacity-100 shrink-0"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#121212] border-white/10 text-white min-w-[180px]"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetBackground(obj.Name);
                }}
                className="gap-2 cursor-pointer focus:bg-white/10 text-xs"
              >
                {activeScreen?.Background === obj.Name ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">
                      Remove as Background
                    </span>
                  </>
                ) : (
                  <>
                    <BgIcon className="w-3.5 h-3.5 opacity-70" /> Set as
                    Background
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBg();
                }}
                className="gap-2 cursor-pointer focus:bg-white/10 text-xs"
              >
                <Pencil className="w-3.5 h-3.5 opacity-70" /> Edit…
              </DropdownMenuItem>
              <div className="h-px bg-white/5 my-1" />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAsset(obj.Name);
                }}
                className="gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove from project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Quick-add button (non-background assets only) */}
        {obj.isRegistered && !isBG && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                onClick={(e) => e.stopPropagation()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors opacity-0 group-hover/asset:opacity-100 shrink-0"
                title="Add instance"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#121212] border-white/10 text-white min-w-[180px]"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(obj.Name);
                }}
                className="gap-2 cursor-pointer focus:bg-white/10 text-xs"
              >
                <Plus className="w-3.5 h-3.5 opacity-70" /> Add to current
                screen
              </DropdownMenuItem>
              {projectData?.Screens && projectData.Screens.length > 1 && (
                <>
                  <div className="h-px bg-white/5 my-1" />
                  {projectData.Screens.map(
                    (screen: ScreenData, idx: number) =>
                      idx !== activeScreenIdx && (
                        <DropdownMenuItem
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToScreen(obj.Name, idx);
                          }}
                          className="gap-2 cursor-pointer focus:bg-white/10 text-xs"
                        >
                          <span className="w-3.5 h-3.5 opacity-60 text-center text-xs font-bold">
                            S{idx + 1}
                          </span>
                          {screen.Name}
                        </DropdownMenuItem>
                      ),
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Instances list (expanded, non-bg) */}
      {isExpanded && !isBG && hasInstances && (
        <div className="ml-6 space-y-1">
          {instances.map(
            ({ iconIdx, icon, isBackground: isBgInst, screenIdx }) => (
              <div
                key={`${icon.Name}_${screenIdx}_${iconIdx}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-white/5 rounded-lg cursor-default transition-all"
              >
                <span className="text-xs font-mono text-white truncate flex-1">
                  {icon.Name}
                </span>
                {isBgInst ? (
                  <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase shrink-0">
                    BG
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    S{screenIdx + 1}
                  </span>
                )}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
});
