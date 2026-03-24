import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Layout,
  Plus,
  Copy,
  Trash2,
  Monitor,
  ChevronLeft,
  Box,
  Film,
  Image as BgIcon,
  CheckSquare,
  X,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ActionIcon({ icon: Icon, onClick, tooltip, className = "" }: any) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={`h-7 w-7 rounded-lg ${className}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="text-[10px] font-bold uppercase tracking-wider"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ExplorerScreens({
  onScreenChange,
}: {
  onScreenChange: (i: number) => void;
}) {
  const {
    projectData,
    addScreen,
    duplicateScreen,
    duplicateScreens,
    deleteScreen,
    deleteScreens,
    updateScreen,
    duplicateIcon,
    deleteIcon,
    deleteIcons,
  } = useProjectStore();
  const {
    setSelectedIcon,
    canvasMode,
    activeScreenIdx,
    screenListMode,
    setScreenListMode,
    selectedIconIndex,
    setSelectedAssetPath,
  } = useCanvasStore();
  const { confirm } = useAppStore();

  const [selectedScreens, setSelectedScreens] = useState<Set<number>>(
    new Set(),
  );
  const [selectedInstances, setSelectedInstances] = useState<Set<number>>(
    new Set(),
  );

  if (!projectData) return null;

  const isEditMode = canvasMode === "edit";
  const activeScreen = projectData.Screens[activeScreenIdx];

  const handleScreenClick = (i: number) => {
    onScreenChange(i);
    setSelectedIcon(null);
    setScreenListMode("detail");
    setSelectedInstances(new Set());
  };

  const handleDelete = async (index: number, name: string) => {
    if (projectData.Screens.length <= 1) {
      toast.error("Cannot delete the last screen.", { id: "del-error" });
      return;
    }
    if (
      await confirm(
        "Delete Screen",
        `Are you sure you want to delete screen "${name}"?`,
      )
    ) {
      // Плавно смещаем фокус перед удалением, чтобы не было initializing canvas
      if (index === activeScreenIdx) onScreenChange(Math.max(0, index - 1));
      else if (index < activeScreenIdx) onScreenChange(activeScreenIdx - 1);

      deleteScreen(index);
      setSelectedIcon(null);
      setScreenListMode("list");
    }
  };

  // ── DETAIL MODE ──────────────────────────────
  if (screenListMode === "detail" && activeScreen) {
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

    const isInstanceSelectionMode = selectedInstances.size > 0;
    const totalItemsCount =
      activeScreen.Icons?.length + (activeScreen.Background ? 1 : 0);
    const isAllInstancesSelected =
      totalItemsCount > 0 && selectedInstances.size === totalItemsCount;

    const handleInstanceSelectAll = () => {
      if (isAllInstancesSelected) {
        setSelectedInstances(new Set());
      } else {
        const allSet = new Set(activeScreen.Icons.map((_, i) => i));
        if (activeScreen.Background) allSet.add(-1);
        setSelectedInstances(allSet);
      }
    };

    return (
      <div className="flex flex-col h-full flex-1 min-h-0 animate-in slide-in-from-right-2 duration-200">
        <div className="flex flex-col gap-3 px-4 py-3 border-b border-border bg-muted/10 shrink-0 min-h-[52px] justify-center">
          {isInstanceSelectionMode ? (
            <div className="flex items-center justify-between w-full animate-in fade-in gap-2">
              <span className="text-[11px] font-bold text-primary whitespace-nowrap">
                {selectedInstances.size} sel.
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <ActionIcon
                  icon={CheckSquare}
                  onClick={handleInstanceSelectAll}
                  tooltip={
                    isAllInstancesSelected ? "Deselect All" : "Select All"
                  }
                  className={
                    isAllInstancesSelected
                      ? "text-primary bg-primary/10 hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }
                />
                <div className="h-4 w-px bg-border mx-0.5" />
                <ActionIcon
                  icon={Trash2}
                  tooltip="Delete"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={async () => {
                    if (
                      await confirm(
                        "Delete Instances",
                        `Delete ${selectedInstances.size} items?`,
                      )
                    ) {
                      const arr = Array.from(selectedInstances);
                      const hasBg = arr.includes(-1);
                      const iconIndices = arr.filter((i) => i !== -1);
                      if (iconIndices.length > 0)
                        deleteIcons(activeScreenIdx, iconIndices);
                      if (hasBg)
                        updateScreen(activeScreenIdx, { Background: "" });
                      setSelectedInstances(new Set());
                      setSelectedIcon(null);
                    }
                  }}
                />
                <ActionIcon
                  icon={X}
                  onClick={() => setSelectedInstances(new Set())}
                  tooltip="Cancel"
                  className="text-muted-foreground hover:text-foreground"
                />
              </div>
            </div>
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
                  const pathLower = path.toLowerCase();
                  const isSprite = pathLower.includes("sprites");
                  const isBG = pathLower.includes("backgrounds");
                  const isPal = pathLower.includes("pales");

                  const isSelected =
                    !isBgInstance && selectedIconIndex === iconIdx;
                  const isCheckboxSelected = selectedInstances.has(iconIdx);

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
                          <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => {
                              setSelectedAssetPath(path);
                              if (!isBgInstance) setSelectedIcon(iconIdx);
                            }}
                            className={`flex flex-1 items-center min-w-0 gap-3 px-3 py-2.5 ${isEditMode ? "rounded-l-xl" : "rounded-xl"} cursor-pointer transition-all hover:bg-foreground/5 text-left`}
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
                          </motion.div>
                        </ContextMenuTrigger>

                        <ContextMenuContent className="w-48">
                          {isBgInstance ? (
                            <ContextMenuItem
                              disabled={!isEditMode}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateScreen(activeScreenIdx, {
                                  Background: "",
                                });
                              }}
                              className="gap-2 cursor-pointer text-xs text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                              Background
                            </ContextMenuItem>
                          ) : (
                            <>
                              <ContextMenuItem
                                disabled={!isEditMode}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateIcon(activeScreenIdx, iconIdx);
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
                                  deleteIcon(activeScreenIdx, iconIdx);
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
                          checked={isCheckboxSelected}
                          forceShow={isInstanceSelectionMode}
                          onToggle={() => {
                            const next = new Set(selectedInstances);
                            if (next.has(iconIdx)) next.delete(iconIdx);
                            else next.add(iconIdx);
                            setSelectedInstances(next);
                          }}
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

  // ── LIST MODE: all screens ───────────────────────────────────────────────
  const isSelectionMode = selectedScreens.size > 0;
  const isAllScreensSelected =
    selectedScreens.size > 0 &&
    selectedScreens.size === projectData.Screens.length;

  const handleDeleteSelected = async () => {
    if (selectedScreens.size === projectData.Screens.length) {
      toast.error("Cannot delete all screens. Leave at least one.", {
        id: "bulk-del-error",
      });
      return;
    }

    if (
      await confirm("Delete Screens", `Delete ${selectedScreens.size} screens?`)
    ) {
      let newActiveIdx = activeScreenIdx;

      // Если мы удаляем текущий активный экран, нужно найти ему безопасную замену ДО удаления
      if (selectedScreens.has(activeScreenIdx)) {
        const firstAvailable = projectData.Screens.findIndex(
          (_: any, i: number) => !selectedScreens.has(i),
        );
        newActiveIdx = firstAvailable !== -1 ? firstAvailable : 0;
      } else {
        // Если активный экран остается, его индекс сместится на кол-во удаленных экранов перед ним
        const deletedBefore = Array.from(selectedScreens).filter(
          (i) => i < activeScreenIdx,
        ).length;
        newActiveIdx = activeScreenIdx - deletedBefore;
      }

      onScreenChange(newActiveIdx); // Безопасно переключаем активный экран
      deleteScreens(Array.from(selectedScreens)); // Затем сносим из стора
      setSelectedScreens(new Set());
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10 shrink-0 min-h-[52px]">
        {isSelectionMode ? (
          <div className="flex items-center justify-between w-full animate-in fade-in gap-2">
            <span className="text-[11px] font-bold text-primary whitespace-nowrap">
              {selectedScreens.size} sel.
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <ActionIcon
                icon={CheckSquare}
                tooltip={isAllScreensSelected ? "Deselect All" : "Select All"}
                className={
                  isAllScreensSelected
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() =>
                  setSelectedScreens(
                    isAllScreensSelected
                      ? new Set()
                      : new Set(projectData.Screens.map((_, i) => i)),
                  )
                }
              />
              <div className="h-4 w-px bg-border mx-0.5" />
              <ActionIcon
                icon={Copy}
                tooltip="Duplicate"
                className="text-secondary-foreground hover:bg-secondary/20"
                onClick={() => {
                  duplicateScreens(Array.from(selectedScreens));
                  setSelectedScreens(new Set());
                }}
              />
              <ActionIcon
                icon={Trash2}
                tooltip="Delete"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDeleteSelected}
              />
              <div className="h-4 w-px bg-border mx-0.5" />
              <ActionIcon
                icon={X}
                onClick={() => setSelectedScreens(new Set())}
                tooltip="Cancel"
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <Monitor className="w-4 h-4 text-primary opacity-80" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Screens
              </span>
            </div>
            <Button
              onClick={() => addScreen()}
              disabled={!isEditMode}
              size="sm"
              variant="secondary"
              className="h-7 px-2.5 text-[10px] gap-1.5 font-bold uppercase tracking-wider bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-3 space-y-1 pb-20">
          {projectData.Screens.length === 0 ? (
            <div className="py-10 text-center opacity-30 text-xs uppercase tracking-widest font-medium text-muted-foreground">
              No screens defined
            </div>
          ) : (
            projectData.Screens.map((s: any, i: number) => {
              const isSelected = activeScreenIdx === i && !isSelectionMode;
              const isCheckboxSelected = selectedScreens.has(i);

              let wrapperClasses = `group/row flex items-stretch w-full rounded-xl border transition-all overflow-hidden ${
                isCheckboxSelected
                  ? "bg-primary/10 border-primary/30"
                  : isSelected
                    ? "bg-primary/20 border-primary/50 shadow-sm"
                    : "bg-muted/20 border-transparent hover:border-border/50"
              }`;

              return (
                <div key={s.Name || i} className={wrapperClasses}>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <button
                        onClick={() => handleScreenClick(i)}
                        className={`flex-1 flex items-center min-w-0 gap-3 px-3 py-2.5 ${isEditMode ? "rounded-l-xl" : "rounded-xl"} hover:bg-foreground/5 transition-colors text-left`}
                      >
                        <div className="w-8 h-8 rounded-md border border-border/50 shrink-0 shadow-sm flex items-center justify-center bg-background/50">
                          <Layout className="w-4 h-4 opacity-70 text-primary" />
                        </div>
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {s.Name}
                          </span>
                          <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            {s.Icons?.length ?? 0} instances
                          </div>
                        </div>
                      </button>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-40">
                      <ContextMenuItem
                        disabled={!isEditMode}
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateScreen(i);
                        }}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 opacity-70" /> Duplicate
                      </ContextMenuItem>
                      <ContextMenuSeparator className="bg-border/50" />
                      <ContextMenuItem
                        disabled={!isEditMode}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(i, s.Name);
                        }}
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  {isEditMode && (
                    <SmartCheckboxAction
                      checked={isCheckboxSelected}
                      onToggle={() => {
                        const next = new Set(selectedScreens);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        setSelectedScreens(next);
                      }}
                      forceShow={isSelectionMode}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
