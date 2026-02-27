import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useAppStore } from "@/store/useAppStore";
import { Palette, Copy, Hash, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function InspectorColor() {
  const { projectData, updateColor, deleteColor } = useProjectStore();
  const { selectedColorKey, setSelectedColorKey, canvasMode } = useCanvasStore();
  const { confirm } = useAppStore();

  if (!projectData || !selectedColorKey) return null;

  const isEditMode = canvasMode === "edit";

  const hex = projectData.Colors[selectedColorKey];

  // Utility to clean HEX from #00 alpha (for input type="color" display)
  const getDisplayHex = (color: string) => {
    if (color.length === 9 && color.startsWith("#00")) {
      return "#" + color.substring(3);
    }
    return color;
  };

  const handleHexChange = (newHex: string) => {
    // Add #00 alpha prefix if not present, keep lowercase format
    const formattedHex = newHex.toLowerCase();
    const withAlpha = formattedHex.startsWith("#00") 
      ? formattedHex 
      : "#00" + formattedHex.substring(1);
    updateColor(selectedColorKey, selectedColorKey, withAlpha);
  };

  const handleNameChange = (newName: string) => {
    const upperName = newName.toUpperCase().replace(/\s+/g, "_");
    updateColor(selectedColorKey, upperName, hex);
    setSelectedColorKey(upperName);
  };

  const handleDelete = async () => {
    if (
      await confirm(
        "Delete Color",
        `Are you sure you want to remove ${selectedColorKey}?`,
      )
    ) {
      deleteColor(selectedColorKey);
      setSelectedColorKey(null);
      toast.info("Color removed from palette");
    }
  };

  const copyHex = () => {
    navigator.clipboard.writeText(hex);
    toast.success("Hex code copied!");
  };

  return (
    <ScrollArea className="h-full">
    <div className="flex flex-col w-full pb-10 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* COLOR BANNER - same height as icon preview */}
      <div className="w-full border-b border-white/5 bg-white/[0.01]">
        <div
          className="aspect-square w-full shadow-inner"
          style={{ backgroundColor: getDisplayHex(hex) }}
        />
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center gap-2">
          <Palette className="w-3 h-3 text-primary shrink-0" />
          <span className="text-[10px] font-bold text-white truncate uppercase tracking-wide">
            {selectedColorKey}
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto font-mono">
            {hex}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* EDIT NAME */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">
            Variable Name
          </label>
          <div className="relative group">
            <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={selectedColorKey}
              disabled={!isEditMode}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-[#181818] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs font-bold text-white outline-none focus:border-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* EDIT HEX */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">
            HEX Color Value
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                value={hex}
                disabled={!isEditMode}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-full bg-[#181818] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs font-mono text-white outline-none focus:border-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="relative w-10 h-10 shrink-0">
              <input
                type="color"
                disabled={!isEditMode}
                value={getDisplayHex(hex)}
                onChange={(e) => handleHexChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
              />
              <div
                className={`w-full h-full rounded-lg border border-white/10 shadow-lg ${!isEditMode ? 'opacity-50' : ''}`}
                style={{ backgroundColor: getDisplayHex(hex) }}
              />
            </div>

            <button
              onClick={copyHex}
              className="px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all"
              title="Copy HEX"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DANGER ZONE - только в Edit Mode */}
        {isEditMode && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-red-500/50 ml-1">
              Danger Zone
            </span>
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/5 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Color Asset
            </button>
          </div>
        )}

        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
            <span className="text-primary font-bold">Note:</span> Changing the
            HEX value will update all icons using this color key across all
            screens instantly.
          </p>
        </div>
      </div>
    </div>
    </ScrollArea>
  );
}
