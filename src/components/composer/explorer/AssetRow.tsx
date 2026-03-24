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
  Trash2,
  Check,
  Pencil,
  ArrowRightLeft,
  Copy,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { SmartCheckboxAction } from "@/components/ui/smart-checkbox";

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
  isCheckboxSelected?: boolean;
  onToggleCheckbox?: () => void;
  isSelectionMode?: boolean;
  selectedInstances?: Set<string>;
  onToggleInstance?: (id: string) => void;
  isInstanceSelectionMode?: boolean;
}

export const AssetRow = memo(function AssetRow({
  obj,
  instances,
  isExpanded,
  onToggleGroup,
  onEditBg,
  isCheckboxSelected = false,
  onToggleCheckbox,
  isSelectionMode = false,
  selectedInstances,
  onToggleInstance,
  isInstanceSelectionMode = false,
}: AssetRowProps) {
  const {
    projectData,
    addInstance,
    updateScreen,
    deleteProjectObject,
    convertAssetType,
    registerAsset,
    duplicateIcon,
    deleteIcon,
  } = useProjectStore();
  const {
    selectedAssetPath,
    setSelectedAssetPath,
    activeScreenIdx,
    setActiveScreenIdx,
    setSelectedIcon,
    canvasMode,
    previewBgPath,
    setPreviewBgPath,
  } = useCanvasStore();
  const { confirm } = useAppStore();

  const isEditMode = canvasMode === "edit";
  const activeScreen = projectData?.Screens?.[activeScreenIdx];

  const isSprite = obj.isSprite;
  const isBG = obj.Type === "Bin";
  const isPal = obj.Type === "Pal";
  const isSelected = selectedAssetPath === obj.Path;
  const hasInstances = instances.length > 0;
  const isUnregistered = !obj.isRegistered;

  const handleSetBackground = (assetName: string) => {
    const isCurrentBg = activeScreen?.Background === assetName;
    updateScreen(activeScreenIdx, { Background: isCurrentBg ? "" : assetName });
  };

  const handleDeleteAsset = async (assetName: string) => {
    const yes = await confirm(
      "Delete Asset?",
      `This will remove "${assetName}" from project.`,
    );
    if (yes) {
      deleteProjectObject(assetName);
      setSelectedAssetPath(null);
    }
  };

  const handleQuickAdd = (assetName: string) => {
    addInstance(activeScreenIdx, assetName, {
      x: 0,
      y: 0,
      states: [{ Name: "OFF", Color: "PURE_WHITE" }],
    });
  };

  const handleAddToScreen = (assetName: string, screenIdx: number) => {
    addInstance(screenIdx, assetName, {
      x: 0,
      y: 0,
      states: [{ Name: "OFF", Color: "PURE_WHITE" }],
    });
  };

  const renderContextMenu = () => {
    if (isUnregistered) {
      return (
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            disabled={!isEditMode}
            onClick={(e) => {
              e.stopPropagation();
              registerAsset(obj.Path);
            }}
            className="gap-2 cursor-pointer text-xs font-bold text-amber-500 focus:text-amber-500 focus:bg-amber-500/10"
          >
            <Check className="w-3.5 h-3.5" /> Register Asset
          </ContextMenuItem>
        </ContextMenuContent>
      );
    }

    if (isBG) {
      return (
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            disabled={!isEditMode}
            onClick={(e) => {
              e.stopPropagation();
              handleSetBackground(obj.Name);
            }}
            className="gap-2 cursor-pointer text-xs"
          >
            {activeScreen?.Background === obj.Name ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Remove Background</span>
              </>
            ) : (
              <>
                <BgIcon className="w-3.5 h-3.5 opacity-70" /> Set as Background
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!isEditMode}
            onClick={(e) => {
              e.stopPropagation();
              onEditBg();
            }}
            className="gap-2 cursor-pointer text-xs"
          >
            <Pencil className="w-3.5 h-3.5 opacity-70" /> Edit Properties...
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-border/50" />
          <ContextMenuItem
            disabled={!isEditMode}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAsset(obj.Name);
            }}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove from project
          </ContextMenuItem>
        </ContextMenuContent>
      );
    }

    return (
      <ContextMenuContent className="w-56">
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            handleQuickAdd(obj.Name);
          }}
          className="gap-2 cursor-pointer text-xs font-bold text-primary focus:text-primary focus:bg-primary/10"
        >
          <Plus className="w-3.5 h-3.5 opacity-80" /> Add to current screen
        </ContextMenuItem>
        {projectData?.Screens && projectData.Screens.length > 1 && (
          <>
            <ContextMenuSeparator className="bg-border/50" />
            {projectData.Screens.map(
              (screen: ScreenData, idx: number) =>
                idx !== activeScreenIdx && (
                  <ContextMenuItem
                    disabled={!isEditMode}
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToScreen(obj.Name, idx);
                    }}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <span className="w-4 h-4 rounded bg-background border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                      S{idx + 1}
                    </span>{" "}
                    Add to {screen.Name}
                  </ContextMenuItem>
                ),
            )}
          </>
        )}
        <ContextMenuSeparator className="bg-border/50" />
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            convertAssetType(obj.Name, isSprite ? "icon" : "sprite");
          }}
          className="gap-2 cursor-pointer text-xs text-muted-foreground"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 opacity-70" /> Convert to{" "}
          {isSprite ? "Static Icon" : "Sprite"}
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-border/50" />
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAsset(obj.Name);
          }}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" /> Remove from project
        </ContextMenuItem>
      </ContextMenuContent>
    );
  };

  const quickAddButton = !isBG && !isUnregistered && isEditMode && (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        handleQuickAdd(obj.Name);
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="p-1 text-primary hover:bg-primary bg-background/80 hover:text-primary-foreground backdrop-blur-sm rounded-md transition-colors opacity-0 group-hover/asset:opacity-100 shrink-0 shadow-sm border border-primary/20"
      title="Add instance"
    >
      <Plus className="w-3.5 h-3.5" />
    </motion.button>
  );

  let wrapperClasses =
    "group/row flex items-stretch w-full rounded-xl border transition-all overflow-hidden ";
  if (isCheckboxSelected) {
    // В Staging Area: выделенный чекбокс заливает строку легким янтарем
    wrapperClasses += isUnregistered
      ? "bg-amber-500/10 border-amber-500/30"
      : "bg-primary/10 border-primary/30";
  } else if (isSelected) {
    // ИСПРАВЛЕНИЕ: Выделение (Клик по строке)
    // В Staging Area выделяем янтарным контуром, в обычной — основным.
    wrapperClasses += isUnregistered
      ? "bg-amber-500/5 border-amber-500/60 shadow-sm"
      : "bg-primary/20 border-primary/50 shadow-sm";
  } else if (isBG && previewBgPath === obj.Path && !isUnregistered) {
    wrapperClasses += "bg-emerald-500/10 border-emerald-500/30 shadow-sm";
  } else {
    wrapperClasses += "bg-muted/20 border-transparent hover:border-border/50";
  }

  const iconBoxClasses =
    "w-8 h-8 rounded-md border border-border/50 bg-background/50 shrink-0 shadow-sm flex items-center justify-center";

  let IconComp = isBG ? BgIcon : isSprite ? Film : isPal ? Box : Box;
  let iconClasses = "w-4 h-4 opacity-70 ";
  if (isUnregistered) iconClasses += "text-amber-500";
  else if (isBG) iconClasses += "text-emerald-500";
  else if (isSprite) iconClasses += "text-orange-500";
  else if (isPal) iconClasses += "text-emerald-500";
  else iconClasses += "text-blue-500";

  return (
    <div className="space-y-1 ml-1.5">
      <div className={wrapperClasses}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <button
              onClick={() => {
                setSelectedAssetPath(obj.Path);
                if (!isUnregistered) {
                  if (isBG)
                    setPreviewBgPath(
                      previewBgPath === obj.Path ? null : obj.Path,
                    );
                  else if (hasInstances) onToggleGroup();
                }
              }}
              className={`flex-1 flex items-center min-w-0 gap-3 px-3 py-2.5 hover:bg-foreground/5 transition-colors text-left ${
                isEditMode || isUnregistered ? "rounded-l-xl" : "rounded-xl"
              }`}
            >
              {/* ИСПРАВЛЕНИЕ: Вырезаем этот контейнер полностью для незарегистрированных ассетов, чтобы иконка сдвинулась влево */}
              {!isUnregistered && (
                <div className="flex items-center justify-center w-4 shrink-0">
                  {!isBG && hasInstances ? (
                    isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )
                  ) : null}
                </div>
              )}

              <div className={iconBoxClasses}>
                <IconComp className={iconClasses} />
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <span
                  className={`text-xs font-semibold truncate ${isUnregistered ? "text-amber-500" : "text-foreground"}`}
                  title={obj.Name}
                >
                  {obj.Name}
                </span>
                <div
                  className={`flex items-center gap-2 text-[10px] font-medium mt-0.5 ${isUnregistered ? "text-amber-500/70" : "text-muted-foreground"}`}
                >
                  <span className="uppercase tracking-wider font-bold">
                    {isUnregistered
                      ? "Unregistered"
                      : isBG
                        ? "Background"
                        : isSprite
                          ? "Sprite"
                          : isPal
                            ? "Pal"
                            : "Icon"}
                  </span>
                  {hasInstances && !isBG && !isUnregistered && (
                    <>
                      <span className="opacity-40">|</span>
                      <span>{instances.length} items</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pr-1">
                {isBG && activeScreen?.Background === obj.Name && (
                  <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase">
                    active
                  </span>
                )}
                {/* ИСПРАВЛЕНИЕ: Бейдж NEW удален, так как надписи Unregistered достаточно */}
                {quickAddButton}
              </div>
            </button>
          </ContextMenuTrigger>
          {renderContextMenu()}
        </ContextMenu>

        {(isEditMode || isUnregistered) && (
          <SmartCheckboxAction
            checked={isCheckboxSelected}
            onToggle={() => onToggleCheckbox?.()}
            forceShow={isUnregistered || isSelectionMode}
            color={isUnregistered ? "amber" : "primary"}
          />
        )}
      </div>

      {isExpanded && !isBG && hasInstances && !isUnregistered && (
        <div className="ml-10 space-y-1">
          {instances.map(
            ({ iconIdx, icon, isBackground: isBgInst, screenIdx }) => {
              const instId = isBgInst
                ? `${screenIdx}_bg`
                : `${screenIdx}_${iconIdx}`;
              const isInstSelected = selectedInstances?.has(instId) || false;

              return (
                <div
                  key={instId}
                  className={`group/inst flex items-stretch w-full rounded-xl border transition-all overflow-hidden ${
                    isInstSelected
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/10 border-transparent hover:border-border/50"
                  }`}
                >
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <button
                        onClick={() => {
                          setSelectedAssetPath(obj.Path);
                          if (activeScreenIdx !== screenIdx)
                            setActiveScreenIdx(screenIdx);
                          if (!isBgInst) setSelectedIcon(iconIdx);
                        }}
                        className={`flex-1 flex items-center min-w-0 gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-foreground/5 text-left ${isEditMode ? "rounded-l-xl" : "rounded-xl"}`}
                      >
                        <div className="w-6 h-6 rounded-md border border-border/30 shrink-0 flex items-center justify-center bg-background/50">
                          <Box className="w-3 h-3 text-muted-foreground opacity-50" />
                        </div>
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <span className="text-xs font-mono text-foreground/80 truncate">
                            {icon.Name}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-medium mt-0.5">
                            {isBgInst
                              ? "Background"
                              : `Screen ${screenIdx + 1} • X: ${icon.X}, Y: ${icon.Y}`}
                          </span>
                        </div>
                      </button>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-48">
                      {isBgInst ? (
                        <ContextMenuItem
                          disabled={!isEditMode}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateScreen(screenIdx, { Background: "" });
                          }}
                          className="gap-2 cursor-pointer text-xs text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Background
                        </ContextMenuItem>
                      ) : (
                        <>
                          <ContextMenuItem
                            disabled={!isEditMode}
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateIcon(screenIdx, iconIdx);
                            }}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Copy className="w-3.5 h-3.5 opacity-70" />{" "}
                            Duplicate
                          </ContextMenuItem>
                          <ContextMenuSeparator className="bg-border/50" />
                          <ContextMenuItem
                            disabled={!isEditMode}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteIcon(screenIdx, iconIdx);
                              setSelectedIcon(null);
                            }}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>

                  {isEditMode && (
                    <SmartCheckboxAction
                      checked={isInstSelected}
                      onToggle={() => onToggleInstance?.(instId)}
                      forceShow={isInstanceSelectionMode}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
});
