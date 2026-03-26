import { useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutManagerModal } from "@/components/modals/LayoutManagerModal";
import { useAppStore } from "@/store/useAppStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { invoke } from "@tauri-apps/api/core";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { UpdateDialog } from "@/components/modals/UpdateDialog";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import {
  getScheduledUpdate,
  clearScheduledUpdate,
  checkForUpdates,
  getSkippedUpdate,
} from "@/lib/updater";

// Lazy load views for code splitting
const DashboardView = lazy(() =>
  import("@/views/DashboardView").then((m) => ({ default: m.DashboardView })),
);
const ComposerView = lazy(() =>
  import("@/views/ComposerView").then((m) => ({ default: m.ComposerView })),
);
const DitherView = lazy(() =>
  import("@/views/DitherView").then((m) => ({ default: m.DitherView })),
);

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pageTransition = {
  duration: 0.3,
  ease: "easeOut" as const,
};

function PageLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  const {
    currentView,
    loadRecent,
    pendingUpdate,
    setPendingUpdate,
    setAvailableUpdate,
    setCurrentView,
  } = useAppStore();
  const { projectPath, setProject } = useProjectStore();
  const { resetCanvas, loadWorkspace } = useCanvasStore();

  // Восстановление проекта при обновлении страницы
  useEffect(() => {
    const restoreProject = async () => {
      const savedPath = sessionStorage.getItem("projectPath");
      const savedView = sessionStorage.getItem("currentView") as
        | "dashboard"
        | "composer"
        | "dither"
        | null;

      if (
        savedPath &&
        savedView &&
        (savedView === "composer" || savedView === "dither")
      ) {
        try {
          const content = await invoke<string>("load_project", {
            filePath: savedPath,
          });
          const data = JSON.parse(content);
          const lastIdx = Math.max(
            savedPath.lastIndexOf("/"),
            savedPath.lastIndexOf("\\"),
          );
          const baseDir = savedPath.substring(0, lastIdx);

          setProject(data, savedPath);
          await resetCanvas();
          await loadWorkspace(baseDir);
        } catch (err) {
          console.error("Failed to restore project:", err);
          sessionStorage.removeItem("currentView");
          sessionStorage.removeItem("projectPath");
          setCurrentView("dashboard");
        }
      }
    };

    restoreProject();
  }, []);

  // Если currentView = composer, но проект не загружен после монтирования, сбрасываем на dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentView === "composer" && !projectPath) {
        console.log("No project path found, redirecting to dashboard");
        sessionStorage.removeItem("currentView");
        setCurrentView("dashboard");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentView, projectPath, setCurrentView]);

  useEffect(() => {
    loadRecent();
    useAppStore.getState().loadSettings();
  }, []);

  useEffect(() => {
    const scheduled = getScheduledUpdate();
    if (scheduled) {
      setPendingUpdate(scheduled);
      clearScheduledUpdate();
    }

    const checkUpdates = async () => {
      const skipped = getSkippedUpdate();
      const update = await checkForUpdates();

      if (update) {
        if (skipped && skipped.version === update.version) {
          return;
        }
        setAvailableUpdate(update.version);
      }
    };

    checkUpdates();
  }, []);

  return (
    <div className="flex h-screen w-full bg-bg-canvas text-white overflow-hidden selection:bg-primary/30 font-sans">
      <main className="flex-1 h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === "dashboard" && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <Suspense fallback={<PageLoader />}>
                <DashboardView />
              </Suspense>
            </motion.div>
          )}
          {currentView === "composer" && (
            <motion.div
              key="composer"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <Suspense fallback={<PageLoader />}>
                <ComposerView />
              </Suspense>
            </motion.div>
          )}
          {currentView === "dither" && (
            <motion.div
              key="dither"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="h-full w-full"
            >
              <Suspense fallback={<PageLoader />}>
                <DitherView />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <LayoutManagerModal />
      <ConfirmModal />
      {pendingUpdate && <UpdateDialog updateInfo={pendingUpdate} />}

      <Toaster
        theme="dark"
        position="bottom-center"
        offset="120px"
        toastOptions={{
          className:
            "bg-[#121212] border border-white/10 text-white shadow-2xl rounded-xl font-medium",
        }}
      />
    </div>
  );
}
