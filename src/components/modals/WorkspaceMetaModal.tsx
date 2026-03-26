import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
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
import { UploadCloud, Trash2 } from "lucide-react";

export function WorkspaceMetaModal() {
  const {
    editingWorkspaceId,
    setEditingWorkspaceId,
    recentProjects,
    updateProjectMeta,
    isNewImport,
    setCurrentView,
  } = useAppStore();

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [newThumbPath, setNewThumbPath] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  const project = editingWorkspaceId
    ? recentProjects.find((p) => p.id === editingWorkspaceId)
    : null;

  useEffect(() => {
    if (project) {
      setDisplayName(project.displayName || "");
      setDescription(project.description || "");
      setNewThumbPath(null);
      setTimestamp(Date.now());
    }
  }, [project]);

  const getBaseDir = () => {
    if (!project?.path) return "";
    const lastIdx = Math.max(
      project.path.lastIndexOf("/"),
      project.path.lastIndexOf("\\"),
    );
    return project.path.substring(0, lastIdx);
  };

  const handleSelectImage = async () => {
    try {
      const selected = await openDialog({
        multiple: false,
        filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
      });
      if (selected && typeof selected === "string") {
        setNewThumbPath(selected);
      }
    } catch (e) {
      console.error("Failed to open file dialog", e);
    }
  };

  const handleRemoveThumb = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const baseDir = getBaseDir();
    const destPath = `${baseDir}/.rtoolkit/thumb.png`.replace(/\\/g, "/");
    try {
      await invoke("delete_project_file", { path: destPath });
      setNewThumbPath(null);
      setTimestamp(Date.now());
      toast.success("Thumbnail removed");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to remove thumbnail");
    }
  };

  const handleSave = async () => {
    if (!project) return;

    if (newThumbPath) {
      const baseDir = getBaseDir();
      const destPath = `${baseDir}/.rtoolkit/thumb.png`.replace(/\\/g, "/");
      try {
        await invoke("copy_asset_file", {
          source: newThumbPath,
          destination: destPath,
        });
      } catch (err) {
        console.error("Copy asset error:", err);
        toast.error("Failed to save image file");
        return;
      }
    }

    try {
      await updateProjectMeta(
        project.id,
        displayName.trim(),
        description.trim(),
      );
    } catch (err) {
      console.error("Update store error:", err);
      toast.error("Failed to save project metadata");
      return;
    }

    setEditingWorkspaceId(null);

    if (isNewImport) {
      sessionStorage.setItem("currentView", "composer");
      setCurrentView("composer");
      toast.success("Workspace imported successfully");
    } else {
      toast.success("Workspace updated");
    }
  };

  const handleOpenFolder = async () => {
    const folderPath = getBaseDir();
    if (!folderPath) return;
    try {
      await invoke("open_folder", { path: folderPath });
    } catch (e) {
      console.error("Opener error:", e);
      toast.error("Failed to open folder");
    }
  };

  if (!project) return null;

  const baseDir = getBaseDir();
  const currentThumb = `${baseDir}/.rtoolkit/thumb.png`.replace(/\\/g, "/");
  const displaySrc = newThumbPath
    ? convertFileSrc(newThumbPath)
    : `${convertFileSrc(currentThumb)}?t=${timestamp}`;

  return (
    <Dialog
      open={!!editingWorkspaceId}
      onOpenChange={() => setEditingWorkspaceId(null)}
    >
      <DialogContent className="max-w-md bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle>
            {isNewImport ? "Import Workspace" : "Workspace Settings"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isNewImport
              ? "Review metadata for the imported workspace."
              : "Edit metadata and thumbnail for your workspace."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                Project Thumbnail
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveThumb}
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>

            <div
              onClick={handleSelectImage}
              className="relative group cursor-pointer aspect-video w-full rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden"
            >
              <img
                src={displaySrc}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "block";
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity hidden"
              />

              <div className="flex flex-col items-center gap-2 relative z-10 p-4 text-center">
                <div className="p-3 bg-background/80 backdrop-blur-sm rounded-full shadow-sm border border-border group-hover:scale-110 group-hover:border-primary/30 transition-all">
                  <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-col drop-shadow-md">
                  <span className="text-xs font-semibold text-foreground">
                    Click to upload cover
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    PNG, JPG recommended 16:9
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
              Metadata
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                Display Name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Hero Character Project"
                className="bg-muted/50 border-border text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this workspace..."
                className="flex min-h-[60px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
              Location
            </h3>
            <div className="flex gap-2">
              <Input
                readOnly
                value={project.path}
                className="bg-muted/50 border-border text-xs font-mono text-muted-foreground"
              />
              <Button
                variant="secondary"
                onClick={handleOpenFolder}
                className="shrink-0"
              >
                Reveal
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setEditingWorkspaceId(null)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isNewImport ? "Open Workspace" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
