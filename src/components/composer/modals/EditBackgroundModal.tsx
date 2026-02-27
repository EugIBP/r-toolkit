import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertFileSrc } from "@tauri-apps/api/core";
import { X, Edit3, HardDrive, Image } from "lucide-react";

interface EditBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
}

export function EditBackgroundModal({ isOpen, onClose, assetName }: EditBackgroundModalProps) {
  const { projectData, projectPath, updateProjectObject } = useProjectStore();
  const { canvasMode } = useCanvasStore();

  const isEditMode = canvasMode === "edit";

  const asset = projectData?.Objects.find((o: any) => o.Name === assetName);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  useEffect(() => {
    if (asset && isOpen) {
      setName(asset.Name);
      setPath(asset.Path);
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const lastIdx = Math.max(
    projectPath?.lastIndexOf("/") || 0,
    projectPath?.lastIndexOf("\\") || 0,
  );
  const previewSrc =
    projectPath
      ? convertFileSrc(`${projectPath.substring(0, lastIdx)}/${asset.Path}`.replace(/\\/g, "/"))
      : "";

  const handleSave = () => {
    if (!name.trim()) return;
    updateProjectObject(assetName, { Name: name.trim(), Path: path.trim() });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col w-[33vw] min-w-[400px] max-w-[560px]"
        onKeyDown={handleKeyDown}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Edit Background</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-5">
            {/* Preview */}
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/5 relative">
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
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>

            {/* Registry Name */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Registry Name
              </span>
              <div className="relative">
                <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-sm font-semibold text-white focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Internal Path */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Internal Path
              </span>
              <div className="relative">
                <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs font-mono text-muted-foreground focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* FOOTER */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isEditMode || !name.trim()}
            className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
