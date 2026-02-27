import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { motion } from "framer-motion";
import { X, FileCode, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulkAddInstancesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkAddInstancesModal({ isOpen, onClose }: BulkAddInstancesModalProps) {
  const { scannedFiles, registerAndAddInstances, projectData } = useProjectStore();
  const { activeScreenIdx } = useCanvasStore();
  
  const [assets, setAssets] = useState<Array<{ name: string; path: string; type: "icon" | "sprite" | "bg" }>>([]);
  
  useEffect(() => {
    if (isOpen && scannedFiles.length > 0 && projectData) {
      // Get existing paths from Objects to filter only NEW files
      const existingPaths = new Set(
        projectData.Objects.map((obj: any) => obj.Path)
      );
      
      // Filter to only NEW files (not yet registered)
      const newFiles = scannedFiles.filter(path => !existingPaths.has(path));
      
      // Parse new scanned files to get asset info
      const parsed = newFiles.map((path) => {
        const pathLower = path.toLowerCase();
        const name = path.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, "") || path;
        
        let type: "icon" | "sprite" | "bg" = "icon";
        if (pathLower.includes("backgrounds")) type = "bg";
        else if (pathLower.includes("sprites")) type = "sprite";
        
        return { name, path, type };
      });
      setAssets(parsed);
    }
  }, [isOpen, scannedFiles, projectData]);
  
  const handleAddInstances = async () => {
    await registerAndAddInstances(activeScreenIdx);
    onClose();
  };
  
  const handleRegisterOnly = () => {
    const { registerAllAssets } = useProjectStore.getState();
    registerAllAssets();
    onClose();
  };

  if (!isOpen) return null;
  
  // Handle case where there are no new files
  if (assets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#121212] border border-white/10 w-[400px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">No New Assets</h3>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              All scanned files are already registered in your project.
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }
  
  const iconAssets = assets.filter(a => a.type === "icon");
  const spriteAssets = assets.filter(a => a.type === "sprite");
  const bgAssets = assets.filter(a => a.type === "bg");
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121212] border border-white/10 w-[480px] max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Add New Assets</h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        <ScrollArea className="flex-1">
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Found {assets.length} new asset{assets.length > 1 ? "s" : ""} to add to your project.
            Choose how you want to proceed:
          </p>
          
          {/* Preview of assets */}
          <div className="space-y-2">
            {bgAssets.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-muted-foreground uppercase">Backgrounds:</span>
                {bgAssets.slice(0, 5).map(a => (
                  <span key={a.path} className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                    {a.name}
                  </span>
                ))}
                {bgAssets.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">+{bgAssets.length - 5} more</span>
                )}
              </div>
            )}
            {iconAssets.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-muted-foreground uppercase">Icons:</span>
                {iconAssets.slice(0, 5).map(a => (
                  <span key={a.path} className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    {a.name}
                  </span>
                ))}
                {iconAssets.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">+{iconAssets.length - 5} more</span>
                )}
              </div>
            )}
            {spriteAssets.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-muted-foreground uppercase">Sprites:</span>
                {spriteAssets.slice(0, 5).map(a => (
                  <span key={a.path} className="text-[10px] px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                    {a.name}
                  </span>
                ))}
                {spriteAssets.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">+{spriteAssets.length - 5} more</span>
                )}
              </div>
            )}
          </div>
        </div>
        </ScrollArea>

        {/* Options */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] space-y-3">
          {/* Option 1: Add instances */}
          <button
            onClick={handleAddInstances}
            className="w-full flex items-center justify-between gap-3 p-4 bg-primary/20 hover:bg-primary/25 border border-primary/30 rounded-xl transition-all group ring-1 ring-primary/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">Add instances to screen</div>
                <div className="text-[10px] text-muted-foreground">
                  Register assets and create instances on current screen
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
          </button>
          
          {/* Option 2: Register only */}
          <button
            onClick={handleRegisterOnly}
            className="w-full flex items-center justify-between gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FileCode className="w-4 h-4 text-white/60" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">Register only</div>
                <div className="text-[10px] text-muted-foreground">
                  Add to Objects, add instances manually later
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </button>
          
          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-muted-foreground hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
