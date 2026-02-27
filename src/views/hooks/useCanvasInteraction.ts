import { useEffect, useRef, useState, useCallback } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";

const MAX_OFFSET = 500;

export function useCanvasInteraction(projectPath: string | null) {
  const { zoom, setZoom, saveWorkspace, hasUnsavedChanges, autoSaveEnabled, autoSaveInterval } =
    useCanvasStore();

  const [isMiddlePanning, setIsMiddlePanning] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const isPanningRef = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const lastProjectPathRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-save with debounce
  useEffect(() => {
    if (!hasUnsavedChanges || !autoSaveEnabled) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => { saveWorkspace(); }, autoSaveInterval);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [hasUnsavedChanges, saveWorkspace, autoSaveEnabled, autoSaveInterval]);

  // Auto-save on unmount
  useEffect(() => {
    return () => { if (hasUnsavedChanges) saveWorkspace(); };
  }, [hasUnsavedChanges, saveWorkspace]);

  // Mouse move/up while panning (MMB)
  useEffect(() => {
    if (!isMiddlePanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setOffset({
        x: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offsetStart.current.x + dx)),
        y: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offsetStart.current.y + dy)),
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsMiddlePanning(false);
        isPanningRef.current = false;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isMiddlePanning]);

  // Scroll — zoom (plain scroll или Ctrl+Scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(Math.round(Math.min(Math.max(zoom + delta, 0.25), 2) * 100) / 100);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoom, setZoom]);

  // Reset offset on project change
  useEffect(() => {
    if (projectPath && projectPath !== lastProjectPathRef.current) {
      lastProjectPathRef.current = projectPath;
      setOffset({ x: 0, y: 0 });
    }
  }, [projectPath]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        panStart.current = { x: e.clientX, y: e.clientY };
        offsetStart.current = { ...offset };
        setIsMiddlePanning(true);
        isPanningRef.current = true;
      }
    },
    [offset],
  );

  return { containerRef, offset, isMiddlePanning, handleMouseDown };
}
