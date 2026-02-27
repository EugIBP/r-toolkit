import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { ToolsSection } from "@/components/dashboard/ToolsSection";
import { Plus, FolderOpen, FilePlus, LayoutGrid, List, Search } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { WorkspaceMetaModal } from "@/components/dashboard/WorkspaceMetaModal";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardView() {
  const { setProject } = useProjectStore();
  const { resetCanvas, loadWorkspace } = useCanvasStore();
  const { addRecent, setEditingWorkspaceId, workspaceTab, setWorkspaceTab, viewMode, setViewMode } = useAppStore();
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const setupAndShowModal = async (filePath: string, data: any) => {
    if (!filePath || typeof filePath !== "string") return;

    const pathParts = filePath.split(/[\\/]/);
    const folderName = pathParts[pathParts.length - 2] || "New Workspace";
    const lastIdx = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
    const baseDir = filePath.substring(0, lastIdx);

    setProject(data, filePath);
    await resetCanvas();
    await loadWorkspace(baseDir);
    await addRecent(filePath, folderName);

    const id = btoa(encodeURIComponent(filePath));
    setEditingWorkspaceId(id);
  };

  const handleOpenProject = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (!selected) return;

      const filePath = Array.isArray(selected) ? selected[0] : selected;
      const content = await invoke<string>("load_project", { filePath });
      const data = JSON.parse(content);

      await setupAndShowModal(filePath, data);
    } catch (err) {
      console.error("Failed to open project:", err);
    }
  };

  return (
    <div className="h-full w-full bg-[#050505] flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="flex-1 w-full max-w-7xl px-10 flex flex-col pt-[12vh] pb-20 animate-in fade-in duration-1000">
        <div className="flex items-end justify-between mb-16">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Resource Toolkit
            </h1>
            <p className="text-xs text-muted-foreground">
              {workspaceTab === "workspace" ? "Open a workspace to get started" : "Select a tool to begin"}
            </p>
          </div>

          {workspaceTab === "workspace" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="w-3.5 h-3.5" />
                  Workspace
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#121212] border-white/10 text-white min-w-[200px] p-1.5 rounded-xl shadow-2xl z-50"
              >
                <DropdownMenuItem
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-3 focus:bg-white/10 cursor-pointer py-3 rounded-lg font-medium"
                >
                  <FilePlus className="w-4 h-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-xs">Create New</span>
                    <span className="text-[9px] text-muted-foreground">
                      Create new workspace
                    </span>
                  </div>
                </DropdownMenuItem>

                <div className="h-px bg-white/5 my-1.5" />

                <DropdownMenuItem
                  onClick={handleOpenProject}
                  className="gap-3 focus:bg-white/10 cursor-pointer py-3 rounded-lg font-medium"
                >
                  <FolderOpen className="w-4 h-4 opacity-70" />
                  <div className="flex flex-col">
                    <span className="text-xs">Open Existing</span>
                    <span className="text-[9px] text-muted-foreground">
                      Select description.json
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={workspaceTab === "workspace" ? "Search workspaces..." : "Search tools..."}
              className="w-80 bg-white/5 border border-white/10 rounded-xl px-11 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 transition-all font-medium"
            />
          </div>

          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setWorkspaceTab("workspace")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                workspaceTab === "workspace"
                  ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setWorkspaceTab("tools")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                workspaceTab === "tools"
                  ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              Tools
            </button>
          </div>

          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 shadow-inner gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {workspaceTab === "workspace" ? (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <RecentProjects searchQuery={search} />
            </motion.div>
          ) : (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <ToolsSection searchQuery={search} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WorkspaceMetaModal />
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
