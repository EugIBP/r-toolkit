import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RESOLUTIONS = [
  { label: "1024 x 600", value: "1024x600", width: 1024, height: 600 },
  { label: "1024 x 768", value: "768", width: 1024, height: 768 },
  { label: "1280 x 800 (HD)", value: "1280x800", width: 1280, height: 800 },
  { label: "1920 x 720", value: "1920x720", width: 1920, height: 720 },
];

export function CreateProjectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [targetDir, setTargetDir] = useState<string | null>(null);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [customW, setCustomW] = useState("1920");
  const [customH, setCustomH] = useState("720");

  const { setProject } = useProjectStore();
  const { loadWorkspace, resetCanvas } = useCanvasStore();
  const { addRecent, setCurrentView } = useAppStore();

  const handleSelectDir = async () => {
    try {
      const selected = await openDialog({ directory: true, multiple: false });
      if (selected && typeof selected === "string") {
        setTargetDir(selected);
      }
    } catch (e) {
      console.error("Failed to open file dialog", e);
    }
  };

  const handleCreate = async () => {
    if (!targetDir) return;

    try {
      let w =
        resolution.value === "custom" ? parseInt(customW) : resolution.width;
      let h =
        resolution.value === "custom" ? parseInt(customH) : resolution.height;
      if (isNaN(w) || w <= 0) w = 1920;
      if (isNaN(h) || h <= 0) h = 720;

      const pathParts = targetDir.split(/[\\/]/);
      const folderName = pathParts[pathParts.length - 1] || "New Workspace";

      // 1. Вызываем Rust-функцию с правильными аргументами (basePath и folders)
      // Rust вернет ПУТЬ к созданному файлу description.json
      const createdDescPath = await invoke<string>("create_project", {
        basePath: targetDir,
        folders: ["assets", "backgrounds", "icons"],
        width: w,
        height: h,
      });

      // 2. Считываем свежесозданный файл, чтобы получить его содержимое как объект
      const content = await invoke<string>("load_project", {
        filePath: createdDescPath,
      });
      const data = JSON.parse(content);

      const normalizedDescPath = createdDescPath.replace(/\\/g, "/");

      // 3. Загружаем всё в Store
      setProject(data, normalizedDescPath);
      await resetCanvas();
      await loadWorkspace(targetDir);
      await addRecent(normalizedDescPath, folderName);

      // 4. Переключаем вид на редактор!
      sessionStorage.setItem("currentView", "composer");
      setCurrentView("composer");

      toast.success("Workspace created successfully");
      onClose();
    } catch (e) {
      console.error("Failed to create project:", e);
      toast.error(`Error: ${e}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription className="sr-only">
            Select a folder and display resolution to create a new project
            workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 block">
              Workspace Location
            </h3>
            <div className="flex gap-2">
              <Input
                readOnly
                value={targetDir || "No directory selected"}
                className={`flex-1 bg-muted/50 border-border text-xs ${!targetDir && "text-muted-foreground italic"}`}
              />
              <Button
                variant="secondary"
                onClick={handleSelectDir}
                className="shrink-0"
              >
                Browse...
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              A new description.json will be created in this directory.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 block">
              Display Resolution
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res.value}
                  onClick={() => setResolution(res)}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all text-left ${
                    resolution.value === res.value
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {res.label}
                </button>
              ))}
              <button
                onClick={() =>
                  setResolution({
                    label: "Custom",
                    value: "custom",
                    width: 0,
                    height: 0,
                  })
                }
                className={`p-3 rounded-xl border text-xs font-medium transition-all text-left ${
                  resolution.value === "custom"
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Custom
              </button>
            </div>

            {resolution.value === "custom" && (
              <div className="flex items-center gap-2 pt-2 animate-in fade-in slide-in-from-top-2">
                <Input
                  type="number"
                  value={customW}
                  onChange={(e) => setCustomW(e.target.value)}
                  className="bg-muted/50 border-border text-xs"
                />
                <span className="text-muted-foreground text-xs">×</span>
                <Input
                  type="number"
                  value={customH}
                  onChange={(e) => setCustomH(e.target.value)}
                  className="bg-muted/50 border-border text-xs"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!targetDir}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
