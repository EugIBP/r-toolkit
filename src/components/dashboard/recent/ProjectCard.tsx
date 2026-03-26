import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore, type RecentProject } from "@/store/useAppStore";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Folder, MoreVertical, Image as ImageIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectActions } from "./ProjectActions";
import { formatRelativeTime } from "@/lib/utils";

export function ProjectCard({ project }: { project: RecentProject }) {
  const { setProject } = useProjectStore();
  const { loadWorkspace, resetCanvas } = useCanvasStore();
  const {
    setCurrentView,
    addRecent,
    loadRecent,
    toggleProjectSelection,
    selectedProjectIds,
  } = useAppStore();
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedProjectIds.has(project.id);

  // Формируем путь к превью
  const thumbSrc = useMemo(() => {
    const lastIndex = Math.max(
      project.path.lastIndexOf("/"),
      project.path.lastIndexOf("\\"),
    );
    const baseDir = project.path.substring(0, lastIndex);
    const fullPath = `${baseDir}/.rtoolkit/thumb.png`.replace(/\\/g, "/");
    // Добавляем timestamp для обхода кэша
    return convertFileSrc(fullPath) + `?t=${Date.now()}`;
  }, [project.path]);

  const handleOpen = async () => {
    try {
      const content = await invoke<string>("load_project", {
        filePath: project.path,
      });
      const data = JSON.parse(content);
      const lastIdx = Math.max(
        project.path.lastIndexOf("/"),
        project.path.lastIndexOf("\\"),
      );
      const baseDir = project.path.substring(0, lastIdx);
      setProject(data, project.path);
      await resetCanvas();
      await loadWorkspace(baseDir);
      await addRecent(project.path, project.displayName, true);
      sessionStorage.setItem("currentView", "composer");
      setCurrentView("composer");

      setTimeout(async () => {
        await addRecent(project.path, project.displayName, true);
        await loadRecent();
      }, 3000);
    } catch (err) {
      toast.error("File moved or deleted", { id: "open-project-error" });
    }
  };

  const handleCheckboxClick = () => {
    toggleProjectSelection(project.id);
  };

  return (
    <div
      onClick={handleOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-bg-elevated border border-white/5 hover:border-primary/30 rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col ${
        isSelected ? "border-primary bg-primary/5" : ""
      }`}
    >
      {/* Checkbox overlay - top right */}
      <div
        className={`absolute top-3 right-3 z-20 transition-all duration-200 ${
          isHovered || isSelected
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox checked={isSelected} onCheckedChange={handleCheckboxClick} />
      </div>
      {/* ПРЕВЬЮ ПРОЕКТА */}
      <div className="aspect-video w-full bg-black/40 relative flex items-center justify-center overflow-hidden">
        {!imgError ? (
          <img
            src={thumbSrc}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-white/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-80" />

        {/* Иконка папки поверх превью */}
        <div className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors">
          <Folder className="w-4 h-4 text-white/70 group-hover:text-primary" />
        </div>
      </div>

      {/* ИНФО */}
      <div className="p-4 space-y-1">
        <h3 className="font-bold text-white text-sm truncate">
          {project.displayName}
        </h3>
        <p className="text-xs text-muted-foreground opacity-50">
          {formatRelativeTime(project.lastOpened)}
        </p>
      </div>

      {/* ФУТЕР */}
      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
        <span className="text-[8px] text-muted-foreground/50 uppercase font-black tracking-widest">
          Workspace
        </span>

        {/* Кнопка меню (3 точки) - всегда видима */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <ProjectActions project={project} />
        </DropdownMenu>
      </div>
    </div>
  );
}
