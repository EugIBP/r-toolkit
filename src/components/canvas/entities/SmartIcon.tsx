import { useMemo, useState, useEffect, useRef } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useHistoryStore } from "@/store/useHistory";
import { loadImageCached, getCachedSize } from "@/lib/imageCache";

export function SmartIcon({
  iconInstance,
  iconIndex,
  screenIdx,
  onStackClick,
}: {
  iconInstance: any;
  iconIndex: number;
  screenIdx: number;
  onStackClick?: (e: React.MouseEvent) => void;
}) {
  const { projectData, projectPath, updateIcon } = useProjectStore();
  const { selectedIconIndex, setSelectedIcon, selectedStates, zoom, setSelectedAssetPath, setIconNaturalSize } =
    useCanvasStore();


  const {
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
    () => projectData?.Objects.find((o: any) => o.Name === iconInstance.Name),
    [projectData, iconInstance.Name],
  );

  const src = useMemo(() => {
    if (!assetObj || !projectPath) return null;
    const lastIdx = Math.max(
      projectPath.lastIndexOf("/"),
      projectPath.lastIndexOf("\\"),
    );
    const baseDir = projectPath.substring(0, lastIdx);
    const fullPath = `${baseDir}/${assetObj.Path}`.replace(/\\/g, "/");
    return convertFileSrc(fullPath);
  }, [assetObj, projectPath]);

  const [naturalSize, setNaturalSize] = useState(
    () => (src ? getCachedSize(src) : null) ?? { width: 0, height: 0 },
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const iconStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!src || !assetObj) return;
    loadImageCached(src, (size) => {
      setNaturalSize(size);
      setIconNaturalSize(assetObj.Path, size);
    });
  }, [src, assetObj?.Path]);

  // Drag & Drop Logic
  useEffect(() => {
    if (!isDragging || !isEditMode || !allowDnd) return;

    const displayWidth = projectData?.DisplayWidth || 1920;
    const displayHeight = projectData?.DisplayHeight || 1080;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStartPos.current.x) / zoom;
      const dy = (e.clientY - dragStartPos.current.y) / zoom;
      let newX = iconStartPos.current.x + dx;
      let newY = iconStartPos.current.y + dy;

      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // Clamp to display bounds - top-left corner can't go outside
      newX = Math.max(0, Math.min(newX, displayWidth - 1));
      newY = Math.max(0, Math.min(newY, displayHeight - 1));

      updateIcon(screenIdx, iconIndex, {
        X: Math.round(newX),
        Y: Math.round(newY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
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
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    // Если это стекованная иконка — не начинаем drag и не выбираем сразу
    if (onStackClick) return;

    if (assetObj) setSelectedAssetPath(assetObj.Path);
    setSelectedIcon(iconIndex);

    if (isEditMode && allowDnd) {
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      iconStartPos.current = { x: iconInstance.X, y: iconInstance.Y };
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Если есть внешний обработчик стека — делегируем ему
    if (onStackClick) {
      onStackClick(e);
      return;
    }

    if (assetObj) setSelectedAssetPath(assetObj.Path);
    setSelectedIcon(iconIndex);
  };

  // Sprite & States Logic (using assetName instead of index)
  const assetName = iconInstance.Name;
  const isSprite = assetObj?.isSprite || assetObj?.Path.toLowerCase().includes("sprites");
  const frames = isSprite ? (iconFrameCounts[screenIdx]?.[assetName] || 1) : 1;
  const currentFrame = isSprite ? (iconFrames[screenIdx]?.[assetName] || 0) : 0;
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
  const activeState = activeStateIdx !== null && activeStateIdx !== undefined 
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
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
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
        {isPureBlank ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url('${src}')`,
              backgroundSize: spriteStyle.size,
              backgroundPosition: spriteStyle.position,
              backgroundRepeat: "no-repeat",
              opacity: 0.5,
            }}
          />
        ) : activeColorHex ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: activeColorHex,
              WebkitMaskImage: `url('${src}')`,
              maskImage: `url('${src}')`,
              WebkitMaskSize: spriteStyle.size,
              WebkitMaskPosition: spriteStyle.position,
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url('${src}')`,
              backgroundSize: spriteStyle.size,
              backgroundPosition: spriteStyle.position,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-primary rounded-sm pointer-events-none z-20 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
        )}
      </div>
    </div>
  );
}
