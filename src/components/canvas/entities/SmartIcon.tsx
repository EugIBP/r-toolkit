import { useMemo, useState, useEffect, useRef } from "react";
import type { IconInstance } from "@/types/project";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useHistoryStore } from "@/store/useHistory";
import { loadImageCached, getCachedSize } from "@/lib/imageCache";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Copy, Trash2 } from "lucide-react";

type SnapTarget = {
  pos: number;
  type: "canvas" | "icon" | "layout";
  span?: [number, number];
  color?: string;
  axis?: "x" | "y";
  lineSpan?: [number, number];
};

export function SmartIcon({
  iconInstance,
  iconIndex,
  screenIdx,
  onStackClick,
}: {
  iconInstance: IconInstance;
  iconIndex: number;
  screenIdx: number;
  onStackClick?: (e: React.MouseEvent) => void;
}) {
  const { projectData, projectPath, updateIcon, duplicateIcon, deleteIcon } =
    useProjectStore();
  const {
    selectedIconIndex,
    setSelectedIcon,
    selectedStates,
    zoom,
    setSelectedAssetPath,
    setIconNaturalSize,
    iconFrames,
    iconFrameCounts,
    iconOrientations,
    snapToGrid,
    gridSize,
    canvasMode,
    allowDnd,
  } = useCanvasStore();

  const isSelected = selectedIconIndex === iconIndex;
  const isEditMode = canvasMode === "edit";

  const assetObj = useMemo(
    () => projectData?.Objects.find((o) => o.Name === iconInstance.Name),
    [projectData, iconInstance.Name],
  );

  const src = useMemo(() => {
    if (!assetObj || !projectPath) return null;
    const lastIdx = Math.max(
      projectPath.lastIndexOf("/"),
      projectPath.lastIndexOf("\\"),
    );
    const baseDir = projectPath.substring(0, lastIdx).replace(/\\/g, "/");
    const assetPath = assetObj.Path.replace(/\\/g, "/");
    const fullPath = `${baseDir}/${assetPath}`;
    return convertFileSrc(fullPath);
  }, [assetObj, projectPath]);

  const [naturalSize, setNaturalSize] = useState(
    () => (src ? getCachedSize(src) : null) ?? { width: 0, height: 0 },
  );

  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const iconStartPos = useRef({ x: 0, y: 0 });

  const snapTargetsRef = useRef<{ x: SnapTarget[]; y: SnapTarget[] }>({
    x: [],
    y: [],
  });
  const SNAP_TOLERANCE = 8;

  useEffect(() => {
    if (!src || !assetObj) return;
    loadImageCached(src, (size) => {
      setNaturalSize(size);
      setIconNaturalSize(assetObj.Path, size);
    });
  }, [src, assetObj?.Path]);

  const assetName = iconInstance.Name;
  const isSprite =
    assetObj?.isSprite || assetObj?.Path.toLowerCase().includes("sprites");
  const frames = isSprite ? iconFrameCounts[screenIdx]?.[assetName] || 1 : 1;
  const currentFrame = isSprite ? iconFrames[screenIdx]?.[assetName] || 0 : 0;
  const orientation = iconOrientations[screenIdx]?.[assetName] || "vertical";

  const frameSize = useMemo(() => {
    if (naturalSize.width === 0) return { width: 60, height: 60 };
    if (!isSprite)
      return { width: naturalSize.width, height: naturalSize.height };
    return {
      width:
        orientation === "horizontal"
          ? naturalSize.width / frames
          : naturalSize.width,
      height:
        orientation === "vertical"
          ? naturalSize.height / frames
          : naturalSize.height,
    };
  }, [naturalSize, isSprite, frames, orientation]);

  // Drag & Drop Logic
  useEffect(() => {
    if (!isDragging || !isEditMode || !allowDnd) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pData = useProjectStore.getState().projectData;
      const displayWidth = pData?.DisplayWidth || 1920;
      const displayHeight = pData?.DisplayHeight || 1080;

      const dx = (e.clientX - dragStartPos.current.x) / zoom;
      const dy = (e.clientY - dragStartPos.current.y) / zoom;
      let newX = iconStartPos.current.x + dx;
      let newY = iconStartPos.current.y + dy;

      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      const guides: import("@/store/canvasStore/types").GuideLine[] = [];

      // 1. ДИНАМИЧЕСКИЙ МАГНИТ ДЛЯ MESH и ISLANDS (Только если НЕ зажат Alt)
      if (!e.altKey) {
        const layouts =
          useCanvasStore.getState().screenLayouts[screenIdx] || [];
        layouts
          .filter((l) => l.visible)
          .forEach((layout) => {
            if (layout.type === "mesh" || layout.type === "islands") {
              const offsetX = layout.offset || 0;
              const offsetY = layout.offsetY || 0;
              const size = Math.max(2, layout.size);

              let nearestX =
                Math.round((newX - offsetX) / size) * size + offsetX;
              let nearestY =
                Math.round((newY - offsetY) / size) * size + offsetY;

              if (layout.type === "islands") {
                const cols = layout.count || 1;
                const rows = layout.rows || 1;
                const maxX = offsetX + cols * size;
                const maxY = offsetY + rows * size;

                if (
                  nearestX >= offsetX &&
                  nearestX <= maxX &&
                  Math.abs(newX - nearestX) < SNAP_TOLERANCE / zoom
                ) {
                  newX = nearestX;
                  guides.push({
                    axis: "x",
                    pos: nearestX,
                    type: "layout",
                    color: layout.color,
                  });
                }
                if (
                  nearestY >= offsetY &&
                  nearestY <= maxY &&
                  Math.abs(newY - nearestY) < SNAP_TOLERANCE / zoom
                ) {
                  newY = nearestY;
                  guides.push({
                    axis: "y",
                    pos: nearestY,
                    type: "layout",
                    color: layout.color,
                  });
                }
              } else {
                if (Math.abs(newX - nearestX) < SNAP_TOLERANCE / zoom) {
                  newX = nearestX;
                  guides.push({
                    axis: "x",
                    pos: nearestX,
                    type: "layout",
                    color: layout.color,
                  });
                }
                if (Math.abs(newY - nearestY) < SNAP_TOLERANCE / zoom) {
                  newY = nearestY;
                  guides.push({
                    axis: "y",
                    pos: nearestY,
                    type: "layout",
                    color: layout.color,
                  });
                }
              }
            }
          });
      }

      let snappedX = newX;
      let snappedY = newY;

      // 2. ОБЫЧНЫЕ МАГНИТЫ К ДРУГИМ ОБЪЕКТАМ (Колонки, Ряды, Иконки, Канвас)
      const enableIconSnap = e.altKey; // Иконки магнитятся ТОЛЬКО при зажатом Alt
      const enableLayoutSnap = !e.altKey; // Колонки и ряды - если Alt НЕ зажат
      const enableCanvasSnap = true; // Холст всегда

      const dragW = frameSize.width;
      const dragH = frameSize.height;

      let minDiffX = Infinity;
      let bestTargetX: SnapTarget | null = null;
      const checkSnapX = (offset: number) => {
        const testX = newX + offset;
        snapTargetsRef.current.x.forEach((target) => {
          if (target.type === "icon" && !enableIconSnap) return;
          if (target.type === "layout" && !enableLayoutSnap) return;
          if (target.type === "canvas" && !enableCanvasSnap) return;

          const diff = target.pos - testX;
          if (
            Math.abs(diff) < SNAP_TOLERANCE / zoom &&
            Math.abs(diff) < Math.abs(minDiffX)
          ) {
            minDiffX = diff;
            bestTargetX = target;
          }
        });
      };

      checkSnapX(0);
      checkSnapX(dragW / 2);
      checkSnapX(dragW);

      let minDiffY = Infinity;
      let bestTargetY: SnapTarget | null = null;
      const checkSnapY = (offset: number) => {
        const testY = newY + offset;
        snapTargetsRef.current.y.forEach((target) => {
          if (target.type === "icon" && !enableIconSnap) return;
          if (target.type === "layout" && !enableLayoutSnap) return;
          if (target.type === "canvas" && !enableCanvasSnap) return;

          const diff = target.pos - testY;
          if (
            Math.abs(diff) < SNAP_TOLERANCE / zoom &&
            Math.abs(diff) < Math.abs(minDiffY)
          ) {
            minDiffY = diff;
            bestTargetY = target;
          }
        });
      };

      checkSnapY(0);
      checkSnapY(dragH / 2);
      checkSnapY(dragH);

      if (bestTargetX) snappedX = newX + minDiffX;
      if (bestTargetY) snappedY = newY + minDiffY;

      if (bestTargetX) {
        let lineSpan: [number, number] | undefined;
        const targetX = bestTargetX as SnapTarget;
        if (targetX.type === "icon" && targetX.span) {
          lineSpan = [
            Math.min(targetX.span[0], snappedY),
            Math.max(targetX.span[1], snappedY + dragH),
          ];
        }
        guides.push({
          axis: "x",
          pos: targetX.pos,
          type: targetX.type,
          span: targetX.span,
          lineSpan,
          color: targetX.color,
        });
      }

      if (bestTargetY) {
        let lineSpan: [number, number] | undefined;
        const targetY = bestTargetY as SnapTarget;
        if (targetY.type === "icon" && targetY.span) {
          lineSpan = [
            Math.min(targetY.span[0], snappedX),
            Math.max(targetY.span[1], snappedX + dragW),
          ];
        }
        guides.push({
          axis: "y",
          pos: targetY.pos,
          type: targetY.type,
          span: targetY.span,
          lineSpan,
          color: targetY.color,
        });
      }

      useCanvasStore.getState().setActiveGuides(guides);

      snappedX = Math.max(0, Math.min(snappedX, displayWidth - 1));
      snappedY = Math.max(0, Math.min(snappedY, displayHeight - 1));

      updateIcon(screenIdx, iconIndex, {
        X: Math.round(snappedX),
        Y: Math.round(snappedY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      useCanvasStore.getState().setActiveGuides([]);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      useHistoryStore.getState().push(`Moved "${iconInstance.Name}"`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    zoom,
    snapToGrid,
    gridSize,
    isEditMode,
    allowDnd,
    screenIdx,
    iconIndex,
    updateIcon,
    frameSize.width,
    frameSize.height,
    iconInstance.Name,
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    if (onStackClick) return;

    if (assetObj) setSelectedAssetPath(assetObj.Path);
    setSelectedIcon(iconIndex);

    if (isEditMode && allowDnd) {
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      iconStartPos.current = { x: iconInstance.X, y: iconInstance.Y };

      const targetsX: SnapTarget[] = [];
      const targetsY: SnapTarget[] = [];
      const pData = useProjectStore.getState().projectData;
      const screen = pData?.Screens[screenIdx];
      const iSizes = useCanvasStore.getState().iconNaturalSizes;
      const iFrames = useCanvasStore.getState().iconFrameCounts;
      const iOrient = useCanvasStore.getState().iconOrientations;

      const displayWidth = pData?.DisplayWidth || 1920;
      const displayHeight = pData?.DisplayHeight || 1080;

      // 1. Канвас
      targetsX.push({ pos: 0, type: "canvas" });
      targetsX.push({ pos: displayWidth / 2, type: "canvas" });
      targetsX.push({ pos: displayWidth, type: "canvas" });

      targetsY.push({ pos: 0, type: "canvas" });
      targetsY.push({ pos: displayHeight / 2, type: "canvas" });
      targetsY.push({ pos: displayHeight, type: "canvas" });

      // 2. Другие иконки
      if (screen && pData) {
        screen.Icons.forEach((otherIcon, idx) => {
          if (idx === iconIndex) return;
          const otherAsset = pData.Objects.find(
            (o) => o.Name === otherIcon.Name,
          );
          if (!otherAsset) return;

          const isSpr =
            otherAsset.isSprite ||
            otherAsset.Path.toLowerCase().includes("sprites");
          const frm = isSpr ? iFrames[screenIdx]?.[otherAsset.Name] || 1 : 1;
          const ori = iOrient[screenIdx]?.[otherAsset.Name] || "vertical";
          const natSz = iSizes[otherAsset.Path] || { width: 64, height: 64 };

          const w = ori === "horizontal" ? natSz.width / frm : natSz.width;
          const h = ori === "vertical" ? natSz.height / frm : natSz.height;

          const spanY: [number, number] = [otherIcon.Y, otherIcon.Y + h];
          targetsX.push({ pos: otherIcon.X, type: "icon", span: spanY });
          targetsX.push({
            pos: otherIcon.X + w / 2,
            type: "icon",
            span: spanY,
          });
          targetsX.push({ pos: otherIcon.X + w, type: "icon", span: spanY });

          const spanX: [number, number] = [otherIcon.X, otherIcon.X + w];
          targetsY.push({ pos: otherIcon.Y, type: "icon", span: spanX });
          targetsY.push({
            pos: otherIcon.Y + h / 2,
            type: "icon",
            span: spanX,
          });
          targetsY.push({ pos: otherIcon.Y + h, type: "icon", span: spanX });
        });
      }

      // 3. Модульные сетки (Колонки и Ряды)
      const parseGaps = (gapsStr: string, count: number) => {
        if (!gapsStr || !gapsStr.trim())
          return Array(Math.max(0, count - 1)).fill(0);
        const parts = gapsStr.split(",").map((s) => parseInt(s.trim()) || 0);
        if (parts.length === 1)
          return Array(Math.max(0, count - 1)).fill(parts[0]);
        return Array.from({ length: Math.max(0, count - 1) }, (_, i) =>
          parts[i] !== undefined ? parts[i] : parts[parts.length - 1] || 0,
        );
      };

      const layouts = useCanvasStore.getState().screenLayouts[screenIdx] || [];

      layouts
        .filter((l) => l.visible)
        .forEach((layout) => {
          if (layout.type === "mesh" || layout.type === "islands") return;

          const gaps = parseGaps(layout.gaps, layout.count);
          const isCols = layout.type === "columns";
          let currentOffset = layout.offset;

          for (let i = 0; i < layout.count; i++) {
            const pos = currentOffset;
            const center = pos + layout.size / 2;
            const end = pos + layout.size;

            if (isCols) {
              targetsX.push({ pos, type: "layout", color: layout.color });
              targetsX.push({
                pos: center,
                type: "layout",
                color: layout.color,
              });
              targetsX.push({ pos: end, type: "layout", color: layout.color });
            } else {
              targetsY.push({ pos, type: "layout", color: layout.color });
              targetsY.push({
                pos: center,
                type: "layout",
                color: layout.color,
              });
              targetsY.push({ pos: end, type: "layout", color: layout.color });
            }

            if (i < layout.count - 1) currentOffset += layout.size + gaps[i];
          }
        });

      snapTargetsRef.current = { x: targetsX, y: targetsY };
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onStackClick) {
      onStackClick(e);
      return;
    }

    if (assetObj) setSelectedAssetPath(assetObj.Path);
    setSelectedIcon(iconIndex);
  };

  const spriteStyle = useMemo(() => {
    const multiplier = frames * 100;
    const size =
      orientation === "horizontal"
        ? `${multiplier}% 100%`
        : `100% ${multiplier}%`;
    const percentage = frames > 1 ? (currentFrame / (frames - 1)) * 100 : 0;
    const position =
      orientation === "horizontal" ? `${percentage}% 0%` : `0% ${percentage}%`;
    return { size, position };
  }, [frames, currentFrame, orientation]);

  const activeStateIdx = selectedStates[`${screenIdx}_${assetName}`];
  const activeState =
    activeStateIdx !== null && activeStateIdx !== undefined
      ? iconInstance.States?.[activeStateIdx]
      : null;
  const isPureBlank = activeState?.Color === "PURE_BLANK";

  const activeColorHex = useMemo(() => {
    if (activeState && !isPureBlank) {
      const hex = projectData?.Colors[activeState.Color];
      if (hex)
        return hex.length === 9 && hex.startsWith("#00")
          ? "#" + hex.substring(3)
          : hex;
    }
    return null;
  }, [activeState, isPureBlank, projectData?.Colors]);

  if (!assetObj || !src) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          onContextMenu={() => {
            if (!isSelected) {
              if (assetObj) setSelectedAssetPath(assetObj.Path);
              setSelectedIcon(iconIndex);
            }
          }}
          style={{
            width: frameSize.width * zoom,
            height: frameSize.height * zoom,
            cursor:
              isEditMode && allowDnd
                ? isDragging
                  ? "grabbing"
                  : "grab"
                : "pointer",
          }}
        >
          <div
            className={`w-full h-full relative overflow-hidden ${isDragging ? "opacity-70" : ""}`}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage:
                  isPureBlank || !activeColorHex ? `url('${src}')` : "none",
                backgroundColor: activeColorHex || "transparent",
                WebkitMaskImage:
                  activeColorHex && !isPureBlank ? `url('${src}')` : "none",
                maskImage:
                  activeColorHex && !isPureBlank ? `url('${src}')` : "none",
                backgroundSize: spriteStyle.size,
                backgroundPosition: spriteStyle.position,
                backgroundRepeat: "no-repeat",
                WebkitMaskSize: spriteStyle.size,
                WebkitMaskPosition: spriteStyle.position,
                WebkitMaskRepeat: "no-repeat",
                opacity: isPureBlank ? 0.5 : 1,
              }}
            />
            {isSelected && (
              <div className="absolute inset-0 border-2 border-primary rounded-sm pointer-events-none z-20 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            )}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            duplicateIcon(screenIdx, iconIndex);
          }}
          className="gap-2 cursor-pointer text-xs"
        >
          <Copy className="w-3.5 h-3.5 opacity-70" /> Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-border/50" />
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            deleteIcon(screenIdx, iconIndex);
            setSelectedIcon(null);
          }}
          className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
