import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Edit3, HardDrive, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
}

export function EditBackgroundModal({
  isOpen,
  onClose,
  assetName,
}: EditBackgroundModalProps) {
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
  const baseDir = projectPath
    ? projectPath.substring(0, lastIdx).replace(/\\/g, "/")
    : "";
  const assetPath = asset.Path.replace(/\\/g, "/");
  const previewSrc = projectPath
    ? convertFileSrc(`${baseDir}/${assetPath}`)
    : "";

  const handleSave = () => {
    if (!name.trim()) return;
    updateProjectObject(assetName, {
      Name: name.trim(),
      Path: path.trim(),
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl bg-background border-border text-foreground p-0 overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="p-5 border-b border-border bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            Edit Background
          </DialogTitle>
          {/* Добавляем скрытое описание для скринридеров, чтобы shadcn не ругался */}
          <DialogDescription className="sr-only">
            Edit the properties of the background asset.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            {/* Preview */}
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted/30 border border-border relative">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)",
                  backgroundSize: "16px 16px",
                }}
              />
              {previewSrc && (
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}
            </div>

            {/* Registry Name */}
            <div className="flex flex-col gap-2">
              {/* Заменили SectionLabel на обычный лейбл со стилями */}
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Registry Name
              </label>
              <div className="relative">
                <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditMode}
                  className="w-full pl-9 bg-muted/50 border-border"
                />
              </div>
            </div>

            {/* Internal Path */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Internal Path
              </label>
              <div className="relative">
                <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <Input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  disabled={!isEditMode}
                  className="w-full pl-9 text-xs font-mono bg-muted/50 border-border"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Кастомный Footer, чтобы кнопки были разнесены по краям, как в оригинале */}
        <div className="p-5 border-t border-border bg-muted/30 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isEditMode || !name.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
