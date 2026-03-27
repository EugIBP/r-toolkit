import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssetRow } from "./AssetRow";
import {
  RefreshCw,
  FolderTree,
  ChevronRight,
  Folder as FolderIcon,
} from "lucide-react";
import { EditBackgroundModal } from "@/components/modals/EditBackgroundModal";
import { useExplorerData, type FolderNode } from "./useExplorerData";
import { useProjectStore } from "@/store/useProjectStore";
import { useAppStore } from "@/store/useAppStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Button } from "@/components/ui/button";

import { ExplorerBulkActions } from "./ExplorerBulkActions";
import { useSelection } from "@/hooks/useSelection";
import { useExplorerHotkeys } from "@/hooks/useExplorerHotkeys";

interface FolderNodeViewProps {
  node: FolderNode;
  level?: number;
  groupedInstances: Map<string, any[]>;
  expandedAssets: Set<string>;
  setExpandedAssets: (
    val: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => void;
  setEditingBg: (val: string | null) => void;
  selAssets: Set<string>;
  toggleAsset: (val: string) => void;
  hasAssetSel: boolean;
  isInboxMode: boolean;
  assetCount: number;
  handleSmartDeleteAsset: (val: string) => void;
  selInstances: Set<string>;
  toggleInstance: (val: string) => void;
  clearAssets: () => void;
  clearInstances: () => void;
  hasInstSel: boolean;
  instCount: number;
  handleSmartDeleteInstance: (
    screenIdx: number,
    iconIdx: number | string,
  ) => void;
  handleSmartDuplicateInstance: (screenIdx: number, iconIdx: number) => void;
}

function FolderNodeView(props: FolderNodeViewProps) {
  const { node, level = 0 } = props;
  const [expanded, setExpanded] = useState(level <= 1); // Раскрываем папки 1-го уровня по умолчанию

  const hasChildren = Object.keys(node.children).length > 0;
  const hasAssets = node.assets.length > 0;

  if (!hasChildren && !hasAssets) return null;

  const childFolders = Object.values(node.children).sort((a, b) => {
    const priorityOrder = [
      "backgrounds",
      "sprites",
      "icons",
      "assets",
      "pales",
      "palettes",
    ];
    const idxA = priorityOrder.indexOf(a.name.toLowerCase());
    const idxB = priorityOrder.indexOf(b.name.toLowerCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const sortedAssets = [...node.assets].sort((a, b) =>
    a.Name.localeCompare(b.Name),
  );

  return (
    <div className="flex flex-col w-full">
      {/* Заголовок папки (не рендерим для виртуального корня level 0) */}
      {level > 0 && (
        <div
          onClick={() => setExpanded(!expanded)}
          className="group flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-muted/30 rounded-md select-none transition-colors"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
          />
          <FolderIcon className="w-3.5 h-3.5 text-blue-400 opacity-80" />
          <span className="text-[11px] font-bold tracking-wide text-foreground group-hover:text-primary transition-colors">
            {node.name}
          </span>
          <span className="text-[9px] font-bold text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded-sm ml-auto">
            {node.assets.length + Object.keys(node.children).length}
          </span>
        </div>
      )}

      {/* Внутренности папки */}
      {(expanded || level === 0) && (
        <div
          className={`flex flex-col ${level > 0 ? "ml-3 border-l border-border/30 pl-2 mt-1 space-y-1 mb-2" : "space-y-2"}`}
        >
          {/* Рекурсивно рендерим дочерние папки */}
          {childFolders.map((child) => (
            <FolderNodeView
              key={child.fullPath}
              {...props}
              node={child}
              level={level + 1}
            />
          ))}

          {/* Рендерим файлы (ассеты) в текущей папке */}
          {sortedAssets.length > 0 && (
            <div className="space-y-1 mt-1">
              {sortedAssets.map((obj: any) => (
                <AssetRow
                  key={obj.Path}
                  obj={obj}
                  instances={props.groupedInstances.get(obj.Path) || []}
                  isExpanded={props.expandedAssets.has(obj.Name)}
                  onToggleGroup={() => {
                    props.setExpandedAssets((prev) => {
                      const next = new Set(prev);
                      if (next.has(obj.Name)) next.delete(obj.Name);
                      else next.add(obj.Name);
                      return next;
                    });
                  }}
                  onEditBg={() => props.setEditingBg(obj.Name)}
                  isCheckboxSelected={props.selAssets.has(obj.Path)}
                  onToggleCheckbox={() => {
                    props.clearInstances();
                    props.toggleAsset(obj.Path);
                  }}
                  isSelectionMode={props.hasAssetSel || props.isInboxMode}
                  assetBulkCount={props.assetCount}
                  onDeleteAsset={props.handleSmartDeleteAsset}
                  selectedInstances={props.selInstances}
                  onToggleInstance={(id) => {
                    props.clearAssets();
                    props.toggleInstance(id);
                  }}
                  isInstanceSelectionMode={props.hasInstSel}
                  instanceBulkCount={props.instCount}
                  onDeleteInstance={props.handleSmartDeleteInstance}
                  onDuplicateInstance={props.handleSmartDuplicateInstance}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExplorerAssets() {
  const [editingBg, setEditingBg] = useState<string | null>(null);
  const { folderTree, groupedInstances, newCount, mergedAssets } =
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

  const sharedProps = {
    groupedInstances,
    expandedAssets,
    setExpandedAssets,
    setEditingBg,
    selAssets,
    toggleAsset,
    hasAssetSel,
    isInboxMode,
    assetCount,
    handleSmartDeleteAsset,
    selInstances,
    toggleInstance,
    clearAssets,
    clearInstances,
    hasInstSel,
    instCount,
    handleSmartDeleteInstance,
    handleSmartDuplicateInstance,
  };

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
        <div className="p-3 pb-10">
          {Object.keys(folderTree.children).length > 0 ||
          folderTree.assets.length > 0 ? (
            <FolderNodeView node={folderTree} level={0} {...sharedProps} />
          ) : !isScanning ? (
            <div className="py-10 flex flex-col items-center justify-center text-center opacity-50">
              <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                No Objects
              </span>
              <span className="text-[10px] text-muted-foreground max-w-[200px]">
                Drop images into your project folder and click Scan.
              </span>
            </div>
          ) : null}
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
