import { useEffect } from "react";

interface HotkeyActions {
  onDelete?: (e: KeyboardEvent) => void;
  onDuplicate?: (e: KeyboardEvent) => void;
  isActive?: boolean;
}

export function useExplorerHotkeys({
  onDelete,
  onDuplicate,
  isActive = true,
}: HotkeyActions) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (onDelete) onDelete(e);
      }

      if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") {
        if (onDuplicate) onDuplicate(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onDelete, onDuplicate]);
}
