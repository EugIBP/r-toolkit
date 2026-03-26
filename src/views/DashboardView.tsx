import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { ToolsSection } from "@/components/dashboard/ToolsSection";
import {
  Plus,
  FolderOpen,
  FilePlus,
  LayoutGrid,
  List,
  Search,
  ArrowUp,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { checkForUpdates } from "@/lib/updater";
import { toast } from "sonner";
import { WorkspaceMetaModal } from "@/components/modals/WorkspaceMetaModal";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProjectData } from "@/types/project"; // <--- ДОБАВЛЕНО

export function DashboardView() {
  const { setProject } = useProjectStore();
  const { resetCanvas, loadWorkspace } = useCanvasStore();

  const {
    addRecent,
    setEditingWorkspaceId,
    workspaceTab,
    setWorkspaceTab,
    viewMode,
    setViewMode,
    setPendingUpdate,
    availableUpdate,
    setAvailableUpdate,
    recentProjects,
    setCurrentView,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    getVersion()
      .then(setAppVersion)
      .catch(() => setAppVersion("0.0.0"));
  }, []);

  const handleVersionClick = async () => {
    const update = await checkForUpdates();
    if (update) {
      setAvailableUpdate(update.version);
      setPendingUpdate(update);
    } else {
      toast.info("You are using the latest version", { id: "update-latest" });
    }
  };

  // ИСПРАВЛЕНИЕ: строгий тип ProjectData
  const setupAndShowModal = async (filePath: string, data: ProjectData) => {
    if (!filePath || typeof filePath !== "string") return;

    const pathParts = filePath.split(/[\\/]/);
    const folderName = pathParts[pathParts.length - 2] || "New Workspace";
    const lastIdx = Math.max(
      filePath.lastIndexOf("/"),
      filePath.lastIndexOf("\\"),
    );
    const baseDir = filePath.substring(0, lastIdx);

    const id = btoa(encodeURIComponent(filePath));
    const isKnown = recentProjects.some((p) => p.id === id);

    setProject(data, filePath);
    await resetCanvas();
    await loadWorkspace(baseDir);
    await addRecent(filePath, folderName);

    if (isKnown) {
      sessionStorage.setItem("currentView", "composer");
      setCurrentView("composer");
    } else {
      setEditingWorkspaceId(id, true);
    }
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
      const data = JSON.parse(content) as ProjectData;

      await setupAndShowModal(filePath, data);
    } catch (err) {
      console.error("Failed to open project:", err);
      toast.error("Failed to open project file");
    }
  };

  return (
    <div className="h-full w-full bg-background flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="flex-1 w-full max-w-7xl px-10 flex flex-col min-h-0 animate-in fade-in duration-1000 z-10">
        <div className="flex items-end justify-between mb-8 pt-10 shrink-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
              Resource Toolkit
              {appVersion && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleVersionClick}
                  className="h-6 px-2 text-xs"
                >
                  v{appVersion}
                  {availableUpdate && (
                    <>
                      <ArrowUp className="w-3 h-3 text-emerald-500 ml-1" />
                      <span className="text-emerald-500 ml-1">
                        {availableUpdate}
                      </span>
                    </>
                  )}
                </Button>
              )}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              {workspaceTab === "workspace"
                ? "Open a workspace to get started"
                : "Select a tool to begin"}
            </p>
          </div>

          {workspaceTab === "workspace" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Workspace
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-3 py-3 cursor-pointer"
                >
                  <FilePlus className="w-4 h-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Create New</span>
                    <span className="text-xs text-muted-foreground">
                      Create new workspace
                    </span>
                  </div>
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem
                  onClick={handleOpenProject}
                  className="gap-3 py-3 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Open Existing</span>
                    <span className="text-xs text-muted-foreground">
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
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                workspaceTab === "workspace"
                  ? "Search workspaces..."
                  : "Search tools..."
              }
              className="w-80 pl-9 bg-muted/50 border-border"
            />
          </div>

          <Tabs
            value={workspaceTab}
            onValueChange={(v) => setWorkspaceTab(v as "workspace" | "tools")}
          >
            <TabsList className="bg-muted/50 border border-border">
              <TabsTrigger value="workspace" className="text-xs">
                Workspace
              </TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">
                Tools
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as "grid" | "list")}
            className="bg-muted/50 border border-border rounded-lg p-0.5"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Grid view"
              className="h-8 w-8 px-0"
            >
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              className="h-8 w-8 px-0"
            >
              <List className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
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
