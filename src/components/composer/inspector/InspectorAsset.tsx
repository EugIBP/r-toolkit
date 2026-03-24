import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Box,
  Film,
  Image as BgIcon,
  Plus,
  Trash2,
  ArrowRightLeft,
  MonitorUp,
  FileImage,
  CheckCircle2,
} from "lucide-react";

export function InspectorAsset() {
  // Достаем scannedFiles и registerAsset из стора
  const {
    projectData,
    baseDir,
    scannedFiles,
    addInstance,
    updateScreen,
    deleteProjectObject,
    convertAssetType,
    registerAsset,
  } = useProjectStore();
  const {
    selectedAssetPath,
    setSelectedAssetPath,
    activeScreenIdx,
    canvasMode,
  } = useCanvasStore();
  const { confirm } = useAppStore();

  if (!projectData || !selectedAssetPath || !baseDir) return null;

  let asset: any = null;
  let isUnregistered = false;

  // 1. Сначала ищем среди зарегистрированных
  const matchingAssets = projectData.Objects.filter(
    (o: any) => o.Path === selectedAssetPath,
  );
  if (matchingAssets.length > 0) {
    asset = matchingAssets.reduce((prev: any, curr: any) =>
      curr.Name.length < prev.Name.length ? curr : prev,
    );
  } else {
    // 2. Если не нашли, ищем среди отсканированных (новых)
    const scanned = scannedFiles?.find((f) => f.path === selectedAssetPath);
    if (scanned) {
      isUnregistered = true;
      const name =
        scanned.path
          .split(/[\\/]/)
          .pop()
          ?.replace(/\.[^/.]+$/, "") || scanned.path;
      const type =
        scanned.asset_type === "bin"
          ? "Bin"
          : scanned.asset_type === "pal"
            ? "Pal"
            : "Ico";
      asset = {
        Name: name,
        Path: scanned.path,
        Type: type,
        isSprite: false,
      };
    }
  }

  // Если и там нет, значит ничего не показываем
  if (!asset) return null;

  const isEditMode = canvasMode === "edit";
  const isBG = asset.Type === "Bin";
  const isSprite = asset.isSprite;

  const activeScreen = projectData.Screens[activeScreenIdx];
  const isCurrentBg = activeScreen?.Background === asset.Name;

  const fullPath = `${baseDir}/${asset.Path}`.replace(/\\/g, "/");
  const imgSrc = convertFileSrc(fullPath);

  const getUniqueInstanceName = (baseName: string, screenIndex: number) => {
    const screen = projectData.Screens[screenIndex];
    if (!screen) return baseName;
    let uniqueName = baseName;
    let counter = 1;
    while (screen.Icons.some((icon: any) => icon.Name === uniqueName)) {
      uniqueName = `${baseName}_${counter}`;
      counter++;
    }
    return uniqueName;
  };

  const handleQuickAdd = () => {
    const uniqueName = getUniqueInstanceName(asset.Name, activeScreenIdx);
    addInstance(activeScreenIdx, asset.Name, {
      name: uniqueName,
      x: 0,
      y: 0,
      states: [{ Name: "OFF", Color: "PURE_WHITE" }],
    });
  };

  const handleSetBackground = () => {
    updateScreen(activeScreenIdx, {
      Background: isCurrentBg ? "" : asset.Name,
    });
  };

  const handleDelete = async () => {
    if (
      await confirm(
        "Delete Asset?",
        `Are you sure you want to remove "${asset.Name}" from this project?`,
      )
    ) {
      deleteProjectObject(asset.Name);
      setSelectedAssetPath(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2 duration-200">
      <div className="flex flex-col gap-2">
        <div className="relative aspect-square w-full rounded-xl border border-border bg-muted/20 overflow-hidden flex items-center justify-center shadow-inner group">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none -z-10"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            }}
          />
          <img
            src={imgSrc}
            alt={asset.Name}
            className="max-w-[90%] max-h-[90%] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement
                ?.querySelector(".fallback-icon")
                ?.classList.remove("hidden");
            }}
          />
          <FileImage className="fallback-icon hidden w-12 h-12 text-muted-foreground opacity-20" />

          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-md rounded-md border border-border shadow-sm">
            {isBG ? (
              <BgIcon className="w-3 h-3 text-emerald-500" />
            ) : isSprite ? (
              <Film className="w-3 h-3 text-orange-500" />
            ) : (
              <Box className="w-3 h-3 text-blue-500" />
            )}
            <span className="text-[9px] uppercase font-bold tracking-wider text-foreground">
              {isBG ? "Background" : isSprite ? "Sprite" : "Icon"}
            </span>
          </div>

          {isUnregistered && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-amber-500/20 backdrop-blur-md rounded-md border border-amber-500/50 shadow-sm">
              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-500">
                Unregistered
              </span>
            </div>
          )}
        </div>

        <div className="space-y-0.5 px-1">
          <h3
            className="text-sm font-bold text-foreground truncate"
            title={asset.Name}
          >
            {asset.Name}
          </h3>
          <p
            className="text-[10px] text-muted-foreground font-mono truncate"
            title={asset.Path}
          >
            {asset.Path}
          </p>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {isUnregistered ? (
        <div
          className={`flex flex-col gap-2 ${!isEditMode ? "opacity-50 pointer-events-none" : ""}`}
        >
          <label className="text-[10px] uppercase text-amber-500 font-medium tracking-wider mb-1">
            New Asset
          </label>
          <Button
            onClick={() => registerAsset(asset.Path)}
            className="w-full justify-start gap-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold"
          >
            <CheckCircle2 className="w-4 h-4" /> Register Asset
          </Button>
        </div>
      ) : (
        <div
          className={`flex flex-col gap-2 ${!isEditMode ? "opacity-50 pointer-events-none" : ""}`}
        >
          <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider mb-1">
            Quick Actions
          </label>
          {!isBG && (
            <Button
              onClick={handleQuickAdd}
              className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            >
              <Plus className="w-4 h-4" /> Add to Canvas
            </Button>
          )}
          {isBG && (
            <Button
              onClick={handleSetBackground}
              variant={isCurrentBg ? "outline" : "default"}
              className={`w-full justify-start gap-2 ${isCurrentBg ? "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
            >
              <MonitorUp className="w-4 h-4" />{" "}
              {isCurrentBg ? "Remove Background" : "Set as Background"}
            </Button>
          )}
          {!isBG && (
            <Button
              onClick={() =>
                convertAssetType(asset.Name, isSprite ? "icon" : "sprite")
              }
              variant="outline"
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <ArrowRightLeft className="w-4 h-4" /> Convert to{" "}
              {isSprite ? "Static Icon" : "Sprite"}
            </Button>
          )}
          <Separator className="bg-border/50 my-2" />
          <Button
            onClick={handleDelete}
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" /> Remove from Project
          </Button>
        </div>
      )}
    </div>
  );
}
