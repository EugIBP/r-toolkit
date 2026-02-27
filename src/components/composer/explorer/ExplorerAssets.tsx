import { useState, useMemo } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Box,
  Film,
  Image as BgIcon,
  Plus,
  RefreshCw,
  FolderOpen,
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
import { BulkAddInstancesModal } from "../modals/BulkAddInstancesModal";
import { EditBackgroundModal } from "../modals/EditBackgroundModal";

const STACK_THRESHOLD = 5;

export function ExplorerAssets() {
  const { projectData, scanDirectory, scannedFiles, addInstance, updateScreen, deleteProjectObject } =
    useProjectStore();

  const {
    searchQuery,
    assetFilter,
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

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingBgName, setEditingBgName] = useState<string | null>(null);

  const stackedAssetNames = useMemo(() => {
    if (!projectData?.Screens?.[activeScreenIdx]?.Icons) return new Set<string>();

    const icons = projectData.Screens[activeScreenIdx].Icons;
    const positionMap = new Map<string, string[]>();

    icons.forEach((icon: any) => {
      const key = `${Math.round(icon.X / STACK_THRESHOLD)}_${Math.round(icon.Y / STACK_THRESHOLD)}`;
      if (!positionMap.has(key)) positionMap.set(key, []);
      positionMap.get(key)!.push(icon.Name);
    });

    const stackedNames = new Set<string>();
    positionMap.forEach((names) => {
      if (names.length > 1) names.forEach((name) => stackedNames.add(name));
    });

    return stackedNames;
  }, [projectData, activeScreenIdx]);

  if (!projectData || !projectData.Objects || !projectData.Screens) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground italic text-xs">
        Initializing library...
      </div>
    );
  }

  // Merge registered objects + unregistered scanned files
  const allFilesMap = new Map();
  projectData.Objects.forEach((obj: any) =>
    allFilesMap.set(obj.Path, { ...obj, isRegistered: true }),
  );

  let newCount = 0;
  if (scannedFiles) {
    scannedFiles.forEach((path) => {
      if (!allFilesMap.has(path)) {
        newCount++;
        const name =
          path
            .split(/[\\/]/)
            .pop()
            ?.replace(/\.[^/.]+$/, "") || path;
        const pathLower = path.toLowerCase();
        const isBackground = pathLower.includes("backgrounds");
        allFilesMap.set(path, {
          Name: name,
          Path: path,
          Type: isBackground ? "Bin" : "Ico",
          isRegistered: false,
        });
      }
    });
  }

  // Collect instances grouped by asset path (across all screens)
  const groupedInstances = new Map<
    string,
    Array<{ iconIdx: number; icon: any; isBackground?: boolean; screenIdx: number }>
  >();

  projectData.Screens.forEach((screen: any, screenIdx: number) => {
    if (screen.Background) {
      const bgAsset = projectData.Objects.find((o: any) => o.Name === screen.Background);
      if (bgAsset) {
        if (!groupedInstances.has(bgAsset.Path)) groupedInstances.set(bgAsset.Path, []);
        groupedInstances.get(bgAsset.Path)!.push({
          iconIdx: -1,
          icon: { Name: bgAsset.Name, X: 0, Y: 0 },
          isBackground: true,
          screenIdx,
        });
      }
    }
    screen.Icons?.forEach((icon: any, iconIdx: number) => {
      const asset = projectData.Objects.find((o: any) => o.Name === icon.Name);
      if (asset) {
        if (!groupedInstances.has(asset.Path)) groupedInstances.set(asset.Path, []);
        groupedInstances.get(asset.Path)!.push({ iconIdx, icon, screenIdx });
      }
    });
  });

  let mergedAssets = Array.from(allFilesMap.values());

  if (searchQuery) {
    mergedAssets = mergedAssets.filter((obj) =>
      obj.Name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  if (assetFilter !== "all") {
    mergedAssets = mergedAssets.filter((obj) => {
      const pathLower = obj.Path.toLowerCase();
      const isSprite = pathLower.includes("sprites");
      const isBG = pathLower.includes("backgrounds");
      if (assetFilter === "bg") return isBG;
      if (assetFilter === "sprites") return isSprite;
      if (assetFilter === "icons") return !isSprite && !isBG;
      if (assetFilter === "stacked") return stackedAssetNames.has(obj.Name);
      return true;
    });
  }

  const toggleGroup = (path: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleQuickAdd = (assetName: string) => {
    addInstance(activeScreenIdx, assetName, {
      name: assetName,
      x: 0,
      y: 0,
      states: [{ Name: "DEFAULT", Color: "PURE_WHITE" }],
    });
  };

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

  const handleAddToScreen = (assetName: string, screenIdx: number) => {
    addInstance(screenIdx, assetName, {
      name: assetName,
      x: 0,
      y: 0,
      states: [{ Name: "DEFAULT", Color: "PURE_WHITE" }],
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="flex flex-col gap-2 px-3 py-3 border-b border-white/5 bg-white/[0.01] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 ml-1">
            <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Objects
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scanDirectory()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* CONTENT */}
      <ScrollArea className="flex-1 h-full w-full">
        <div className="p-3 space-y-2 pb-40">
          {newCount > 0 && !searchQuery && assetFilter === "all" && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowBulkModal(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full mb-3 flex items-center justify-center gap-2 py-2 border border-dashed border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add {newCount} New Assets
            </motion.button>
          )}

          {mergedAssets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center opacity-30 text-[10px] uppercase tracking-widest font-medium"
            >
              {projectData.Objects.length === 0
                ? "No assets registered"
                : assetFilter === "stacked"
                  ? "No stacked instances found"
                  : assetFilter === "icons"
                    ? "No icons found"
                    : assetFilter === "sprites"
                      ? "No sprites found"
                      : assetFilter === "bg"
                        ? "No backgrounds found"
                        : "No matching assets"}
            </motion.div>
          ) : (
            mergedAssets.map((obj: any) => {
              const pathLower = obj.Path.toLowerCase();
              const isSprite = pathLower.includes("sprites");
              const isBG = pathLower.includes("backgrounds");
              const isSelected = selectedAssetPath === obj.Path;
              const instances = groupedInstances.get(obj.Path) || [];
              const hasInstances = instances.length > 0;
              const isExpanded = expandedGroups.has(obj.Path);

              return (
                <div key={obj.Path} className="space-y-1">
                  {/* Asset row */}
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all group/asset ${
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
                        toggleGroup(obj.Path);
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

                    <span className="text-[10px] font-semibold text-white truncate flex-1">
                      {obj.Name}
                    </span>

                    {hasInstances && (
                      <span className="text-[9px] text-muted-foreground font-mono shrink-0 opacity-0 group-hover/asset:opacity-100 transition-opacity">
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
                                <span className="text-emerald-400">Remove as Background</span>
                              </>
                            ) : (
                              <>
                                <BgIcon className="w-3.5 h-3.5 opacity-70" />
                                Set as Background
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBgName(obj.Name);
                            }}
                            className="gap-2 cursor-pointer focus:bg-white/10 text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 opacity-70" />
                            Edit…
                          </DropdownMenuItem>
                          <div className="h-px bg-white/5 my-1" />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAsset(obj.Name);
                            }}
                            className="gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove from project
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
                            <Plus className="w-3.5 h-3.5 opacity-70" />
                            Add to current screen
                          </DropdownMenuItem>
                          {projectData.Screens.length > 1 && (
                            <>
                              <div className="h-px bg-white/5 my-1" />
                              {projectData.Screens.map((screen: any, idx: number) => (
                                idx !== activeScreenIdx && (
                                  <DropdownMenuItem
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToScreen(obj.Name, idx);
                                    }}
                                    className="gap-2 cursor-pointer focus:bg-white/10 text-xs"
                                  >
                                    <span className="w-3.5 h-3.5 opacity-60 text-center text-[9px] font-bold">
                                      S{idx + 1}
                                    </span>
                                    {screen.Name}
                                  </DropdownMenuItem>
                                )
                              ))}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Instances list (expanded, non-bg) */}
                  {isExpanded && !isBG && hasInstances && (
                    <div className="ml-6 space-y-1">
                      {instances.map(({ iconIdx, icon, isBackground: isBgInst, screenIdx }) => (
                        <div
                          key={`${icon.Name}_${screenIdx}_${iconIdx}`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-white/5 rounded-lg cursor-default transition-all"
                        >
                          <span className="text-[10px] font-mono text-white truncate flex-1">
                            {icon.Name}
                          </span>
                          {isBgInst ? (
                            <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase shrink-0">
                              BG
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                              S{screenIdx + 1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <BulkAddInstancesModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />

      <EditBackgroundModal
        isOpen={!!editingBgName}
        onClose={() => setEditingBgName(null)}
        assetName={editingBgName ?? ""}
      />
    </div>
  );
}
