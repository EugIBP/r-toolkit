import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Folder, MoreVertical, Image as ImageIcon } from "lucide-react";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectActions } from "./ProjectActions";

export function ProjectCard({ project }: { project: any }) {
  const { setProject } = useProjectStore();
  const { loadWorkspace, resetCanvas } = useCanvasStore();
  const { setCurrentView } = useAppStore();
  const [imgError, setImgError] = useState(false);

  // Формируем путь к превью
  const thumbSrc = useMemo(() => {
    const lastIndex = Math.max(
      project.path.lastIndexOf("/"),
      project.path.lastIndexOf("\\"),
    );
    const baseDir = project.path.substring(0, lastIndex);
    const fullPath = `${baseDir}/.rtoolkit/thumb.png`.replace(/\\/g, "/");
    // Добавляем timestamp для обхода кэша
    return (
      convertFileSrc(fullPath) + `?t=${project.lastModified || Date.now()}`
    );
  }, [project.path, project.lastModified]);

  const handleOpen = async () => {
    try {
      const content = await invoke<string>("load_project", {
        filePath: project.path,
      });
      const data = JSON.parse(content);
      const lastIdx = Math.max(project.path.lastIndexOf("/"), project.path.lastIndexOf("\\"));
      const baseDir = project.path.substring(0, lastIdx);
      setProject(data, project.path);
      await resetCanvas();
      await loadWorkspace(baseDir);
      setCurrentView("composer");
    } catch (err) {
      toast.error("File moved or deleted");
    }
  };

  return (
    <div
      onClick={handleOpen}
      className="group relative bg-[#121212] border border-white/5 hover:border-primary/30 rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col"
    >
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
          {project.displayName || project.name}
        </h3>
        <p className="text-[10px] text-muted-foreground font-mono truncate opacity-50">
          {project.path}
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
