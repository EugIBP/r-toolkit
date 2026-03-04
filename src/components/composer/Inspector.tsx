import { useCanvasStore } from "@/store/useCanvasStore";
import { InspectorIcon } from "./inspector/InspectorIcon";
import { InspectorAsset } from "./inspector/InspectorAsset";
import { InspectorColor } from "./inspector/InspectorColor";
import { InspectorScreen } from "./inspector/InspectorScreen";
import { Settings2, Layers, Palette, FolderTree } from "lucide-react";
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel";

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
    <Panel side="right" width="w-80">
      <PanelHeader title={title} icon={<Icon className="w-4 h-4" />} />
      <PanelContent className="min-h-0 bg-black/20 flex flex-col">
        {content}
      </PanelContent>
    </Panel>
  );
}
