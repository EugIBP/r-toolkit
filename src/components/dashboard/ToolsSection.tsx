import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FolderOpen, GaugeCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";

const tools = [
  {
    id: "dither",
    name: "Dither Studio",
    description: "Mass image conversion with dithering",
    icon: Sparkles,
    action: "dither",
  },
  {
    id: "gauge",
    name: "Gauge Generator",
    description:
      "Generate rotating arrows, progress bars, and shader arcs with live preview",
    icon: GaugeCircle,
    action: "gauge_composer",
  },
];

interface ToolsSectionProps {
  searchQuery: string;
}

export function ToolsSection({ searchQuery }: ToolsSectionProps) {
  const { setCurrentView } = useAppStore();

  const filtered = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ScrollArea className="h-full pr-4 -mr-4">
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
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3 pb-4"
          >
            {filtered.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  sessionStorage.setItem("currentView", tool.action);
                  setCurrentView(tool.action as any);
                }}
                className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                  <tool.icon className="w-5 h-5 text-primary/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}
