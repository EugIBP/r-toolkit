import {
  Film,
  Image as ImageIcon,
  Lock,
  Copy,
  Trash2,
  FileImage,
} from "lucide-react";
import type { AssetObject } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { IconAssetInfo } from "./icon/IconAssetInfo";
import { IconTransform } from "./icon/IconTransform";
import { IconSpriteFrames } from "./icon/IconSpriteFrames";
import { IconColorStates } from "./icon/IconColorStates";

export function InspectorIcon() {
  const {
    projectData,
    projectPath,
    renameInstance,
    duplicateIcon,
    deleteIcon,
  } = useProjectStore();
  const { selectedIconIndex, canvasMode, activeScreenIdx, setSelectedIcon } =
    useCanvasStore();
  const { confirm } = useAppStore();

  if (!projectData || selectedIconIndex === null) return null;
  const icon = projectData.Screens[activeScreenIdx]?.Icons[selectedIconIndex];
  if (!icon) return null;

  const asset = projectData.Objects.find(
    (o: AssetObject) => o.Name === icon.Name,
  );
  const isSprite =
    asset?.isSprite || asset?.Path?.toLowerCase().includes("sprites");
  const isViewMode = canvasMode === "view";

  const lastIdx = Math.max(
    projectPath?.lastIndexOf("/") || 0,
    projectPath?.lastIndexOf("\\") || 0,
  );
  const baseDir = projectPath
    ? projectPath.substring(0, lastIdx).replace(/\\/g, "/")
    : "";
  const assetPath = asset ? asset.Path.replace(/\\/g, "/") : "";
  const previewSrc = asset ? convertFileSrc(`${baseDir}/${assetPath}`) : "";

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-in fade-in slide-in-from-right-2 duration-200">
      {/* ПРЕВЬЮ И ИМЯ */}
      <div className="shrink-0 flex flex-col gap-3">
        <div className="relative aspect-video w-full rounded-xl border border-border bg-muted/20 overflow-hidden flex items-center justify-center shadow-inner group">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none -z-10"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            }}
          />
          {asset && (
            <img
              src={previewSrc}
              className="max-w-[80%] max-h-[80%] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement
                  ?.querySelector(".fallback-icon")
                  ?.classList.remove("hidden");
              }}
            />
          )}
          <FileImage className="fallback-icon hidden w-12 h-12 text-muted-foreground opacity-20" />
          {isViewMode && (
            <div className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-md backdrop-blur-sm border border-border shadow-sm">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-1">
          {isSprite ? (
            <Film className="w-4 h-4 text-orange-500 shrink-0" />
          ) : (
            <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          {isViewMode ? (
            <span className="text-sm font-bold font-mono text-foreground truncate select-all">
              {icon.Name}
            </span>
          ) : (
            <Input
              value={icon.Name}
              onChange={(e) =>
                renameInstance(
                  activeScreenIdx,
                  selectedIconIndex,
                  e.target.value,
                )
              }
              className="h-8 text-sm font-bold font-mono bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          )}
        </div>
      </div>

      {/* СКРОЛЛ НАСТРОЕК */}
      <ScrollArea className="flex-1 min-h-0 mt-4">
        <div className="space-y-6 pb-6 pr-4">
          <div>
            <IconTransform
              screenIdx={activeScreenIdx}
              iconIdx={selectedIconIndex}
              isViewMode={isViewMode}
            />
          </div>
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

      {/* КНОПКИ ДЕЙСТВИЙ */}
      {!isViewMode && (
        <div className="shrink-0 pt-4 border-t border-border mt-2 space-y-2">
          <Button
            variant="secondary"
            onClick={() => {
              if (duplicateIcon(activeScreenIdx, selectedIconIndex)) {
                const screen = projectData.Screens[activeScreenIdx];
                setSelectedIcon(
                  screen.Icons?.length ? screen.Icons.length - 1 : 0,
                );
              }
            }}
            className="w-full gap-2 font-bold uppercase tracking-wider text-[10px]"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate Instance
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              if (
                await confirm(
                  "Remove Icon",
                  `Remove "${icon.Name}" from screen?`,
                )
              ) {
                deleteIcon(activeScreenIdx, selectedIconIndex);
                setSelectedIcon(null);
              }
            }}
            className="w-full gap-2 font-bold uppercase tracking-wider text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove from Screen
          </Button>
        </div>
      )}
    </div>
  );
}
