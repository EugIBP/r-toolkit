import { useCanvasStore } from "@/store/useCanvasStore";
import { InspectorIcon } from "./inspector/InspectorIcon";
import { InspectorAsset } from "./inspector/InspectorAsset";
import { InspectorScreen } from "./inspector/InspectorScreen";
import { Settings2, Layers, FolderTree } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Inspector() {
  const { selectedIconIndex, selectedAssetPath } = useCanvasStore();

  let content = null;
  let title = "Screen Settings";
  let Icon = Settings2;

  if (selectedIconIndex !== null) {
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
    <aside className="w-90 flex flex-col h-full bg-muted/10 border-l border-border z-30 shrink-0">
      <div className="h-20 px-5 flex items-center border-b border-border bg-muted/30 shrink-0">
        <Icon className="w-4 h-4 text-primary mr-2 opacity-80" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/90">
          {title}
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="p-4 flex flex-col gap-4">{content}</div>
        </ScrollArea>
      </div>
    </aside>
  );
}
