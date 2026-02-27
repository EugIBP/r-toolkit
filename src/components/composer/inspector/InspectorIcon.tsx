import { Film, Image as ImageIcon, Lock, Copy, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { IconAssetInfo } from "./icon/IconAssetInfo";
import { IconTransform } from "./icon/IconTransform";
import { IconSpriteFrames } from "./icon/IconSpriteFrames";
import { IconColorStates } from "./icon/IconColorStates";

export function InspectorIcon() {
  const { projectData, projectPath, renameInstance, duplicateIcon, deleteIcon } = useProjectStore();
  const { selectedIconIndex, canvasMode, activeScreenIdx, setSelectedIcon } = useCanvasStore();
  const { confirm } = useAppStore();

  if (!projectData || selectedIconIndex === null) return null;
  const icon = projectData.Screens[activeScreenIdx]?.Icons[selectedIconIndex];
  if (!icon) return null;

  const asset = projectData.Objects.find((o: any) => o.Name === icon.Name);
  const isSprite = asset?.isSprite || asset?.Path?.toLowerCase().includes("sprites");
  const isViewMode = canvasMode === "view";

  const lastIdx = Math.max(
    projectPath?.lastIndexOf("/") || 0,
    projectPath?.lastIndexOf("\\") || 0,
  );
  const previewSrc = asset
    ? convertFileSrc(`${projectPath?.substring(0, lastIdx)}/${asset.Path}`)
    : "";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Preview header */}
      <div className="shrink-0 border-b border-white/5 bg-white/[0.01]">
        <div className="h-40 bg-[#121212] flex items-center justify-center relative overflow-hidden shadow-inner">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)",
              backgroundSize: "16px 16px",
            }}
          />
          {asset && (
            <img src={previewSrc} className="max-w-full max-h-full object-contain relative z-10 p-4" />
          )}
          {isViewMode && (
            <div className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-md backdrop-blur-sm border border-white/5">
              <Lock className="w-3 h-3 text-white/40" />
            </div>
          )}
        </div>
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center gap-2">
          {isSprite ? (
            <Film className="w-3 h-3 text-orange-400 shrink-0" />
          ) : (
            <ImageIcon className="w-3 h-3 text-blue-400 shrink-0" />
          )}
          {isViewMode ? (
            <span className="text-[10px] font-mono text-muted-foreground truncate select-all">
              {icon.Name}
            </span>
          ) : (
            <input
              value={icon.Name}
              onChange={(e) => renameInstance(activeScreenIdx, selectedIconIndex, e.target.value)}
              className="flex-1 bg-transparent text-[10px] font-mono text-muted-foreground outline-none focus:text-white transition-colors"
            />
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-5 space-y-6">
          <IconTransform screenIdx={activeScreenIdx} iconIdx={selectedIconIndex} isViewMode={isViewMode} />
          <IconAssetInfo assetName={icon.Name} isViewMode={isViewMode} />
          {isSprite && (
            <IconSpriteFrames
              screenIdx={activeScreenIdx}
              assetName={icon.Name}
              isViewMode={isViewMode}
            />
          )}
          <IconColorStates
            screenIdx={activeScreenIdx}
            iconIdx={selectedIconIndex}
            assetName={icon.Name}
            isViewMode={isViewMode}
          />
        </div>
      </ScrollArea>

      {/* Action buttons - fixed at bottom */}
      {!isViewMode && (
        <div className="shrink-0 border-t border-white/5 bg-[#0a0a0a]">
          <div className="p-5 py-6 space-y-3">
            <button
              onClick={() => {
                const success = duplicateIcon(activeScreenIdx, selectedIconIndex);
                if (success) {
                  const screen = projectData.Screens[activeScreenIdx];
                  setSelectedIcon(screen.Icons?.length ? screen.Icons.length - 1 : 0);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              onClick={async () => {
                if (await confirm("Remove Icon", `Remove "${icon.Name}" from screen?`)) {
                  deleteIcon(activeScreenIdx, selectedIconIndex);
                  setSelectedIcon(null);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-400 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
