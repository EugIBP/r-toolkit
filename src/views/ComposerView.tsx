import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { convertFileSrc } from "@tauri-apps/api/core";

import { LayoutRenderer } from "@/components/layout/LayoutRenderer";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { useHistoryStore } from "@/store/useHistory";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";

import { SmartIcon } from "@/components/canvas/entities/SmartIcon";
import { Explorer } from "@/components/composer/Explorer";
import { Inspector } from "@/components/composer/Inspector";
import { ComposerTopBar } from "@/components/composer/ComposerTopBar";
import { HotkeysPanel } from "@/components/composer/HotkeysPanel";
import { HistoryPanel } from "@/components/composer/HistoryPanel";
import { BackButton } from "@/components/ui/back-button";
import { Separator } from "@/components/ui/separator";

import {
  requestIdleCallbackCompat,
  cancelIdleCallbackCompat,
} from "@/lib/utils";
import type { IconInstance, AssetObject } from "@/types/project";

export function ComposerView() {
  const { projectData, projectPath, saveProject } = useProjectStore();
  const { saveWorkspace } = useCanvasStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setCurrentView, recentProjects } = useAppStore();
  const {
    zoom,
    snapToGrid,
    setSelectedIcon,
    setSelectedColorKey,
    setSelectedAssetPath,
    activeScreenIdx,
    setActiveScreenIdx,
    assetFilter,
    searchQuery,
    setSearchQuery,
    selectedAssetPath,
    expandedStackIndices,
    setExpandedStackIndices,
    iconNaturalSizes,
    iconFrameCounts,
    previewBgPath,
    setPreviewBgPath,
    stackThreshold,
    canvasMode,
    selectedIconIndex,
    activeGuides,
  } = useCanvasStore();

  const { containerRef, offset, isMiddlePanning, handleMouseDown } =
    useCanvasInteraction(projectPath);

  const currentProjectDisplayName = useMemo(() => {
    if (!projectPath) return null;
    const project = recentProjects.find((p) => p.path === projectPath);
    return project?.displayName || null;
  }, [projectPath, recentProjects]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === containerRef.current) {
        setSelectedIcon(null);
        setSelectedColorKey(null);
        setSelectedAssetPath(null);
        setExpandedStackIndices(null);
        setPreviewBgPath(null);
      }
    },
    [
      containerRef,
      setSelectedIcon,
      setSelectedColorKey,
      setSelectedAssetPath,
      setExpandedStackIndices,
      setPreviewBgPath,
    ],
  );

  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем хоткеи, если пользователь печатает текст в инспекторе
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.code === "Escape") {
        e.preventDefault();
        if (searchQuery) {
          setSearchQuery("");
        } else {
          setSelectedIcon(null);
          setSelectedColorKey(null);
          setSelectedAssetPath(null);
          setExpandedStackIndices(null);
          setPreviewBgPath(null);
        }
      }

      if (canvasMode === "edit" && selectedIconIndex !== null) {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          useProjectStore
            .getState()
            .deleteIcon(activeScreenIdx, selectedIconIndex);
          setSelectedIcon(null);
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") {
          e.preventDefault();
          useProjectStore
            .getState()
            .duplicateIcon(activeScreenIdx, selectedIconIndex);
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === "KeyY" || (e.code === "KeyZ" && e.shiftKey))
      ) {
        e.preventDefault();
        if (canRedo()) redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyS" && !e.shiftKey) {
        e.preventDefault();
        saveWorkspace();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyS" && e.shiftKey) {
        e.preventDefault();
        saveProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyK") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    searchQuery,
    setSearchQuery,
    setSelectedIcon,
    setSelectedColorKey,
    setSelectedAssetPath,
    setExpandedStackIndices,
    setPreviewBgPath,
    undo,
    redo,
    canUndo,
    canRedo,
    saveWorkspace,
    saveProject,
    canvasMode,
    selectedIconIndex,
    activeScreenIdx,
  ]);

  const stackedIcons = useMemo(() => {
    if (!projectData?.Screens?.[activeScreenIdx]?.Icons)
      return new Map<string, number[]>();
    const icons = projectData.Screens[activeScreenIdx].Icons;
    const stackMap = new Map<string, number[]>();
    icons.forEach((icon: IconInstance, idx: number) => {
      const key = `${Math.round(icon.X / stackThreshold)}_${Math.round(icon.Y / stackThreshold)}`;
      if (!stackMap.has(key)) stackMap.set(key, []);
      stackMap.get(key)!.push(idx);
    });
    const result = new Map<string, number[]>();
    stackMap.forEach((indices, key) => {
      if (indices.length > 1) result.set(key, indices);
    });
    return result;
  }, [projectData, activeScreenIdx, stackThreshold]);

  const BATCH_SIZE = 20;
  const totalIcons =
    projectData?.Screens?.[activeScreenIdx]?.Icons?.length ?? 0;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeScreenIdx]);

  useEffect(() => {
    if (visibleCount >= totalIcons) return;
    const id = requestIdleCallbackCompat(
      () => setVisibleCount((n) => Math.min(n + BATCH_SIZE, totalIcons)),
      { timeout: 100 },
    );
    return () => cancelIdleCallbackCompat(id);
  }, [visibleCount, totalIcons]);

  const activeScreen = projectData?.Screens?.[activeScreenIdx] || null;

  if (!projectData || !activeScreen) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-canvas text-white/20 gap-4">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-[0.2em] font-bold">
          Initialising Canvas...
        </span>
      </div>
    );
  }

  const canvasWidth = (projectData.DisplayWidth || 1920) * zoom;
  const canvasHeight = (projectData.DisplayHeight || 720) * zoom;

  const currentBg = (() => {
    if (!activeScreen.Background || !projectPath) return null;
    const bgAsset = projectData.Objects.find(
      (o: AssetObject) => o.Name === activeScreen.Background,
    );
    if (!bgAsset) return null;
    const lastIdx = Math.max(
      projectPath.lastIndexOf("/"),
      projectPath.lastIndexOf("\\"),
    );
    const baseDir = projectPath.substring(0, lastIdx).replace(/\\/g, "/");
    const assetPath = bgAsset.Path.replace(/\\/g, "/");
    return convertFileSrc(`${baseDir}/${assetPath}`);
  })();

  const previewBgSrc = (() => {
    if (!previewBgPath || !projectPath) return null;
    const lastIdx = Math.max(
      projectPath.lastIndexOf("/"),
      projectPath.lastIndexOf("\\"),
    );
    const baseDir = projectPath.substring(0, lastIdx).replace(/\\/g, "/");
    const assetPath = previewBgPath.replace(/\\/g, "/");
    return convertFileSrc(`${baseDir}/${assetPath}`);
  })();

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <aside className="shrink-0 flex flex-col border-r border-border bg-muted/10 w-95">
        <div className="h-20 px-5 flex items-center border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <BackButton
              label="Back"
              onClick={() => {
                sessionStorage.removeItem("currentView");
                sessionStorage.removeItem("projectPath");
                sessionStorage.removeItem("workspaceTab");
                setCurrentView("dashboard");
              }}
              className="shrink-0"
            />
            {currentProjectDisplayName && (
              <>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <span
                  className="text-xs font-medium text-muted-foreground truncate max-w-37.5"
                  title={currentProjectDisplayName}
                >
                  {currentProjectDisplayName}
                </span>
              </>
            )}
          </div>
        </div>
        <Explorer onScreenChange={setActiveScreenIdx} />
      </aside>

      <div className="flex-1 relative flex flex-col min-w-0 bg-bg-canvas">
        <ComposerTopBar searchInputRef={searchInputRef} />

        <div className="flex-1 relative overflow-hidden">
          <div className="absolute top-4 right-6 z-10">
            <HistoryPanel />
          </div>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onClick={handleContainerClick}
            className={`relative w-full h-full overflow-hidden select-none outline-none ${
              isMiddlePanning ? "cursor-grabbing" : ""
            }`}
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${offset.x}px ${offset.y}px`,
            }}
          >
            <div
              className="absolute shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-bg-panel"
              style={{
                left: `calc(50% + ${offset.x}px)`,
                top: `calc(50% + ${offset.y}px)`,
                transform: "translate(-50%, -50%)",
                width: canvasWidth,
                height: canvasHeight,
              }}
            >
              <div className="absolute inset-0 border border-white/40 pointer-events-none z-[1000] shadow-[0_0_15px_rgba(0,0,0,0.3)]" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/60 bg-black/40 px-2 py-0.5 rounded whitespace-nowrap z-[1001]">
                {projectData.DisplayWidth || 1920} ×{" "}
                {projectData.DisplayHeight || 1080}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScreenIdx}
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.05,
                    filter: "blur(10px)",
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute inset-0"
                  onClick={() => {
                    if (expandedStackIndices) {
                      setExpandedStackIndices(null);
                      setSelectedIcon(null);
                    }
                  }}
                >
                  {currentBg &&
                    !previewBgSrc &&
                    assetFilter !== "icons" &&
                    assetFilter !== "sprites" &&
                    assetFilter !== "stacked" && (
                      <motion.img
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: searchQuery ? 0.15 : 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        src={currentBg}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />
                    )}

                  {previewBgSrc && (
                    <motion.img
                      key={previewBgSrc}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      src={previewBgSrc}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]"
                    />
                  )}

                  <LayoutRenderer />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.2,
                    }}
                  >
                    {activeScreen.Icons?.slice(0, visibleCount).map(
                      (icon: IconInstance, idx: number) => {
                        const asset = projectData.Objects.find(
                          (o: AssetObject) => o.Name === icon.Name,
                        );
                        const isSprite =
                          asset?.isSprite ||
                          asset?.Path.toLowerCase().includes("sprites");

                        const iconStackKey = Array.from(
                          stackedIcons.keys(),
                        ).find((key) => stackedIcons.get(key)?.includes(idx));
                        const isStacked = !!iconStackKey;

                        if (assetFilter === "stacked") {
                          if (!isStacked) return null;
                        } else if (assetFilter !== "all") {
                          if (assetFilter === "icons" && isSprite) return null;
                          if (assetFilter === "sprites" && !isSprite)
                            return null;
                          if (assetFilter === "bg") return null;
                        }

                        const matchesSearch =
                          !searchQuery ||
                          icon.Name.toLowerCase().includes(
                            searchQuery.toLowerCase(),
                          );
                        const selectedAsset = projectData.Objects.find(
                          (o: AssetObject) => o.Path === selectedAssetPath,
                        );

                        const isSelectedAsset =
                          asset && asset.Path === selectedAsset?.Path;
                        const isInExpandedStack =
                          expandedStackIndices?.includes(idx) ?? false;
                        const matchesSelectedAsset =
                          !selectedAssetPath ||
                          isSelectedAsset ||
                          isInExpandedStack;

                        const isStackExpanded = expandedStackIndices !== null;
                        const stackIndex = isStackExpanded
                          ? expandedStackIndices.indexOf(idx)
                          : -1;
                        const centerIndex = isStackExpanded
                          ? (expandedStackIndices.length - 1) / 2
                          : 0;

                        const naturalW = asset
                          ? (iconNaturalSizes[asset.Path]?.width ?? 64)
                          : 64;
                        const iconW = isSprite
                          ? naturalW /
                            (iconFrameCounts[activeScreenIdx]?.[icon.Name] || 1)
                          : naturalW;
                        const stackStep = (iconW + 16) * zoom;
                        const expandedOffset =
                          isInExpandedStack && stackIndex >= 0
                            ? (stackIndex - centerIndex) * stackStep
                            : 0;
                        const isDimmed =
                          expandedStackIndices !== null && !isInExpandedStack;

                        const handleIconClick = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (asset) setSelectedAssetPath(asset.Path);

                          if (isStacked) {
                            if (!expandedStackIndices) {
                              const key = Array.from(stackedIcons.keys()).find(
                                (k) => stackedIcons.get(k)?.includes(idx),
                              );
                              setExpandedStackIndices(
                                stackedIcons.get(key || "") || [],
                              );
                            } else if (isInExpandedStack) {
                              setSelectedIcon(idx);
                            } else {
                              const key = Array.from(stackedIcons.keys()).find(
                                (k) => stackedIcons.get(k)?.includes(idx),
                              );
                              setExpandedStackIndices(
                                stackedIcons.get(key || "") || [],
                              );
                            }
                          } else {
                            setSelectedIcon(idx);
                          }
                        };

                        return (
                          <motion.div
                            key={`${icon.Name}_${idx}`}
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity:
                                matchesSearch && matchesSelectedAsset
                                  ? isDimmed
                                    ? 0.05
                                    : 1
                                  : 0.05,
                              x: expandedOffset,
                              scale: isInExpandedStack ? 1.2 : 1,
                            }}
                            style={{
                              position: "absolute",
                              left: icon.X * zoom,
                              top: icon.Y * zoom,
                              zIndex: isInExpandedStack ? 100 : 1,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                            onClick={isStacked ? handleIconClick : undefined}
                            className={
                              isStacked && !isInExpandedStack
                                ? "cursor-pointer"
                                : ""
                            }
                          >
                            <SmartIcon
                              iconInstance={icon}
                              iconIndex={idx}
                              screenIdx={activeScreenIdx}
                              onStackClick={
                                isStacked && !isInExpandedStack
                                  ? handleIconClick
                                  : undefined
                              }
                            />
                          </motion.div>
                        );
                      },
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* РЕНДЕР УМНЫХ НАПРАВЛЯЮЩИХ (SMART GUIDES) */}
              {activeGuides?.map((guide, i) => {
                const isCanvas = guide.type === "canvas";
                const isLayout = guide.type === "layout";

                // Определяем базовый цвет (классом или инлайн-стилем)
                let colorClass = "";
                if (isCanvas) colorClass = "bg-fuchsia-500";
                else if (!isLayout) {
                  colorClass = snapToGrid ? "bg-blue-500" : "bg-amber-400";
                }

                // Тень (свечение) для линий
                const shadowColor = isCanvas
                  ? "rgba(217,70,239,0.8)"
                  : isLayout
                    ? guide.color // Свечение цветом самой сетки
                    : snapToGrid
                      ? "rgba(59,130,246,0.8)"
                      : "rgba(251,191,36,0.8)";

                const isX = guide.axis === "x";

                const lineStyle: React.CSSProperties = {
                  ...(isLayout ? { backgroundColor: guide.color } : {}),
                };

                if (isCanvas || isLayout) {
                  // Для канваса и сеток рисуем линию через весь экран
                  lineStyle[isX ? "left" : "top"] = guide.pos * zoom;
                } else {
                  // Для магнита к иконкам рисуем только короткий отрезок
                  lineStyle[isX ? "left" : "top"] = guide.pos * zoom - 0.5;
                  lineStyle[isX ? "top" : "left"] =
                    (guide.lineSpan?.[0] || 0) * zoom;
                  lineStyle[isX ? "height" : "width"] =
                    ((guide.lineSpan?.[1] || 0) - (guide.lineSpan?.[0] || 0)) *
                    zoom;
                }

                const lineClasses =
                  isCanvas || isLayout
                    ? `absolute ${isX ? "top-0 bottom-0 w-[2px]" : "left-0 right-0 h-[2px]"} ${colorClass} z-[2000] pointer-events-none opacity-50`
                    : `absolute ${isX ? "w-[2px]" : "h-[2px]"} ${colorClass} z-[2000] pointer-events-none opacity-80`;

                const spanStyle: React.CSSProperties | undefined = guide.span
                  ? {
                      ...(isLayout ? { backgroundColor: guide.color } : {}),
                      [isX ? "left" : "top"]: guide.pos * zoom - 1.5,
                      [isX ? "width" : "height"]: 4,
                      [isX ? "top" : "left"]: guide.span[0] * zoom,
                      [isX ? "height" : "width"]:
                        (guide.span[1] - guide.span[0]) * zoom,
                      boxShadow: `0 0 8px ${shadowColor}, 0 0 2px ${shadowColor}`,
                    }
                  : undefined;

                return (
                  <div key={`${guide.axis}_${i}`}>
                    {/* Линия (через весь экран или только между объектами) */}
                    <div className={lineClasses} style={lineStyle} />

                    {/* Толстый светящийся край целевой иконки (показываем только для иконок) */}
                    {guide.type === "icon" && guide.span && (
                      <div
                        className={`absolute ${colorClass} z-[2001] pointer-events-none rounded-full`}
                        style={spanStyle}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <HotkeysPanel />
      </div>

      <Inspector />
    </div>
  );
}
