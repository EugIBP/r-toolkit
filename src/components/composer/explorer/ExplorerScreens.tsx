import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Layout,
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  Monitor,
  ChevronLeft,
  Box,
  Film,
  Image as BgIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExplorerScreens({
  onScreenChange,
}: {
  onScreenChange: (i: number) => void;
}) {
  const { projectData, addScreen, duplicateScreen, deleteScreen } =
    useProjectStore();
  const {
    setSelectedIcon,
    canvasMode,
    activeScreenIdx,
    screenListMode,
    setScreenListMode,
    selectedIconIndex,
    setSelectedAssetPath,
  } = useCanvasStore();
  const { confirm } = useAppStore();

  if (!projectData) return null;

  const isEditMode = canvasMode === "edit";
  const activeScreen = projectData.Screens[activeScreenIdx];

  const handleDelete = async (index: number, name: string) => {
    if (projectData.Screens.length <= 1) {
      alert("Cannot delete the last screen.");
      return;
    }

    const yes = await confirm(
      "Delete Screen",
      `Are you sure you want to delete screen "${name}"?`,
    );
    if (yes) {
      deleteScreen(index);
      if (index === activeScreenIdx) {
        onScreenChange(Math.max(0, index - 1));
      } else if (index < activeScreenIdx) {
        onScreenChange(activeScreenIdx - 1);
      }
      setSelectedIcon(null);
      setScreenListMode("list");
    }
  };

  const handleScreenClick = (i: number) => {
    onScreenChange(i);
    setSelectedIcon(null);
    setScreenListMode("detail");
  };

  // ── DETAIL MODE: instances of active screen ──────────────────────────────
  if (screenListMode === "detail" && activeScreen) {
    const instances: Array<{
      iconIdx: number;
      icon: any;
      isBackground?: boolean;
      path: string;
    }> = [];

    if (activeScreen.Background) {
      const bgAsset = projectData.Objects?.find(
        (o: any) => o.Name === activeScreen.Background,
      );
      if (bgAsset) {
        instances.push({
          iconIdx: -1,
          icon: { Name: bgAsset.Name, X: 0, Y: 0 },
          isBackground: true,
          path: bgAsset.Path,
        });
      }
    }

    activeScreen.Icons?.forEach((icon: any, iconIdx: number) => {
      const asset = projectData.Objects?.find((o: any) => o.Name === icon.Name);
      if (asset) {
        instances.push({ iconIdx, icon, path: asset.Path });
      }
    });

    return (
      <div className="flex flex-col h-full">
        {/* HEADER */}
        <div className="flex flex-col gap-2 px-3 py-3 border-b border-white/5 bg-white/[0.01] shrink-0">
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => {
                setScreenListMode("list");
                setSelectedIcon(null);
                setSelectedAssetPath(null);
              }}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <Layout className="w-3.5 h-3.5 text-primary opacity-80" />
            <span className="text-xs font-semibold text-white truncate">
              {activeScreen.Name}
            </span>
          </div>
          <div className="flex items-center justify-between pl-1">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
              {instances.length} instance{instances.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* INSTANCES LIST */}
        <ScrollArea className="flex-1 h-full">
          <div className="p-3 space-y-1 pb-20">
            {instances.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 text-center opacity-30 text-[10px] uppercase tracking-widest font-medium"
              >
                No instances on screen
              </motion.div>
            ) : (
              instances.map(({ iconIdx, icon, isBackground: isBgInstance, path }) => {
                const pathLower = path.toLowerCase();
                const isSprite = pathLower.includes("sprites");
                const isBG = pathLower.includes("backgrounds");
                const isSelected = !isBgInstance && selectedIconIndex === iconIdx;

                return (
                  <motion.div
                    key={`${icon.Name}_${iconIdx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      setSelectedAssetPath(path);
                      if (!isBgInstance) {
                        setSelectedIcon(iconIdx);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-white/5 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    {isBG ? (
                      <BgIcon className="w-4 h-4 opacity-60 shrink-0" />
                    ) : isSprite ? (
                      <Film className="w-4 h-4 opacity-60 text-orange-400 shrink-0" />
                    ) : (
                      <Box className="w-4 h-4 opacity-60 text-blue-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-semibold text-white truncate">
                      {icon.Name}
                    </span>
                    {isBgInstance ? (
                      <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase ml-auto shrink-0">
                        BG
                      </span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground ml-auto font-mono shrink-0">
                        {icon.X}, {icon.Y}
                      </span>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ── LIST MODE: all screens ───────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="flex flex-col gap-2 px-3 py-3 border-b border-white/5 bg-white/[0.01] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 ml-1">
            <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Screens
            </span>
          </div>
          <motion.button
            whileHover={{ scale: isEditMode ? 1.02 : 1 }}
            whileTap={{ scale: isEditMode ? 0.98 : 1 }}
            onClick={() => isEditMode && addScreen()}
            disabled={!isEditMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isEditMode
                ? "bg-primary/20 text-primary hover:bg-primary/30 ring-1 ring-primary/30"
                : "bg-white/5 text-muted-foreground cursor-not-allowed opacity-50"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Screen
          </motion.button>
        </div>
      </div>

      {/* CONTENT */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-3 space-y-2 pb-20">
          {projectData.Screens.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center opacity-30 text-[10px] uppercase tracking-widest font-medium"
            >
              No screens defined
            </motion.div>
          ) : (
            projectData.Screens.map((s: any, i: number) => (
              <motion.div
                key={s.Name || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.15 }}
                className="flex items-center gap-1 group"
              >
                <motion.button
                  onClick={() => handleScreenClick(i)}
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-xl cursor-pointer transition-all text-left ${
                    activeScreenIdx === i
                      ? "bg-primary/20 border border-primary/30 shadow-sm"
                      : "bg-white/5 border border-transparent hover:bg-white/10"
                  }`}
                >
                  <Layout className="w-5 h-5 shrink-0 opacity-60" />
                  <span className="truncate text-xs font-semibold">{s.Name}</span>
                  <span className="text-[9px] text-muted-foreground ml-auto font-mono shrink-0">
                    {s.Icons?.length ?? 0}
                  </span>
                </motion.button>

                {/* ACTIONS MENU (Only in Edit Mode) */}
                {isEditMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#121212] border-white/10 text-white min-w-[160px]"
                    >
                      <DropdownMenuItem
                        onClick={() => duplicateScreen(i)}
                        className="gap-2 cursor-pointer focus:bg-white/10"
                      >
                        <Copy className="w-4 h-4 opacity-70" /> Duplicate
                      </DropdownMenuItem>
                      <div className="h-px bg-white/5 my-1" />
                      <DropdownMenuItem
                        onClick={() => handleDelete(i, s.Name)}
                        className="gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
