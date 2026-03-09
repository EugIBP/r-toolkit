import { FolderOpen, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore, RecentProject } from "@/store/useAppStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { toast } from "sonner";
import { ProjectActions } from "./ProjectActions";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function ProjectRow({ project }: { project: RecentProject }) {
  const { toggleProjectSelection, selectedProjectIds } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedProjectIds.has(project.id);

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
      await useProjectStore.getState().setProject(project.path, data);
      useCanvasStore.getState().resetCanvas();
      await useCanvasStore.getState().loadWorkspace(baseDir);
      await useAppStore.getState().addRecent(project.path, project.displayName);
      sessionStorage.setItem('currentView', 'composer');
      useAppStore.getState().setCurrentView("composer");
    } catch (err) {
      toast.error("Error opening project: " + err, {
        id: "open-project-error",
      });
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
      className={`group flex items-center justify-between p-4 bg-white/[0.03] border rounded-2xl transition-all duration-300 cursor-pointer shadow-sm ${
        isSelected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-white/10 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Checkbox */}
        <div
          className={`shrink-0 transition-all ${
            isHovered || isSelected ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxClick}
          />
        </div>

        <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5 shadow-inner group-hover:scale-105 transition-transform">
          <FolderOpen className="w-6 h-6 text-primary/70 group-hover:text-primary transition-all" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h4 className="font-semibold text-white text-base truncate group-hover:text-primary/90 transition-colors">
            {project.displayName}
          </h4>
          <p className="text-[11px] text-muted-foreground opacity-50 truncate font-mono mt-0.5">
            {project.description || project.path}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6 pr-2 shrink-0">
        <div className="flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-medium uppercase tracking-tighter">
            Modified
          </span>
          <span className="text-[11px] font-medium">
            {new Date(project.lastOpened).toLocaleDateString()}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-2 hover:bg-white/10 rounded-xl transition-all opacity-50 group-hover:opacity-100"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </DropdownMenuTrigger>
          <ProjectActions project={project} />
        </DropdownMenu>
      </div>
    </div>
  );
}
