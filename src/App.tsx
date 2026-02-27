import { useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsModal } from "@/components/layout/SettingsModal";
import { useAppStore } from "@/store/useAppStore";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { UpdateDialog } from "@/components/ui/UpdateDialog";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { getScheduledUpdate, clearScheduledUpdate, checkForUpdates, getSkippedUpdate } from "@/lib/updater";

// Lazy load views for code splitting
const DashboardView = lazy(() => import("@/views/DashboardView").then(m => ({ default: m.DashboardView })));
const ComposerView = lazy(() => import("@/views/ComposerView").then(m => ({ default: m.ComposerView })));
const DitherView = lazy(() => import("@/views/DitherView").then(m => ({ default: m.DitherView })));

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const pageTransition = {
  duration: 0.3,
  ease: "easeOut" as const
};

function PageLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  const { currentView, loadRecent, pendingUpdate, setPendingUpdate, setAvailableUpdate } = useAppStore();

  useEffect(() => {
    loadRecent();
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
        setPendingUpdate(update);
      }
    };
    
    checkUpdates();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-white overflow-hidden selection:bg-primary/30 font-sans">
      <main className="flex-1 relative overflow-hidden">
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

      <SettingsModal />
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
