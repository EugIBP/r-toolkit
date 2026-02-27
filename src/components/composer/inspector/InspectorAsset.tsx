import { useState } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileCode,
  HardDrive,
  Info,
  Trash2,
  Edit3,
  Image,
  RefreshCcw,
  Plus,
  Film,
  Lock,
} from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { AddInstanceModal } from "../modals/AddInstanceModal";

export function InspectorAsset() {
  const { projectData, projectPath, updateProjectObject, deleteProjectObject, convertAssetType } =
    useProjectStore();
  const { selectedAssetPath, setSelectedAssetPath, canvasMode, activeScreenIdx } = useCanvasStore();
  const { confirm } = useAppStore();

  const isEditMode = canvasMode === "edit";
  const [showAddInstanceModal, setShowAddInstanceModal] = useState(false);

  const asset = projectData?.Objects.find((o: any) => o.Path === selectedAssetPath);
  
  const isBackground = asset?.Path?.toLowerCase().includes("backgrounds");
  const isSprite = asset?.isSprite || asset?.Path?.toLowerCase().includes("sprites");

  // Build preview URL
  const lastIdx = Math.max(
    projectPath?.lastIndexOf("/") || 0,
    projectPath?.lastIndexOf("\\") || 0,
  );
  const previewSrc = asset && projectPath
    ? convertFileSrc(`${projectPath.substring(0, lastIdx)}/${asset.Path}`)
    : "";

  if (!asset)
    return (
      <div className="p-8 text-center text-muted-foreground italic text-xs">
        Select an asset from the explorer to see details
      </div>
    );

  const handleDelete = async () => {
    if (
      await confirm(
        "Delete Asset?",
        `This will remove "${asset.Name}" from description.json. Files on disk will remain.`,
      )
    ) {
      deleteProjectObject(asset.Name);
      setSelectedAssetPath(null);
    }
  };

  const handleConvert = async (targetType: "icon" | "sprite") => {
    await convertAssetType(asset.Name, targetType);
  };

  return (
    <ScrollArea className="h-full">
    <div className="flex flex-col w-full pb-10">
      {/* 1. PREVIEW */}
      <div className="w-full border-b border-white/5 bg-white/[0.01]">
        <div className="aspect-square w-full bg-[#121212] flex items-center justify-center relative overflow-hidden shadow-inner">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)",
              backgroundSize: "16px 16px",
            }}
          />
          {previewSrc && (
            <img
              src={previewSrc}
              className="max-w-full max-h-full object-contain relative z-10 p-8"
            />
          )}
          {!isEditMode && (
            <div className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-md backdrop-blur-sm border border-white/5">
              <Lock className="w-3 h-3 text-white/40" />
            </div>
          )}
        </div>
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center gap-2">
          {isBackground ? (
            <Image className="w-3 h-3 text-emerald-400 shrink-0" />
          ) : isSprite ? (
            <Film className="w-3 h-3 text-orange-400 shrink-0" />
          ) : (
            <FileCode className="w-3 h-3 text-blue-400 shrink-0" />
          )}
          <span className="text-[10px] font-mono text-muted-foreground truncate select-all">
            {asset.Name}
          </span>
          <span className="text-[9px] text-muted-foreground/50 ml-auto">
            {isBackground ? "Background" : isSprite ? "Sprite" : "Icon"}
          </span>
        </div>
      </div>

      {/* 2. DETAILS & ACTIONS */}
      <div className="p-5 space-y-6 w-full">
        {/* Name — editable for icons/sprites, read-only for backgrounds (edit via modal) */}
        {!isBackground && (
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">
              Registry Name
            </label>
            <div className="relative group">
              <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={asset.Name}
                disabled={!isEditMode}
                onChange={(e) =>
                  updateProjectObject(asset.Name, { Name: e.target.value })
                }
                className="w-full bg-[#181818] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs font-bold text-white focus:border-primary/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Path Info */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">
            Internal Path
          </label>
          <div className="flex items-start gap-2 bg-black/20 border border-white/5 rounded-lg p-3">
            <HardDrive className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-[10px] font-mono text-muted-foreground leading-relaxed break-all select-all">
              {asset.Path}
            </span>
          </div>
        </div>

        {/* Background hint */}
        {isBackground && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-3">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-300/70 leading-relaxed">
              Click a background in the <b>Objects</b> panel to preview it on canvas. Press <b>Esc</b> or click empty canvas to dismiss. In edit mode use <b>⋮</b> to set, edit or remove.
            </p>
          </div>
        )}

        {/* Asset Type Conversion */}
        {isEditMode && !isBackground && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">
              Asset Type
            </label>
            <div className="flex gap-2">
              {isSprite ? (
                <button
                  onClick={() => handleConvert("icon")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> To Icon
                </button>
              ) : (
                <button
                  onClick={() => handleConvert("sprite")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                  <Film className="w-3.5 h-3.5" /> To Sprite
                </button>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground/60 text-center">
              {isSprite ? "Move to icons/ folder" : "Move to sprites/ folder"}
            </p>
          </div>
         )}

        {/* Add Instance - только для icons/sprites в Edit режиме */}
        {isEditMode && !isBackground && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">
              Actions
            </label>
            <Button
              variant="default"
              className="w-full"
              onClick={() => setShowAddInstanceModal(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Add Instance
            </Button>
          </div>
        )}

        {/* Danger Zone — только для не-background ассетов в Edit Mode */}
        {isEditMode && !isBackground && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-red-500/50 ml-1">
              Danger Zone
            </label>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove from description.json
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-[10px] text-blue-300/70 leading-relaxed">
            Changing the name here will update all references in the project,
            but might require a manual save of the <b>description.json</b> file.
          </p>
        </div>
      </div>

      {/* Add Instance Modal */}
      <AddInstanceModal
        isOpen={showAddInstanceModal}
        onClose={() => setShowAddInstanceModal(false)}
        assetName={asset?.Name || ""}
        screenIdx={activeScreenIdx}
      />
    </div>
    </ScrollArea>
  );
}
