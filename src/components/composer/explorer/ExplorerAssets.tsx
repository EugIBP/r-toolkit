import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssetRow } from "./AssetRow";
import { RefreshCw, FolderTree, X, CheckSquare, Trash2 } from "lucide-react";
import { EditBackgroundModal } from "../modals/EditBackgroundModal";
import { useExplorerData } from "./useExplorerData";
import { useProjectStore } from "@/store/useProjectStore";
import { useAppStore } from "@/store/useAppStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ActionIcon({
  icon: Icon,
  onClick,
  tooltip,
  className = "",
  disabled = false,
}: any) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
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

export function ExplorerAssets() {
  const [editingBg, setEditingBg] = useState<string | null>(null);
  const { assetsByDir, sortedDirs, groupedInstances, newCount, mergedAssets } =
    useExplorerData();
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const { confirm } = useAppStore();
  const { canvasMode } = useCanvasStore();

  const isEditMode = canvasMode === "edit";

  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(
    new Set(),
  );

  const {
    scanDirectory,
    registerAssets,
    clearScannedFiles,
    deleteProjectObjects,
    deleteIcons,
    updateScreen,
  } = useProjectStore();

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanDirectory();
    } catch (e) {
      console.error("Scan failed:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleAsset = (assetName: string) => {
    const next = new Set(expandedAssets);
    if (next.has(assetName)) next.delete(assetName);
    else next.add(assetName);
    setExpandedAssets(next);
  };

  const toggleAssetSelection = (path: string) => {
    setSelectedInstances(new Set());
    const next = new Set(selectedAssets);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedAssets(next);
  };

  const toggleInstanceSelection = (id: string) => {
    setSelectedAssets(new Set());
    const next = new Set(selectedInstances);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedInstances(next);
  };

  const isAllAssetsSelected =
    mergedAssets.length > 0 &&
    mergedAssets.every((a) => selectedAssets.has(a.Path));

  const handleSelectAllToggle = () => {
    if (isAllAssetsSelected) setSelectedAssets(new Set());
    else setSelectedAssets(new Set(mergedAssets.map((a) => a.Path)));
  };

  const handleDeleteSelectedAssets = async () => {
    const namesToDelete = Array.from(selectedAssets).map(
      (p) => mergedAssets.find((a) => a.Path === p)!.Name,
    );
    if (
      await confirm(
        "Delete Assets",
        `Are you sure you want to delete ${namesToDelete.length} asset(s) from the project?`,
      )
    ) {
      deleteProjectObjects(namesToDelete);
      setSelectedAssets(new Set());
    }
  };

  const handleDeleteSelectedInstances = async () => {
    if (
      await confirm(
        "Delete Instances",
        `Are you sure you want to delete ${selectedInstances.size} instance(s)?`,
      )
    ) {
      const iconsByScreen = new Map<number, number[]>();
      const bgByScreen = new Set<number>();

      selectedInstances.forEach((id) => {
        const [sIdxStr, iIdxStr] = id.split("_");
        const sIdx = parseInt(sIdxStr);
        if (iIdxStr === "bg") bgByScreen.add(sIdx);
        else {
          const iIdx = parseInt(iIdxStr);
          if (!iconsByScreen.has(sIdx)) iconsByScreen.set(sIdx, []);
          iconsByScreen.get(sIdx)!.push(iIdx);
        }
      });

      iconsByScreen.forEach((indices, sIdx) => deleteIcons(sIdx, indices));
      bgByScreen.forEach((sIdx) => updateScreen(sIdx, { Background: "" }));
      setSelectedInstances(new Set());
    }
  };

  const isInboxMode = newCount > 0;
  const isAssetSelectionMode = selectedAssets.size > 0 && !isInboxMode;
  const isInstanceSelectionMode = selectedInstances.size > 0 && !isInboxMode;

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10 shrink-0 min-h-[52px]">
        {isInstanceSelectionMode ? (
          <div className="flex items-center justify-between w-full animate-in fade-in gap-2">
            <span className="text-[11px] font-bold text-primary whitespace-nowrap">
              {selectedInstances.size} instances
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <ActionIcon
                icon={Trash2}
                tooltip="Delete Instances"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDeleteSelectedInstances}
              />
              <ActionIcon
                icon={X}
                onClick={() => setSelectedInstances(new Set())}
                tooltip="Cancel"
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>
        ) : isInboxMode ? (
          // РЕЖИМ ВХОДЯЩИХ (Сразу показываем панель массовых действий)
          <div className="flex items-center justify-between w-full animate-in fade-in gap-2">
            <span className="text-[11px] font-bold text-amber-500 whitespace-nowrap">
              {selectedAssets.size > 0
                ? `${selectedAssets.size} sel.`
                : `${newCount} New`}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <ActionIcon
                icon={CheckSquare}
                tooltip={isAllAssetsSelected ? "Deselect All" : "Select All"}
                className={
                  isAllAssetsSelected
                    ? "text-amber-500 bg-amber-500/20 hover:bg-amber-500/30"
                    : "text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10"
                }
                onClick={handleSelectAllToggle}
              />
              <div className="h-4 w-px bg-border mx-0.5" />

              <Button
                size="sm"
                disabled={selectedAssets.size === 0}
                onClick={() => {
                  registerAssets(Array.from(selectedAssets));
                  setSelectedAssets(new Set());
                }}
                className="h-7 px-3 text-[10px] uppercase font-bold tracking-wider bg-amber-500 text-amber-950 hover:bg-amber-400 shadow-sm disabled:opacity-50"
              >
                Register
              </Button>

              <ActionIcon
                icon={X}
                onClick={() => {
                  clearScannedFiles();
                  setSelectedAssets(new Set());
                }}
                tooltip="Cancel Scan"
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>
        ) : isAssetSelectionMode ? (
          <div className="flex items-center justify-between w-full animate-in fade-in gap-2">
            <span className="text-[11px] font-bold text-primary whitespace-nowrap">
              {selectedAssets.size} sel.
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <ActionIcon
                icon={CheckSquare}
                tooltip="Toggle All"
                className={
                  isAllAssetsSelected
                    ? "text-primary bg-primary/20 hover:bg-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={handleSelectAllToggle}
              />
              <div className="h-4 w-px bg-border mx-0.5" />

              {isEditMode && (
                <ActionIcon
                  icon={Trash2}
                  tooltip="Delete"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDeleteSelectedAssets}
                />
              )}

              <ActionIcon
                icon={X}
                onClick={() => setSelectedAssets(new Set())}
                tooltip="Cancel"
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <FolderTree className="w-4 h-4 text-primary opacity-80" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Objects
              </span>
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              size="sm"
              variant="secondary"
              className="h-7 px-2.5 text-[10px] gap-1.5 font-bold uppercase tracking-wider bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`}
              />{" "}
              Scan
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-1 pb-10">
          {sortedDirs.map((dir) => {
            const items = assetsByDir.get(dir) || [];
            if (items.length === 0) return null;

            return (
              <div key={dir} className="mb-4 last:mb-0">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md py-2 px-1 mb-2 mt-4 first:mt-0 flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {dir}
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-[9px] font-bold text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded-sm">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {items.map((obj: any) => (
                    <AssetRow
                      key={obj.Path}
                      obj={obj}
                      instances={groupedInstances.get(obj.Path) || []}
                      isExpanded={expandedAssets.has(obj.Name)}
                      onToggleGroup={() => toggleAsset(obj.Name)}
                      onEditBg={() => setEditingBg(obj.Name)}
                      isCheckboxSelected={selectedAssets.has(obj.Path)}
                      onToggleCheckbox={() => toggleAssetSelection(obj.Path)}
                      isSelectionMode={isAssetSelectionMode || isInboxMode}
                      selectedInstances={selectedInstances}
                      onToggleInstance={toggleInstanceSelection}
                      isInstanceSelectionMode={isInstanceSelectionMode}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {sortedDirs.length === 0 && !isScanning && (
            <div className="py-10 flex flex-col items-center justify-center text-center opacity-50">
              <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                No Objects
              </span>
              <span className="text-[10px] text-muted-foreground max-w-[200px]">
                Drop images into your project folder and click Scan.
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      <EditBackgroundModal
        isOpen={!!editingBg}
        onClose={() => setEditingBg(null)}
        assetName={editingBg || ""}
      />
    </div>
  );
}
