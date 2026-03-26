import { useAppStore } from "@/store/useAppStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConfirmModal() {
  const { confirmDialog, closeConfirm } = useAppStore();

  const handleCancel = () => {
    if (confirmDialog) {
      confirmDialog.resolve(false);
      closeConfirm();
    }
  };

  const handleConfirm = () => {
    if (confirmDialog) {
      confirmDialog.resolve(true);
      closeConfirm();
    }
  };

  return (
    <AlertDialog
      open={!!confirmDialog}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <AlertDialogContent className="bg-background border-border">
        <AlertDialogHeader>
          {/* Используем опциональную цепочку ?., так как при закрытии confirmDialog становится null */}
          <AlertDialogTitle>{confirmDialog?.title || ""}</AlertDialogTitle>
          <AlertDialogDescription>
            {confirmDialog?.message || ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
