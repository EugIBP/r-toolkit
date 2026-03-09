import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

interface BulkActionsBarProps {
  visibleProjects: any[];
}

export function BulkActionsBar({ visibleProjects }: BulkActionsBarProps) {
  const { selectedProjectIds, clearSelection, removeRecent, selectAll, confirm } =
    useAppStore();

  const selectedCount = selectedProjectIds.size;

  const handleDeleteSelected = async () => {
    const yes = await confirm(
      "Delete Workspaces",
      `Are you sure you want to delete ${selectedCount} workspace(s)?\n\nThis action cannot be undone.`,
    );

    if (!yes) return;

    try {
      for (const id of selectedProjectIds) {
        await removeRecent(id);
      }
      toast.success(`Deleted ${selectedCount} workspace(s)`, {
        id: "bulk-delete-success",
      });
      clearSelection();
    } catch (error) {
      toast.error("Failed to delete workspaces", {
        id: "bulk-delete-error",
      });
    }
  };

  const handleSelectAllVisible = () => {
    const visibleIds = visibleProjects.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedProjectIds.has(id));

    if (allSelected) {
      // Deselect all visible
      const newSelected = new Set(selectedProjectIds);
      visibleIds.forEach((id) => newSelected.delete(id));
      useAppStore.getState().selectedProjectIds = newSelected;
      useAppStore.getState().clearSelection();
    } else {
      // Select all visible
      selectAll(visibleIds);
    }
  };

  const allVisibleSelected = visibleProjects.every((p) =>
    selectedProjectIds.has(p.id),
  );

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-medium text-white">
              {selectedCount} selected
            </span>

            <div className="h-4 w-px bg-white/10" />

            <Button
              variant="ghost-dark"
              size="sm"
              onClick={handleSelectAllVisible}
              className="gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="text-xs">
                {allVisibleSelected ? "Deselect All" : "Select All"}
              </span>
            </Button>

            <Button
              variant="ghost-dark"
              size="sm"
              onClick={handleDeleteSelected}
              className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs">Delete</span>
            </Button>

            <div className="h-4 w-px bg-white/10" />

            <button
              onClick={clearSelection}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
