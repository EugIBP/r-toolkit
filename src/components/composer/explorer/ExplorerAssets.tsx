import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Plus,
  RefreshCw,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { BulkAddInstancesModal } from "../modals/BulkAddInstancesModal";
import { EditBackgroundModal } from "../modals/EditBackgroundModal";
import { useExplorerData } from "./useExplorerData";
import { AssetRow } from "./AssetRow";
import type { AssetObject } from "@/types/project";

export function ExplorerAssets() {
  const { projectData, scanDirectory } = useProjectStore();
  const { searchQuery, assetFilter } = useCanvasStore();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedDir, setExpandedDir] = useState<string | null>("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingBgName, setEditingBgName] = useState<string | null>(null);

  // Вся тяжелая логика скрыта здесь!
  const { newCount, mergedAssets, groupedInstances, assetsByDir, sortedDirs } =
    useExplorerData();

  if (!projectData || !projectData.Objects || !projectData.Screens) {
    return (
      <div className="flex justify-center h-40 text-muted-foreground italic text-xs">
        Initializing library...
      </div>
    );
  }

  const toggleGroup = (path: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const currentExpandedDir =
    expandedDir === ""
      ? sortedDirs.length > 0
        ? sortedDirs[0]
        : null
      : expandedDir;

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full min-w-0">
      {/* HEADER */}
      <div className="flex flex-col gap-2 px-3 py-3 border-b border-white/5 bg-white/[0.01] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 ml-1">
            <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Objects
            </span>
          </div>
          <motion.button
            onClick={scanDirectory}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg"
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
              onClick={() => setShowBulkModal(true)}
              className="w-full mb-3 flex justify-center gap-2 py-2 border border-dashed border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5" /> Add {newCount} New Assets
            </motion.button>
          )}

          {mergedAssets.length === 0 ? (
            <div className="py-10 text-center opacity-30 text-xs uppercase font-medium">
              No matching assets
            </div>
          ) : (
            sortedDirs.map((dir) => {
              const dirAssets = assetsByDir.get(dir) || [];
              const isDirExpanded = currentExpandedDir === dir;

              return (
                <div key={dir} className="space-y-1">
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5"
                    onClick={() => setExpandedDir(isDirExpanded ? null : dir)}
                  >
                    {isDirExpanded ? (
                      <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {dir}
                    </span>
                    <span className="text-xs text-muted-foreground/50">
                      ({dirAssets.length})
                    </span>
                  </div>

                  {isDirExpanded &&
                    dirAssets.map((obj: AssetObject & { dir?: string }) => (
                      <AssetRow
                        key={obj.Path}
                        obj={obj}
                        instances={groupedInstances.get(obj.Path) || []}
                        isExpanded={expandedGroups.has(obj.Path)}
                        onToggleGroup={() => toggleGroup(obj.Path)}
                        onEditBg={() => setEditingBgName(obj.Name)}
                      />
                    ))}
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
