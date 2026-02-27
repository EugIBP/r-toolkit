import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  X,
  FolderOpen,
  Image as ImageIcon,
  ArrowRight,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESOLUTIONS = [
  { label: "1024 x 600", value: "1024x600", width: 1024, height: 600 },
  { label: "1024 x 768", value: "1024x768", width: 1024, height: 768 },
  { label: "1280 x 800", value: "1280x800", width: 1280, height: 800 },
  { label: "1920 x 720", value: "1920x720", width: 1920, height: 720 },
  { label: "640 x 480", value: "640x480", width: 640, height: 480 },
  { label: "800 x 600", value: "800x600", width: 800, height: 600 },
];

const DEFAULT_FOLDERS = [
  { name: "assets", enabled: true },
  { name: "backgrounds", enabled: true },
  { name: "icons", enabled: true },
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { setProject } = useProjectStore();
  const { resetCanvas, loadWorkspace } = useCanvasStore();
  const { addRecent, setCurrentView } = useAppStore();

  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [resolution, setResolution] = useState<string>("1024x600");
  const [customRes, setCustomRes] = useState<{ width: string; height: string }>({
    width: "",
    height: "",
  });
  const [useCustomRes, setUseCustomRes] = useState(false);
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [newCustomFolder, setNewCustomFolder] = useState("");

  const [name, setName] = useState("Resources");
  const [desc, setDesc] = useState("");

  const [thumbPath, setThumbPath] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setSelectedFolder("");
    setResolution("1024x600");
    setCustomRes({ width: "", height: "" });
    setUseCustomRes(false);
    setFolders(DEFAULT_FOLDERS);
    setCustomFolders([]);
    setNewCustomFolder("");
    setName("Resources");
    setDesc("");
    setThumbPath(null);
    setThumbUrl(null);
    setRefreshKey(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Project Location",
      });

      if (selected && typeof selected === "string") {
        setSelectedFolder(selected);
      }
    } catch (err) {
      console.error("Failed to select folder:", err);
    }
  };

  const handleSelectThumb = async () => {
    try {
      const selected = await open({
        multiple: false,
        title: "Select Project Thumbnail",
        filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
      });

      if (selected && typeof selected === "string") {
        setThumbPath(selected);
        setThumbUrl(convertFileSrc(selected) + `?t=${refreshKey}`);
      }
    } catch (err) {
      console.error("Failed to select thumb:", err);
    }
  };

  const handleRemoveThumb = async () => {
    setThumbPath(null);
    setThumbUrl(null);
    setRefreshKey((k) => k + 1);
  };

  const toggleFolder = (folderName: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.name === folderName ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const addCustomFolder = () => {
    if (newCustomFolder.trim() && !customFolders.includes(newCustomFolder.trim())) {
      setCustomFolders((prev) => [...prev, newCustomFolder.trim()]);
      setNewCustomFolder("");
    }
  };

  const removeCustomFolder = (folderName: string) => {
    setCustomFolders((prev) => prev.filter((f) => f !== folderName));
  };

  const getResolution = () => {
    if (useCustomRes) {
      const w = parseInt(customRes.width) || 800;
      const h = parseInt(customRes.height) || 600;
      return { width: w, height: h };
    }
    const found = RESOLUTIONS.find((r) => r.value === resolution);
    return found ? { width: found.width, height: found.height } : { width: 1024, height: 600 };
  };

  const handleSaveSettings = async () => {
    if (!selectedFolder) {
      toast.error("Please select a folder");
      return;
    }

    setIsCreating(true);

    try {
      const enabledFolders = folders
        .filter((f) => f.enabled)
        .map((f) => f.name);
      const allFolders = [...enabledFolders, ...customFolders];

      const { width, height } = getResolution();

      await invoke<string>("create_project", {
        basePath: selectedFolder,
        folders: allFolders,
        width,
        height,
      });

      const projectDir = selectedFolder;
      const rtoolkitPath = `${projectDir}/.rtoolkit`;

      if (thumbPath) {
        await invoke("copy_asset_file", {
          source: thumbPath,
          destination: `${rtoolkitPath}/thumb.png`,
        });
      }

      await invoke("save_text_file", {
        path: `${rtoolkitPath}/settings.json`,
        content: JSON.stringify({ displayName: name, description: desc }, null, 2),
      });

      const projectPath = `${projectDir}/description.json`;
      await addRecent(projectPath, name);

      handleClose();
    } catch (err) {
      console.error("Failed to create project:", err);
      toast.error(`Failed to create project: ${err}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = async () => {
    if (!selectedFolder) {
      toast.error("Please select a folder");
      return;
    }

    setIsCreating(true);

    try {
      const enabledFolders = folders
        .filter((f) => f.enabled)
        .map((f) => f.name);
      const allFolders = [...enabledFolders, ...customFolders];

      const { width, height } = getResolution();

      const projectPath = await invoke<string>("create_project", {
        basePath: selectedFolder,
        folders: allFolders,
        width,
        height,
      });

      const projectDir = selectedFolder;
      const rtoolkitPath = `${projectDir}/.rtoolkit`;

      if (thumbPath) {
        await invoke("copy_asset_file", {
          source: thumbPath,
          destination: `${rtoolkitPath}/thumb.png`,
        });
      }

      await invoke("save_text_file", {
        path: `${rtoolkitPath}/settings.json`,
        content: JSON.stringify({ displayName: name, description: desc }, null, 2),
      });

      const content = await invoke<string>("load_project", { filePath: projectPath });

      const data = JSON.parse(content);
      setProject(data, projectPath);
      await resetCanvas();
      await loadWorkspace(projectDir);
      await addRecent(projectPath, name);

      handleClose();
      setCurrentView("composer");
    } catch (err) {
      console.error("Failed to create and open project:", err);
      toast.error(`Failed to create project: ${err}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col w-[33vw] min-w-[400px] max-w-[600px]">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Create Workspace</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            {/* Cover Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Cover Image
                </span>
                {thumbUrl && (
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
                onClick={handleSelectThumb}
                className="relative aspect-video w-full rounded-xl bg-white/5 border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group"
              >
                <ImageIcon className="absolute w-8 h-8 text-white/20 group-hover:scale-110 transition-transform z-0" />

                {thumbUrl && (
                  <img
                    src={thumbUrl}
                    alt=""
                    onLoad={(e) => (e.currentTarget.style.opacity = "0.6")}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 group-hover:opacity-30 opacity-0"
                  />
                )}

                <span className="text-xs font-medium text-white/60 z-20 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {thumbUrl ? "Change image" : "Click to browse image"}
                </span>
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Resolution
              </span>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    disabled={useCustomRes}
                    className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                    }}
                  >
                    {RESOLUTIONS.map((res) => (
                      <option key={res.value} value={res.value} className="bg-[#181818]">
                        {res.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomRes}
                    onChange={(e) => setUseCustomRes(e.target.checked)}
                    className="accent-primary"
                  />
                  Custom
                </label>
              </div>
              {useCustomRes && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Width"
                    value={customRes.width}
                    onChange={(e) => setCustomRes((prev) => ({ ...prev, width: e.target.value }))}
                    className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-24 focus:ring-1 focus:ring-primary outline-none"
                  />
                  <span className="text-muted-foreground">x</span>
                  <input
                    type="number"
                    placeholder="Height"
                    value={customRes.height}
                    onChange={(e) => setCustomRes((prev) => ({ ...prev, height: e.target.value }))}
                    className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-24 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              )}
            </div>

            {/* Folders */}
            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Folders
              </span>
              <div className="flex flex-wrap gap-2">
                {folders.map((folder) => (
                  <button
                    key={folder.name}
                    onClick={() => toggleFolder(folder.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      folder.enabled
                        ? "bg-primary/10 border-primary/30 text-white"
                        : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}
                  >
                    {folder.enabled && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {folder.name}/
                  </button>
                ))}
              </div>

              {customFolders.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {customFolders.map((folder) => (
                    <button
                      key={folder}
                      onClick={() => removeCustomFolder(folder)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-colors"
                    >
                      {folder}/
                      <Trash2 className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add custom folder..."
                  value={newCustomFolder}
                  onChange={(e) => setNewCustomFolder(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomFolder()}
                  className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white flex-1 focus:ring-1 focus:ring-primary outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomFolder}
                  disabled={!newCustomFolder.trim()}
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Alias */}
            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Alias (Display Name)
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-lg p-3 text-sm font-semibold text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            {/* Project Path */}
            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Project Location
              </span>
              <div
                onClick={handleSelectFolder}
                className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-lg p-3 cursor-pointer hover:border-white/10 transition-colors min-w-0"
              >
                <FolderOpen className="w-4 h-4 text-primary/70 shrink-0" />
                <span className="text-xs font-mono text-muted-foreground select-all">
                  {selectedFolder
                    ? selectedFolder.length > 72 ? `${selectedFolder.slice(0, 72)}...` : selectedFolder
                    : "Click to select location"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Description / Notes
              </span>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                placeholder="Write some notes..."
                className="w-full bg-[#181818] border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none resize-none"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSettings}
              disabled={!selectedFolder || isCreating}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={handleOpenProject}
              disabled={!selectedFolder || isCreating}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,165,0,0.2)]"
            >
              {isCreating ? "Creating..." : "Open Project"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
