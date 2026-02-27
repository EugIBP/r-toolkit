import { Settings2, Trash2 } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAppStore, RecentProject } from "@/store/useAppStore";

export function ProjectActions({ project }: { project: RecentProject }) {
  const { setEditingWorkspaceId, removeRecent, confirm } = useAppStore();

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const yes = await confirm(
      "Remove Workspace",
      `Remove "${project.displayName}" from recent workspaces?\n(The actual project files on your disk will NOT be deleted).`,
    );

    if (yes) {
      removeRecent(project.id);
    }
  };

  return (
    <DropdownMenuContent
      onClick={(e) => e.stopPropagation()}
      align="end"
      className="bg-[#121212] border-white/10 text-white min-w-[180px] p-1.5 rounded-xl shadow-2xl z-50"
    >
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          setEditingWorkspaceId(project.id);
        }}
        className="gap-2 focus:bg-primary/20 cursor-pointer py-2.5 rounded-lg font-medium"
      >
        <Settings2 className="w-4 h-4 opacity-60" /> Workspace Settings
      </DropdownMenuItem>

      <div className="h-px bg-white/5 my-1.5" />

      <DropdownMenuItem
        onClick={handleRemove}
        className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer py-2.5 rounded-lg font-medium"
      >
        <Trash2 className="w-4 h-4" /> Remove from Recents
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
