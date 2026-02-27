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

export function ProjectRow({ project }: { project: RecentProject }) {
  const handleOpen = async () => {
    try {
      const content = await invoke<string>("load_project", {
        filePath: project.path,
      });
      const data = JSON.parse(content);
      const lastIdx = Math.max(project.path.lastIndexOf("/"), project.path.lastIndexOf("\\"));
      const baseDir = project.path.substring(0, lastIdx);
      await useProjectStore.getState().setProject(project.path, data);
      useCanvasStore.getState().resetCanvas();
      await useCanvasStore.getState().loadWorkspace(baseDir);
      await useAppStore.getState().addRecent(project.path, project.displayName);
      useAppStore.getState().setCurrentView("composer");
    } catch (err) {
      toast.error("Error opening project: " + err);
    }
  };

  return (
    <div
      onClick={handleOpen}
      className="group flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-all cursor-pointer shadow-sm"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
          <FolderOpen className="w-6 h-6 text-primary/70 group-hover:text-primary transition-all" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h4 className="font-semibold text-white text-base truncate group-hover:text-primary transition-colors">
            {project.displayName}
          </h4>
          <p className="text-[11px] text-muted-foreground opacity-50 truncate font-mono mt-0.5">
            {project.description || project.path}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6 pr-2 shrink-0">
        <div className="flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-medium uppercase tracking-tighter">
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
