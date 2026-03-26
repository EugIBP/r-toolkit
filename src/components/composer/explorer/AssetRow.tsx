import { memo } from "react";
import type { AssetObject, IconInstance } from "@/types/project";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { motion } from "framer-motion";
import {
  Box,
  Film,
  Image as BgIcon,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { SmartCheckboxAction } from "@/components/ui/smart-checkbox";
import { AssetContextMenuContent } from "./menus/AssetContextMenuContent";
import { InstanceRow } from "./InstanceRow";

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

  // Asset Props
  isCheckboxSelected?: boolean;
  onToggleCheckbox?: () => void;
  isSelectionMode?: boolean;
  assetBulkCount?: number;
  onDeleteAsset: (assetName: string) => void;

  // Instance Props
  selectedInstances?: Set<string>;
  onToggleInstance?: (id: string) => void;
  isInstanceSelectionMode?: boolean;
  instanceBulkCount?: number;
  onDeleteInstance: (screenIdx: number, iconIdx: number | string) => void;
  onDuplicateInstance: (screenIdx: number, iconIdx: number) => void;
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
  assetBulkCount = 0,
  onDeleteAsset,
  selectedInstances,
  onToggleInstance,
  isInstanceSelectionMode = false,
  instanceBulkCount = 0,
  onDeleteInstance,
  onDuplicateInstance,
}: AssetRowProps) {
  const {
    projectData,
    addInstance,
    updateScreen,
    convertAssetType,
    registerAsset,
  } = useProjectStore();
  const {
    selectedAssetPath,
    setSelectedAssetPath,
    activeScreenIdx,
    canvasMode,
    previewBgPath,
    setPreviewBgPath,
  } = useCanvasStore();

  const isEditMode = canvasMode === "edit";
  const activeScreen = projectData?.Screens?.[activeScreenIdx];

  const isSprite = obj.isSprite || false;
  const isBG = obj.Type === "Bin";
  const isPal = obj.Type === "Pal";
  const isSelected = selectedAssetPath === obj.Path;
  const hasInstances = instances.length > 0;
  const isUnregistered = !obj.isRegistered;

  const quickAddButton = !isBG && !isUnregistered && isEditMode && (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        addInstance(activeScreenIdx, obj.Name, {
          x: 0,
          y: 0,
          states: [{ Name: "OFF", Color: "PURE_WHITE" }],
        });
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
  if (isCheckboxSelected)
    wrapperClasses += isUnregistered
      ? "bg-amber-500/10 border-amber-500/30"
      : "bg-primary/10 border-primary/30";
  else if (isSelected)
    wrapperClasses += isUnregistered
      ? "bg-amber-500/5 border-amber-500/60 shadow-sm"
      : "bg-primary/20 border-primary/50 shadow-sm";
  else if (isBG && previewBgPath === obj.Path && !isUnregistered)
    wrapperClasses += "bg-emerald-500/10 border-emerald-500/30 shadow-sm";
  else
    wrapperClasses += "bg-muted/20 border-transparent hover:border-border/50";

  const iconBoxClasses =
    "w-8 h-8 rounded-md border border-border/50 bg-background/50 shrink-0 shadow-sm flex items-center justify-center";
  const IconComp = isBG ? BgIcon : isSprite ? Film : isPal ? Box : Box;

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
            <div
              role="button"
              tabIndex={0}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedAssetPath(obj.Path);
                  if (!isUnregistered && isBG)
                    setPreviewBgPath(
                      previewBgPath === obj.Path ? null : obj.Path,
                    );
                  else if (!isUnregistered && hasInstances) onToggleGroup();
                }
              }}
              className={`flex-1 flex items-center min-w-0 gap-3 px-3 py-2.5 hover:bg-foreground/5 transition-colors text-left outline-none ${isEditMode || isUnregistered ? "rounded-l-xl" : "rounded-xl"}`}
            >
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
                {quickAddButton}
              </div>
            </div>
          </ContextMenuTrigger>

          <AssetContextMenuContent
            isUnregistered={isUnregistered}
            isEditMode={isEditMode}
            isBG={isBG}
            isSprite={isSprite}
            assetName={obj.Name}
            activeScreenBackground={activeScreen?.Background}
            activeScreenIdx={activeScreenIdx}
            screens={projectData?.Screens}
            isAssetBulk={isCheckboxSelected && assetBulkCount > 1}
            assetBulkCount={assetBulkCount}
            onRegister={() => registerAsset(obj.Path)}
            onSetBackground={() =>
              updateScreen(activeScreenIdx, {
                Background:
                  activeScreen?.Background === obj.Name ? "" : obj.Name,
              })
            }
            onEditBg={onEditBg}
            onDelete={() => onDeleteAsset(obj.Name)}
            onQuickAdd={() =>
              addInstance(activeScreenIdx, obj.Name, {
                x: 0,
                y: 0,
                states: [{ Name: "OFF", Color: "PURE_WHITE" }],
              })
            }
            onAddToScreen={(idx) =>
              addInstance(idx, obj.Name, {
                x: 0,
                y: 0,
                states: [{ Name: "OFF", Color: "PURE_WHITE" }],
              })
            }
            onConvertType={(type) => convertAssetType(obj.Name, type)}
          />
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
              return (
                <InstanceRow
                  key={instId}
                  icon={icon}
                  iconIdx={iconIdx}
                  screenIdx={screenIdx}
                  isBgInst={isBgInst || false}
                  assetPath={obj.Path}
                  isEditMode={isEditMode}
                  isInstSelected={selectedInstances?.has(instId) || false}
                  isInstBulk={
                    (selectedInstances?.has(instId) || false) &&
                    instanceBulkCount > 1
                  }
                  instanceBulkCount={instanceBulkCount}
                  isInstanceSelectionMode={isInstanceSelectionMode}
                  onToggleInstance={() => onToggleInstance?.(instId)}
                  onDeleteInstance={() =>
                    onDeleteInstance(screenIdx, isBgInst ? "bg" : iconIdx)
                  }
                  onDuplicateInstance={() =>
                    onDuplicateInstance(screenIdx, iconIdx as number)
                  }
                />
              );
            },
          )}
        </div>
      )}
    </div>
  );
});
