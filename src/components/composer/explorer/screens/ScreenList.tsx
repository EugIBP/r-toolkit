import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Layout, Plus, Monitor, Copy, Trash2 } from "lucide-react";
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

export function ScreenList({
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
  } = useProjectStore();
  const {
    canvasMode,
    activeScreenIdx,
    setScreenListMode,
    setSelectedIcon,
    activeTab,
  } = useCanvasStore();
  const { confirm } = useAppStore();

  const isEditMode = canvasMode === "edit";
  const { selected, toggle, selectAll, clear, count, hasSelection } =
    useSelection<number>();

  if (!projectData) return null;

  const handleDeleteSelected = async () => {
    if (count === projectData.Screens.length) {
      toast.error("Cannot delete all screens. Leave at least one.", {
        id: "bulk-del-error",
      });
      return;
    }
    if (await confirm("Delete Screens", `Delete ${count} screens?`)) {
      let newActiveIdx = activeScreenIdx;
      if (selected.has(activeScreenIdx)) {
        const firstAvailable = projectData.Screens.findIndex(
          (_: any, i: number) => !selected.has(i),
        );
        newActiveIdx = firstAvailable !== -1 ? firstAvailable : 0;
      } else {
        const deletedBefore = Array.from(selected).filter(
          (i) => i < activeScreenIdx,
        ).length;
        newActiveIdx = activeScreenIdx - deletedBefore;
      }
      onScreenChange(newActiveIdx);
      deleteScreens(Array.from(selected));
      clear();
    }
  };

  const handleDuplicateSelected = () => {
    duplicateScreens(Array.from(selected));
    clear();
  };

  const handleSmartDelete = async (index: number, name: string) => {
    if (selected.has(index) && count > 1) {
      handleDeleteSelected();
    } else {
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
        if (index === activeScreenIdx) onScreenChange(Math.max(0, index - 1));
        else if (index < activeScreenIdx) onScreenChange(activeScreenIdx - 1);
        deleteScreen(index);
        setSelectedIcon(null);
        if (selected.has(index)) toggle(index);
      }
    }
  };

  const handleSmartDuplicate = (index: number) => {
    if (selected.has(index) && count > 1) handleDuplicateSelected();
    else duplicateScreen(index);
  };

  // ХОТКЕИ СПИСКА ЭКРАНОВ
  useExplorerHotkeys({
    isActive: isEditMode && activeTab === "screens",
    onDelete: (e) => {
      if (hasSelection) {
        e.preventDefault();
        handleDeleteSelected();
      }
    },
    onDuplicate: (e) => {
      if (hasSelection) {
        e.preventDefault();
        handleDuplicateSelected();
      }
    },
  });

  const handleScreenClick = (i: number) => {
    onScreenChange(i);
    setSelectedIcon(null);
    setScreenListMode("detail");
    clear();
  };

  const isAllSelected = hasSelection && count === projectData.Screens.length;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10 shrink-0 min-h-[52px]">
        {hasSelection ? (
          <ExplorerBulkActions
            selectedCount={count}
            label="screens"
            isAllSelected={isAllSelected}
            onSelectAllToggle={() =>
              isAllSelected
                ? clear()
                : selectAll(projectData.Screens.map((_, i) => i))
            }
            onDuplicate={handleDuplicateSelected}
            onDelete={handleDeleteSelected}
            onCancel={clear}
          />
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
              const isSelected = activeScreenIdx === i && !hasSelection;
              const isCheckboxSelected = selected.has(i);
              const isBulk = isCheckboxSelected && count > 1;

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
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleScreenClick(i)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleScreenClick(i);
                          }
                        }}
                        className={`flex-1 flex items-center min-w-0 gap-3 px-3 py-2.5 ${isEditMode ? "rounded-l-xl" : "rounded-xl"} hover:bg-foreground/5 transition-colors text-left outline-none`}
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
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-40">
                      <ContextMenuItem
                        disabled={!isEditMode}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSmartDuplicate(i);
                        }}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 opacity-70" />{" "}
                        {isBulk ? `Duplicate ${count} screens` : "Duplicate"}
                      </ContextMenuItem>
                      <ContextMenuSeparator className="bg-border/50" />
                      <ContextMenuItem
                        disabled={!isEditMode}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSmartDelete(i, s.Name);
                        }}
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />{" "}
                        {isBulk ? `Delete ${count} screens` : "Delete"}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  {isEditMode && (
                    <SmartCheckboxAction
                      checked={isCheckboxSelected}
                      onToggle={() => toggle(i)}
                      forceShow={hasSelection}
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
