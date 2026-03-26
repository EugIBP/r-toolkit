import { CheckSquare, Trash2, X, Copy } from "lucide-react";
import { ActionIcon } from "@/components/ui/action-icon";

interface ExplorerBulkActionsProps {
  selectedCount: number;
  label?: string; // "sel.", "instances"
  onSelectAllToggle?: () => void;
  isAllSelected?: boolean;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onCancel: () => void;
  extraActions?: React.ReactNode;
  customColor?: "primary" | "amber";
}

export function ExplorerBulkActions({
  selectedCount,
  label = "sel.",
  onSelectAllToggle,
  isAllSelected,
  onDelete,
  onDuplicate,
  onCancel,
  extraActions,
  customColor = "primary",
}: ExplorerBulkActionsProps) {
  const isAmber = customColor === "amber";
  const textColor = isAmber ? "text-amber-500" : "text-primary";
  const selectAllActive = isAmber
    ? "text-amber-500 bg-amber-500/20 hover:bg-amber-500/30"
    : "text-primary bg-primary/10 hover:bg-primary/20";
  const selectAllInactive = isAmber
    ? "text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10"
    : "text-muted-foreground hover:text-foreground";

  return (
    <div className="flex items-center justify-between w-full animate-in fade-in gap-2">
      <span className={`text-[11px] font-bold ${textColor} whitespace-nowrap`}>
        {selectedCount > 0 ? `${selectedCount} ${label}` : label}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {onSelectAllToggle && (
          <ActionIcon
            icon={CheckSquare}
            tooltip={isAllSelected ? "Deselect All" : "Select All"}
            className={isAllSelected ? selectAllActive : selectAllInactive}
            onClick={onSelectAllToggle}
          />
        )}
        {(onSelectAllToggle || onDuplicate) && (
          <div className="h-4 w-px bg-border mx-0.5" />
        )}

        {extraActions}

        {onDuplicate && (
          <ActionIcon
            icon={Copy}
            tooltip="Duplicate"
            className="text-secondary-foreground hover:bg-secondary/20"
            onClick={onDuplicate}
          />
        )}
        {onDelete && (
          <ActionIcon
            icon={Trash2}
            tooltip="Delete"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          />
        )}

        {(onDelete || onDuplicate || extraActions) && (
          <div className="h-4 w-px bg-border mx-0.5" />
        )}
        {onCancel && (
          <ActionIcon
            icon={X}
            onClick={onCancel}
            tooltip="Cancel"
            className="text-muted-foreground hover:text-foreground"
          />
        )}
      </div>
    </div>
  );
}
