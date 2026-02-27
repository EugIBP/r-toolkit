import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Image as ImageIcon,
  FolderOpen,
  ArrowRight,
  Trash2,
} from "lucide-react";

export function WorkspaceMetaModal() {
  const {
    editingWorkspaceId,
    setEditingWorkspaceId,
    recentProjects,
    updateProjectMeta,
    setCurrentView,
    refreshRecent,
  } = useAppStore();

  const project = useMemo(
    () => recentProjects.find((p) => p.id === editingWorkspaceId),
    [recentProjects, editingWorkspaceId],
  );

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.displayName);
      setDesc(project.description || "");
      setImgError(false); // Reset error when project changes

      const lastIndex = Math.max(
        project.path.lastIndexOf("/"),
        project.path.lastIndexOf("\\"),
      );
      const baseDir = project.path.substring(0, lastIndex);

      // Нормализуем путь для Tauri
      const fullPath = `${baseDir}/.rtoolkit/thumb.png`.replace(/\\/g, "/");
      setThumbUrl(convertFileSrc(fullPath) + `?t=${refreshKey}`);
    } else {
      setThumbUrl(null);
    }
  }, [project, refreshKey]);

  if (!project) return null;

  const handleCancel = () => setEditingWorkspaceId(null);

  const handleSaveOnly = () => {
    updateProjectMeta(project.id, name, desc);
    setEditingWorkspaceId(null);
  };

  const handleSaveAndOpen = () => {
    updateProjectMeta(project.id, name, desc);
    setEditingWorkspaceId(null);
    setCurrentView("composer");
  };

  const handleChangeThumb = async () => {
    try {
      const selected = await open({
        multiple: false,
        title: "Select Project Thumbnail",
        filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
      });

      if (selected && typeof selected === "string") {
        const lastIndex = Math.max(
          project.path.lastIndexOf("/"),
          project.path.lastIndexOf("\\"),
        );
        const baseDir = project.path.substring(0, lastIndex);
        const destination = `${baseDir}/.rtoolkit/thumb.png`;

        // Copy file and wait for it to complete
        await invoke("copy_asset_file", { source: selected, destination });

        // Wait a bit to ensure file is written
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Update refresh key to trigger re-render with new image
        const newKey = Date.now();
        setRefreshKey(newKey);

        // Also refresh recent projects to update the thumbnail on dashboard
        await refreshRecent();

        // Force another re-render after a short delay to ensure image loads
        setTimeout(() => {
          setRefreshKey(Date.now());
        }, 100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveThumb = async () => {
    if (!project) return;

    try {
      const lastIndex = Math.max(
        project.path.lastIndexOf("/"),
        project.path.lastIndexOf("\\"),
      );
      const baseDir = project.path.substring(0, lastIndex);
      const fullPath = `${baseDir}/.rtoolkit/thumb.png`;

      await invoke("delete_project_file", { path: fullPath });

      // Refresh the thumbnail display
      await refreshRecent();
      setRefreshKey(Date.now());
      setImgError(true); // Show placeholder
    } catch (err) {
      // File might not exist, that's ok
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col w-[33vw] min-w-[400px] max-w-[600px]">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">
            Workspace Configuration
          </h2>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Cover Image
                </span>

                {/* Кнопка удаления - показываем только если есть изображение */}
                {thumbUrl && !imgError && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveThumb();
                    }}
                    className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Remove cover image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div
                onClick={handleChangeThumb}
                className="relative aspect-video w-full rounded-xl bg-white/5 border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group"
              >
                <ImageIcon className="absolute w-8 h-8 text-white/20 group-hover:scale-110 transition-transform z-0" />

                {/* Рендерим изображение только если URL валиден и нет ошибки */}
                {thumbUrl && !imgError && (
                  <img
                    src={thumbUrl}
                    alt=""
                    onError={() => setImgError(true)}
                    onLoad={(e) => (e.currentTarget.style.opacity = "0.6")}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 group-hover:opacity-30 opacity-0"
                  />
                )}

                <span className="text-xs font-medium text-white/60 z-20 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to browse image
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                  Alias (Display Name)
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#181818] border border-white/10 rounded-lg p-3 text-sm font-semibold text-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                  Project Path
                </span>
                <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-lg p-3 min-w-0">
                  <FolderOpen className="w-4 h-4 text-primary/70 shrink-0" />
                  <span className="text-xs font-mono text-muted-foreground select-all">
                    {project.path.length > 72 ? `${project.path.slice(0, 72)}...` : project.path}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                  Description / Notes
                </span>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="Write some notes..."
                  className="bg-[#181818] border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveOnly}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-white transition-all"
            >
              Save Settings
            </button>
            <button
              onClick={handleSaveAndOpen}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,165,0,0.2)]"
            >
              Open Project <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
