import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FolderOpen } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { ScrollArea } from "@/components/ui/scroll-area";

const tools = [
  {
    id: "dither",
    name: "Dither Studio",
    description: "Mass image conversion with dithering",
    icon: Sparkles,
    action: "dither",
  },
];

interface ToolsSectionProps {
  searchQuery: string;
}

export function ToolsSection({ searchQuery }: ToolsSectionProps) {
  const { setCurrentView, viewMode } = useAppStore();

  const filtered = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
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
                No tools found
              </p>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20"
            >
              {filtered.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentView(tool.action as "dither")}
                  className="group flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                    <tool.icon className="w-5 h-5 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {tool.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3 pb-20"
            >
              {filtered.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentView(tool.action as "dither")}
                  className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                    <tool.icon className="w-5 h-5 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {tool.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
