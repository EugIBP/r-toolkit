import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Layout,
  Copy,
  Trash2,
  Box,
  Film,
  Image as BgIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { SmartCheckboxAction } from "@/components/ui/smart-checkbox";

import { ExplorerBulkActions } from "../ExplorerBulkActions";
import { useSelection } from "@/hooks/useSelection";
import { useExplorerHotkeys } from "@/hooks/useExplorerHotkeys";

export function ScreenDetail() {
  const { projectData, updateScreen, duplicateIcon, deleteIcon, deleteIcons } =
    useProjectStore();
  const {
    setSelectedIcon,
    canvasMode,
    activeScreenIdx,
    setScreenListMode,
    selectedIconIndex,
    setSelectedAssetPath,
    activeTab,
  } = useCanvasStore();
  const { confirm } = useAppStore();

  const isEditMode = canvasMode === "edit";
  const { selected, toggle, selectAll, clear, count, hasSelection } =
    useSelection<number>();

  if (!projectData) return null;
  const activeScreen = projectData.Screens[activeScreenIdx];
  if (!activeScreen) return null;

  const handleDeleteSelected = async () => {
    if (await confirm("Delete Instances", `Delete ${count} items?`)) {
      const arr = Array.from(selected);
      const hasBg = arr.includes(-1);
      const iconIndices = arr.filter((i) => i !== -1);
      if (iconIndices.length > 0) deleteIcons(activeScreenIdx, iconIndices);
      if (hasBg) updateScreen(activeScreenIdx, { Background: "" });
      clear();
      setSelectedIcon(null);
    }
  };

  const handleDuplicateSelected = () => {
    Array.from(selected)
      .filter((i) => i !== -1)
      .forEach((idx) => duplicateIcon(activeScreenIdx, idx));
    clear();
  };

  const handleSmartDelete = async (iconIdx: number) => {
    if (selected.has(iconIdx) && count > 1) {
      handleDeleteSelected();
    } else if (await confirm("Delete Instance", `Remove this item?`)) {
      if (iconIdx === -1) updateScreen(activeScreenIdx, { Background: "" });
      else {
        deleteIcon(activeScreenIdx, iconIdx);
        setSelectedIcon(null);
      }
      if (selected.has(iconIdx)) toggle(iconIdx);
    }
  };

  const handleSmartDuplicate = (iconIdx: number) => {
    if (selected.has(iconIdx) && count > 1) handleDuplicateSelected();
    else duplicateIcon(activeScreenIdx, iconIdx);
  };

  // ХОТКЕИ ВНУТРИ ЭКРАНА (С ПОДДЕРЖКОЙ ОДИНОЧНОГО ВЫДЕЛЕНИЯ)
  useExplorerHotkeys({
    isActive: isEditMode && activeTab === "screens",
    onDelete: (e) => {
      if (hasSelection) {
        e.preventDefault();
        handleDeleteSelected();
      } else if (selectedIconIndex !== null) {
        e.preventDefault();
        handleSmartDelete(selectedIconIndex);
      }
    },
    onDuplicate: (e) => {
      if (hasSelection) {
        e.preventDefault();
        handleDuplicateSelected();
      } else if (selectedIconIndex !== null) {
        e.preventDefault();
        handleSmartDuplicate(selectedIconIndex);
      }
    },
  });

  const instances: Array<{
    iconIdx: number;
    icon: any;
    isBackground?: boolean;
    path: string;
  }> = [];
  if (activeScreen.Background) {
    const bgAsset = projectData.Objects?.find(
      (o: any) => o.Name === activeScreen.Background,
    );
    if (bgAsset)
      instances.push({
        iconIdx: -1,
        icon: { Name: bgAsset.Name, X: 0, Y: 0 },
        isBackground: true,
        path: bgAsset.Path,
      });
  }
  activeScreen.Icons?.forEach((icon: any, iconIdx: number) => {
    const asset = projectData.Objects?.find((o: any) => o.Name === icon.Name);
    if (asset) instances.push({ iconIdx, icon, path: asset.Path });
  });

  const totalItemsCount =
    activeScreen.Icons?.length + (activeScreen.Background ? 1 : 0);
  const isAllSelected = totalItemsCount > 0 && count === totalItemsCount;

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 animate-in slide-in-from-right-2 duration-200">
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-border bg-muted/10 shrink-0 min-h-[52px] justify-center">
        {hasSelection ? (
          <ExplorerBulkActions
            selectedCount={count}
            label="instances"
            isAllSelected={isAllSelected}
            onSelectAllToggle={() => {
              if (isAllSelected) clear();
              else {
                const allSet = activeScreen.Icons.map((_, i) => i);
                if (activeScreen.Background) allSet.push(-1);
                selectAll(allSet);
              }
            }}
            onDuplicate={handleDuplicateSelected}
            onDelete={handleDeleteSelected}
            onCancel={clear}
          />
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              onClick={() => {
                setScreenListMode("list");
                setSelectedIcon(null);
                setSelectedAssetPath(null);
              }}
              className="justify-start gap-2 h-7 px-2 -ml-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Layout className="w-3.5 h-3.5 text-primary opacity-80" />
              <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                {activeScreen.Name}
              </span>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-3 space-y-1 pb-20">
          {instances.length === 0 ? (
            <div className="py-10 text-center opacity-30 text-xs uppercase tracking-widest font-medium text-muted-foreground">
              No instances
            </div>
          ) : (
            instances.map(
              ({ iconIdx, icon, isBackground: isBgInstance, path }) => {
                const isSprite = path.toLowerCase().includes("sprites");
                const isBG = path.toLowerCase().includes("backgrounds");
                const isPal = path.toLowerCase().includes("pales");

                const isSelected =
                  !isBgInstance && selectedIconIndex === iconIdx;
                const isCheckboxSelected = selected.has(iconIdx);
                const isBulk = isCheckboxSelected && count > 1;

                let wrapperClasses = `group/row flex items-stretch w-full rounded-xl border transition-all overflow-hidden ${
                  isCheckboxSelected
                    ? "bg-primary/10 border-primary/30"
                    : isSelected
                      ? "bg-primary/20 border-primary/50 shadow-sm"
                      : "bg-muted/20 border-transparent hover:border-border/50"
                }`;

                return (
                  <div
                    key={`${icon.Name}_${iconIdx}`}
                    className={wrapperClasses}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedAssetPath(path);
                            if (!isBgInstance) setSelectedIcon(iconIdx);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedAssetPath(path);
                              if (!isBgInstance) setSelectedIcon(iconIdx);
                            }
                          }}
                          className={`flex flex-1 items-center min-w-0 gap-3 px-3 py-2.5 ${isEditMode ? "rounded-l-xl" : "rounded-xl"} cursor-pointer transition-all hover:bg-foreground/5 text-left outline-none`}
                        >
                          <div className="w-8 h-8 rounded-md border border-border/50 shrink-0 shadow-sm flex items-center justify-center bg-background/50">
                            {isBG ? (
                              <BgIcon className="w-4 h-4 opacity-70 text-emerald-500" />
                            ) : isSprite ? (
                              <Film className="w-4 h-4 opacity-70 text-orange-500" />
                            ) : isPal ? (
                              <Box className="w-4 h-4 opacity-70 text-emerald-500" />
                            ) : (
                              <Box className="w-4 h-4 opacity-70 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col overflow-hidden">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {icon.Name}
                            </span>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {isBgInstance
                                ? "Background Layer"
                                : `X: ${icon.X}, Y: ${icon.Y}`}
                            </div>
                          </div>
                          {isBgInstance && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase shrink-0 mr-1">
                              BG
                            </span>
                          )}
                        </div>
                      </ContextMenuTrigger>

                      <ContextMenuContent className="w-48">
                        {isBgInstance ? (
                          <ContextMenuItem
                            disabled={!isEditMode}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSmartDelete(-1);
                            }}
                            className="gap-2 cursor-pointer text-xs text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />{" "}
                            {isBulk
                              ? `Delete ${count} items`
                              : "Remove Background"}
                          </ContextMenuItem>
                        ) : (
                          <>
                            <ContextMenuItem
                              disabled={!isEditMode}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSmartDuplicate(iconIdx);
                              }}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Copy className="w-3.5 h-3.5 opacity-70" />{" "}
                              {isBulk
                                ? `Duplicate ${count} items`
                                : "Duplicate"}
                            </ContextMenuItem>
                            <ContextMenuSeparator className="bg-border/50" />
                            <ContextMenuItem
                              disabled={!isEditMode}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSmartDelete(iconIdx);
                              }}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />{" "}
                              {isBulk ? `Delete ${count} items` : "Delete"}
                            </ContextMenuItem>
                          </>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
                    {isEditMode && (
                      <SmartCheckboxAction
                        checked={isCheckboxSelected}
                        forceShow={hasSelection}
                        onToggle={() => toggle(iconIdx)}
                      />
                    )}
                  </div>
                );
              },
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
