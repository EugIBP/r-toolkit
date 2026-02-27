import { useCanvasStore } from "@/store/useCanvasStore";
import { InspectorIcon } from "./inspector/InspectorIcon";
import { InspectorAsset } from "./inspector/InspectorAsset";
import { InspectorColor } from "./inspector/InspectorColor";
import { InspectorScreen } from "./inspector/InspectorScreen";
import { Settings2, Layers, Palette, FolderTree } from "lucide-react";

export function Inspector() {
  const { selectedIconIndex, selectedColorKey, selectedAssetPath } =
    useCanvasStore();

  let content = null;
  let title = "Screen Settings";
  let Icon = Settings2;

  if (selectedColorKey) {
    title = "Color Palette";
    Icon = Palette;
    content = <InspectorColor />;
  } else if (selectedIconIndex !== null) {
    title = "Icon Properties";
    Icon = Layers;
    content = <InspectorIcon />;
  } else if (selectedAssetPath) {
    title = "Asset Library";
    Icon = FolderTree;
    content = <InspectorAsset />;
  } else {
    title = "Screen Settings";
    Icon = Settings2;
    content = <InspectorScreen />;
  }

  return (
    <div className="w-80 border-l border-white/10 bg-[#0a0a0a] flex flex-col h-full z-30 shrink-0 shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="h-12 border-b border-white/10 flex items-center px-5 bg-white/[0.02] shrink-0">
        <Icon className="w-4 h-4 text-primary mr-2 opacity-80" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
          {title}
        </span>
      </div>

      <div className="flex-1 min-h-0 bg-black/20 flex flex-col">
        {content}
      </div>
    </div>
  );
}
