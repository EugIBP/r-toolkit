import { memo } from "react";
import { Box, Copy, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { SmartCheckboxAction } from "@/components/ui/smart-checkbox";
import { useCanvasStore } from "@/store/useCanvasStore";
import type { IconInstance } from "@/types/project";

interface InstanceRowProps {
  icon: IconInstance;
  iconIdx: number | string;
  screenIdx: number;
  isBgInst: boolean;
  assetPath: string;
  isEditMode: boolean;
  isInstSelected: boolean;
  isInstBulk: boolean;
  instanceBulkCount: number;
  isInstanceSelectionMode: boolean;
  onToggleInstance: () => void;
  onDeleteInstance: () => void;
  onDuplicateInstance: () => void;
}

export const InstanceRow = memo(function InstanceRow({
  icon,
  iconIdx,
  screenIdx,
  isBgInst,
  assetPath,
  isEditMode,
  isInstSelected,
  isInstBulk,
  instanceBulkCount,
  isInstanceSelectionMode,
  onToggleInstance,
  onDeleteInstance,
  onDuplicateInstance,
}: InstanceRowProps) {
  const {
    activeScreenIdx,
    setActiveScreenIdx,
    setSelectedIcon,
    setSelectedAssetPath,
  } = useCanvasStore();

  return (
    <div
      className={`group/inst flex items-stretch w-full rounded-xl border transition-all overflow-hidden ${isInstSelected ? "bg-primary/10 border-primary/30" : "bg-muted/10 border-transparent hover:border-border/50"}`}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedAssetPath(assetPath);
              if (activeScreenIdx !== screenIdx) setActiveScreenIdx(screenIdx);
              if (!isBgInst) setSelectedIcon(iconIdx as number);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedAssetPath(assetPath);
                if (activeScreenIdx !== screenIdx)
                  setActiveScreenIdx(screenIdx);
                if (!isBgInst) setSelectedIcon(iconIdx as number);
              }
            }}
            className={`flex-1 flex items-center min-w-0 gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-foreground/5 text-left outline-none ${isEditMode ? "rounded-l-xl" : "rounded-xl"}`}
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
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-48">
          {isBgInst ? (
            <ContextMenuItem
              disabled={!isEditMode}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteInstance();
              }}
              className="gap-2 cursor-pointer text-xs text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />{" "}
              {isInstBulk
                ? `Delete ${instanceBulkCount} instances`
                : "Remove Background"}
            </ContextMenuItem>
          ) : (
            <>
              <ContextMenuItem
                disabled={!isEditMode}
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateInstance();
                }}
                className="gap-2 cursor-pointer text-xs"
              >
                <Copy className="w-3.5 h-3.5 opacity-70" />{" "}
                {isInstBulk
                  ? `Duplicate ${instanceBulkCount} instances`
                  : "Duplicate"}
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-border/50" />
              <ContextMenuItem
                disabled={!isEditMode}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteInstance();
                }}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />{" "}
                {isInstBulk
                  ? `Delete ${instanceBulkCount} instances`
                  : "Delete"}
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {isEditMode && (
        <SmartCheckboxAction
          checked={isInstSelected}
          onToggle={onToggleInstance}
          forceShow={isInstanceSelectionMode}
        />
      )}
    </div>
  );
});
