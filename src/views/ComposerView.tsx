import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { useHistoryStore } from "@/store/useHistory";
import { SmartIcon } from "@/components/canvas/entities/SmartIcon";
import { Explorer } from "@/components/composer/Explorer";
import { Inspector } from "@/components/composer/Inspector";
import { AssetsToolbar, ModeToolbar } from "@/components/composer/ComposerToolbar";
import { ZoomToolbar } from "@/components/composer/ZoomToolbar";
import { HistoryPanel } from "@/components/composer/HistoryPanel";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ArrowLeft } from "lucide-react";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";

const STACK_THRESHOLD = 5;

export function ComposerView() {
  const { projectData, projectPath, saveProject } = useProjectStore();
  const { saveWorkspace } = useCanvasStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setCurrentView } = useAppStore();
  const {
    zoom,
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
  } = useCanvasStore();

  const { containerRef, offset, isMiddlePanning, handleMouseDown } =
    useCanvasInteraction(projectPath);

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
    [containerRef, setSelectedIcon, setSelectedColorKey, setSelectedAssetPath, setExpandedStackIndices, setPreviewBgPath],
  );

  // ESC сбрасывает выделение или очищает поиск, Ctrl+Z undo, Ctrl+Shift+Z redo, Ctrl+S save workspace, Ctrl+Shift+S save project, Ctrl+K search
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.code === "KeyY" || (e.code === "KeyZ" && e.shiftKey))) {
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
  }, [searchQuery, setSearchQuery, setSelectedIcon, setSelectedColorKey, setSelectedAssetPath, setExpandedStackIndices, undo, redo, canUndo, canRedo, saveWorkspace, saveProject, searchInputRef]);

  const stackedIcons = useMemo(() => {
    if (!projectData?.Screens?.[activeScreenIdx]?.Icons) return new Map<string, number[]>();
    const icons = projectData.Screens[activeScreenIdx].Icons;
    const stackMap = new Map<string, number[]>();
    icons.forEach((icon: any, idx: number) => {
      const key = `${Math.round(icon.X / STACK_THRESHOLD)}_${Math.round(icon.Y / STACK_THRESHOLD)}`;
      if (!stackMap.has(key)) stackMap.set(key, []);
      stackMap.get(key)!.push(idx);
    });
    const result = new Map<string, number[]>();
    stackMap.forEach((indices, key) => { if (indices.length > 1) result.set(key, indices); });
    return result;
  }, [projectData, activeScreenIdx]);

  // Батчинг рендера иконок: показываем по BATCH_SIZE штук за раз,
  // чтобы не блокировать UI при открытии экрана с большим количеством ассетов.
  const BATCH_SIZE = 20;
  const totalIcons = projectData?.Screens?.[activeScreenIdx]?.Icons?.length ?? 0;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeScreenIdx]);

  useEffect(() => {
    if (visibleCount >= totalIcons) return;
    const id = requestIdleCallback(
      () => setVisibleCount((n) => Math.min(n + BATCH_SIZE, totalIcons)),
      { timeout: 100 },
    );
    return () => cancelIdleCallback(id);
  }, [visibleCount, totalIcons]);

  const activeScreen = projectData?.Screens?.[activeScreenIdx] || null;

  if (!projectData || !activeScreen) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] text-white/20 gap-4">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Initialising Canvas...</span>
      </div>
    );
  }

  const canvasWidth = (projectData.DisplayWidth || 1920) * zoom;
  const canvasHeight = (projectData.DisplayHeight || 1080) * zoom;

  const currentBg = (() => {
    if (!activeScreen.Background || !projectPath) return null;
    const bgAsset = projectData.Objects.find((o: any) => o.Name === activeScreen.Background);
    if (!bgAsset) return null;
    const lastIdx = Math.max(projectPath.lastIndexOf("/"), projectPath.lastIndexOf("\\"));
    return convertFileSrc(`${projectPath.substring(0, lastIdx)}/${bgAsset.Path}`.replace(/\\/g, "/"));
  })();

  const previewBgSrc = (() => {
    if (!previewBgPath || !projectPath) return null;
    const lastIdx = Math.max(projectPath.lastIndexOf("/"), projectPath.lastIndexOf("\\"));
    return convertFileSrc(`${projectPath.substring(0, lastIdx)}/${previewBgPath}`.replace(/\\/g, "/"));
  })();

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="shrink-0 flex flex-col border-r border-white/10 bg-[#030303]">
        <button
          onClick={() => setCurrentView("dashboard")}
          className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors border-b border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Workspace
        </button>
        <Explorer onScreenChange={setActiveScreenIdx} />
      </div>

      <div className="flex-1 relative flex flex-col min-w-0 bg-[#050505]">
        <AssetsToolbar searchInputRef={searchInputRef} />
        <ModeToolbar />
        <div className="absolute top-6 right-8 z-50">
          <HistoryPanel />
        </div>

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onClick={handleContainerClick}
          className={`flex-1 relative overflow-hidden select-none outline-none ${
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
            className="absolute shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 bg-[#0a0a0a]"
            style={{
              left: `calc(50% + ${offset.x}px)`,
              top: `calc(50% + ${offset.y}px)`,
              transform: "translate(-50%, -50%)",
              width: canvasWidth,
              height: canvasHeight,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScreenIdx}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {activeScreen.Icons?.slice(0, visibleCount).map((icon: any, idx: number) => {
                    const asset = projectData.Objects.find((o: any) => o.Name === icon.Name);
                    const isSprite = asset?.isSprite || asset?.Path.toLowerCase().includes("sprites");

                    const iconStackKey = Array.from(stackedIcons.keys()).find((key) =>
                      stackedIcons.get(key)?.includes(idx),
                    );
                    const isStacked = !!iconStackKey;

                    if (assetFilter === "stacked") {
                      if (!isStacked) return null;
                    } else if (assetFilter !== "all") {
                      if (assetFilter === "icons" && isSprite) return null;
                      if (assetFilter === "sprites" && !isSprite) return null;
                      if (assetFilter === "bg") return null;
                    }

                    const matchesSearch =
                      !searchQuery || icon.Name.toLowerCase().includes(searchQuery.toLowerCase());
                    const selectedAsset = projectData.Objects.find(
                      (o: any) => o.Path === selectedAssetPath,
                    );
                    const matchesSelectedAsset =
                      !selectedAssetPath ||
                      (asset && asset.Path === selectedAsset?.Path);

                    const isInExpandedStack = expandedStackIndices?.includes(idx) ?? false;
                    const isStackExpanded = expandedStackIndices !== null;
                    const stackIndex = isStackExpanded ? expandedStackIndices.indexOf(idx) : -1;
                    const centerIndex = isStackExpanded
                      ? (expandedStackIndices.length - 1) / 2
                      : 0;
                    // Шаг = реальная ширина иконки (из naturalSize) + зазор 16px
                    const naturalW = asset ? (iconNaturalSizes[asset.Path]?.width ?? 64) : 64;
                    const iconW = isSprite
                      ? naturalW / (iconFrameCounts[activeScreenIdx]?.[icon.Name] || 1)
                      : naturalW;
                    const stackStep = (iconW + 16) * zoom;
                    const expandedOffset =
                      isInExpandedStack && stackIndex >= 0
                        ? (stackIndex - centerIndex) * stackStep
                        : 0;
                    const isDimmed = expandedStackIndices !== null && !isInExpandedStack;

                    const handleIconClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (asset) setSelectedAssetPath(asset.Path);

                      if (isStacked) {
                        if (!expandedStackIndices) {
                          // Стек закрыт — раскрыть
                          const key = Array.from(stackedIcons.keys()).find((k) =>
                            stackedIcons.get(k)?.includes(idx),
                          );
                          setExpandedStackIndices(stackedIcons.get(key || "") || []);
                        } else if (isInExpandedStack) {
                          // Клик по иконке из раскрытого стека — выбрать, стек остаётся открытым
                          setSelectedIcon(idx);
                        } else {
                          // Клик по иконке из другого стека — переключить на него
                          const key = Array.from(stackedIcons.keys()).find((k) =>
                            stackedIcons.get(k)?.includes(idx),
                          );
                          setExpandedStackIndices(stackedIcons.get(key || "") || []);
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
                              ? isDimmed ? 0.1 : 1
                              : 0.15,
                          x: expandedOffset,
                          scale: isInExpandedStack ? 1.2 : 1,
                        }}
                        style={{
                          position: "absolute",
                          left: icon.X * zoom,
                          top: icon.Y * zoom,
                          zIndex: isInExpandedStack ? 100 : 1,
                        }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        onClick={isStacked ? handleIconClick : undefined}
                        className={isStacked && !isInExpandedStack ? "cursor-pointer" : ""}
                      >
                        <SmartIcon
                          iconInstance={icon}
                          iconIndex={idx}
                          screenIdx={activeScreenIdx}
                          onStackClick={isStacked && !isInExpandedStack ? handleIconClick : undefined}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <ZoomToolbar />
      </div>

      <Inspector />
    </div>
  );
}
