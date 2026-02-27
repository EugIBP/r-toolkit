import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";
import { ProjectCard } from "./recent/ProjectCard";
import { ProjectRow } from "./recent/ProjectRow";

interface RecentProjectsProps {
  searchQuery: string;
}

export function RecentProjects({ searchQuery }: RecentProjectsProps) {
  const { recentProjects, viewMode } = useAppStore();

  const filtered = recentProjects.filter((p) =>
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20"
              >
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4 pb-20"
              >
                {filtered.map((p) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </motion.div>
            )
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="py-20 flex flex-col items-center opacity-20"
            >
              <FolderOpen className="w-16 h-16 mb-4" />
              <p className="text-sm font-medium uppercase tracking-[0.2em]">
                No workspaces found
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
