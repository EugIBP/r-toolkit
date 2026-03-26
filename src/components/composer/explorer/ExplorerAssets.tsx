import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssetRow } from "./AssetRow";
import { RefreshCw, FolderTree } from "lucide-react";
import { EditBackgroundModal } from "@/components/modals/EditBackgroundModal";
import { useExplorerData } from "./useExplorerData";
import { useProjectStore } from "@/store/useProjectStore";
import { useAppStore } from "@/store/useAppStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Button } from "@/components/ui/button";

import { ExplorerBulkActions } from "./ExplorerBulkActions";
import { useSelection } from "@/hooks/useSelection";
import { useExplorerHotkeys } from "@/hooks/useExplorerHotkeys";

export function ExplorerAssets() {
  const [editingBg, setEditingBg] = useState<string | null>(null);
  const { assetsByDir, sortedDirs, groupedInstances, newCount, mergedAssets } =
    useExplorerData();
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);

  const { confirm } = useAppStore();
  const { canvasMode, activeTab, selectedAssetPath, selectedIconIndex } =
    useCanvasStore();
  const isEditMode = canvasMode === "edit";

  const {
    selected: selAssets,
    toggle: toggleAsset,
    selectAll: selectAllAssets,
    clear: clearAssets,
    count: assetCount,
    hasSelection: hasAssetSel,
  } = useSelection<string>();
  const {
    selected: selInstances,
    toggle: toggleInstance,
    clear: clearInstances,
    count: instCount,
    hasSelection: hasInstSel,
  } = useSelection<string>();

  const {
    projectData,
    scanDirectory,
    registerAssets,
    clearScannedFiles,
    deleteProjectObject,
    deleteProjectObjects,
    deleteIcon,
    deleteIcons,
    duplicateIcon,
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

  const handleDeleteSelectedAssets = async () => {
    const namesToDelete = Array.from(selAssets).map(
      (p) => mergedAssets.find((a) => a.Path === p)!.Name,
    );
    if (
      await confirm(
        "Delete Assets",
        `Are you sure you want to delete ${namesToDelete.length} asset(s) from the project?`,
      )
    ) {
      deleteProjectObjects(namesToDelete);
      clearAssets();
    }
  };

  const handleSmartDeleteAsset = async (assetName: string) => {
    const assetPath = projectData?.Objects.find(
      (o) => o.Name === assetName,
    )?.Path;
    if (assetPath && selAssets.has(assetPath) && assetCount > 1) {
      handleDeleteSelectedAssets();
    } else if (
      await confirm("Delete Asset", `Remove "${assetName}" from project?`)
    ) {
      deleteProjectObject(assetName);
      if (assetPath && selAssets.has(assetPath)) toggleAsset(assetPath);
    }
  };

  const handleDeleteSelectedInstances = async () => {
    if (
      await confirm(
        "Delete Instances",
        `Are you sure you want to delete ${instCount} instance(s)?`,
      )
    ) {
      const iconsByScreen = new Map<number, number[]>();
      const bgByScreen = new Set<number>();

      selInstances.forEach((id) => {
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
      clearInstances();
      useCanvasStore.getState().setSelectedIcon(null);
    }
  };

  const handleSmartDeleteInstance = async (
    screenIdx: number,
    iconIdx: number | string,
  ) => {
    const instId = `${screenIdx}_${iconIdx}`;
    if (selInstances.has(instId) && instCount > 1) {
      handleDeleteSelectedInstances();
    } else if (
      await confirm("Delete Instance", `Remove this instance from screen?`)
    ) {
      if (iconIdx === "bg") updateScreen(screenIdx, { Background: "" });
      else {
        deleteIcon(screenIdx, iconIdx as number);
        useCanvasStore.getState().setSelectedIcon(null);
      }
      if (selInstances.has(instId)) toggleInstance(instId);
    }
  };

  const handleSmartDuplicateInstance = (screenIdx: number, iconIdx: number) => {
    const instId = `${screenIdx}_${iconIdx}`;
    if (selInstances.has(instId) && instCount > 1) {
      selInstances.forEach((id) => {
        const [sIdx, iIdx] = id.split("_");
        if (iIdx !== "bg") duplicateIcon(parseInt(sIdx), parseInt(iIdx));
      });
      clearInstances();
    } else {
      duplicateIcon(screenIdx, iconIdx);
    }
  };

  useExplorerHotkeys({
    isActive: isEditMode && activeTab === "objects",
    onDelete: (e) => {
      if (hasAssetSel) {
        e.preventDefault();
        handleDeleteSelectedAssets();
      } else if (hasInstSel) {
        e.preventDefault();
        handleDeleteSelectedInstances();
      } else if (selectedAssetPath && selectedIconIndex === null) {
        const asset = mergedAssets.find((a) => a.Path === selectedAssetPath);
        if (asset && asset.isRegistered) {
          e.preventDefault();
          handleSmartDeleteAsset(asset.Name);
        }
      }
    },
    onDuplicate: (e) => {
      if (hasInstSel) {
        e.preventDefault();
        selInstances.forEach((id) => {
          const [sIdxStr, iIdxStr] = id.split("_");
          if (iIdxStr !== "bg")
            duplicateIcon(parseInt(sIdxStr), parseInt(iIdxStr));
        });
        clearInstances();
      }
    },
  });

  const isInboxMode = newCount > 0;
  const isAllAssetsSelected =
    mergedAssets.length > 0 && mergedAssets.every((a) => selAssets.has(a.Path));

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10 shrink-0 min-h-[52px]">
        {hasInstSel && !isInboxMode ? (
          <ExplorerBulkActions
            selectedCount={instCount}
            label="instances"
            onDelete={handleDeleteSelectedInstances}
            onCancel={clearInstances}
          />
        ) : isInboxMode ? (
          <ExplorerBulkActions
            selectedCount={assetCount > 0 ? assetCount : newCount}
            label={assetCount > 0 ? "sel." : "New"}
            customColor="amber"
            isAllSelected={isAllAssetsSelected}
            onSelectAllToggle={() =>
              isAllAssetsSelected
                ? clearAssets()
                : selectAllAssets(mergedAssets.map((a) => a.Path))
            }
            extraActions={
              <Button
                size="sm"
                disabled={!hasAssetSel}
                onClick={() => {
                  registerAssets(Array.from(selAssets));
                  clearAssets();
                }}
                className="h-7 px-3 text-[10px] uppercase font-bold tracking-wider bg-amber-500 text-amber-950 hover:bg-amber-400 shadow-sm disabled:opacity-50"
              >
                Register
              </Button>
            }
            onCancel={() => {
              clearScannedFiles();
              clearAssets();
            }}
          />
        ) : hasAssetSel ? (
          <ExplorerBulkActions
            selectedCount={assetCount}
            label="sel."
            isAllSelected={isAllAssetsSelected}
            onSelectAllToggle={() =>
              isAllAssetsSelected
                ? clearAssets()
                : selectAllAssets(mergedAssets.map((a) => a.Path))
            }
            onDelete={isEditMode ? handleDeleteSelectedAssets : undefined}
            onCancel={clearAssets}
          />
        ) : (
          <div className="flex items-center justify-between w-full">
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
                      onToggleGroup={() => {
                        const next = new Set(expandedAssets);
                        if (next.has(obj.Name)) next.delete(obj.Name);
                        else next.add(obj.Name);
                        setExpandedAssets(next);
                      }}
                      onEditBg={() => setEditingBg(obj.Name)}
                      isCheckboxSelected={selAssets.has(obj.Path)}
                      onToggleCheckbox={() => {
                        clearInstances();
                        toggleAsset(obj.Path);
                      }}
                      isSelectionMode={hasAssetSel || isInboxMode}
                      assetBulkCount={assetCount}
                      onDeleteAsset={handleSmartDeleteAsset}
                      selectedInstances={selInstances}
                      onToggleInstance={(id) => {
                        clearAssets();
                        toggleInstance(id);
                      }}
                      isInstanceSelectionMode={hasInstSel}
                      instanceBulkCount={instCount}
                      onDeleteInstance={handleSmartDeleteInstance}
                      onDuplicateInstance={handleSmartDuplicateInstance}
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
