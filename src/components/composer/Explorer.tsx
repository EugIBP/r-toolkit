import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ExplorerScreens } from "./explorer/ExplorerScreens";
import { ExplorerAssets } from "./explorer/ExplorerAssets";
import { ExplorerColors } from "./explorer/ExplorerColors";

export function Explorer({
  onScreenChange,
}: {
  onScreenChange: (i: number) => void;
}) {
  const { projectData } = useProjectStore();
  const { selectedIconIndex, activeTab, setActiveTab, activeScreenIdx } =
    useCanvasStore();

  if (!projectData) return null;
  const activeScreen = projectData.Screens[activeScreenIdx];
  const selectedIconName =
    selectedIconIndex !== null
      ? activeScreen?.Icons[selectedIconIndex]?.Name
      : null;

  // Auto-scroll to selected element
  useEffect(() => {
    if (selectedIconName && activeTab === "objects") {
      const timer = setTimeout(() => {
        const element = document.getElementById(`asset-${selectedIconName}`);
        if (element)
          element.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedIconName, activeTab]);

  return (
    <div className="w-80 border-r border-white/10 flex flex-col bg-[#0a0a0a] z-30 h-full overflow-hidden font-sans">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 bg-white/[0.02] shrink-0">
          <TabsList className="w-full grid grid-cols-3 h-11 bg-black/40 border border-white/10">
            <TabsTrigger
              value="screens"
              className="text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-primary/30"
            >
              Screens
            </TabsTrigger>
            <TabsTrigger
              value="objects"
              className="text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-primary/30"
            >
              Objects
            </TabsTrigger>
            <TabsTrigger
              value="colors"
              className="text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:ring-1 data-[state=active]:ring-primary/30"
            >
              Colors
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="screens"
          className="flex-1 m-0 data-[state=active]:flex flex-col min-h-0 overflow-hidden outline-none"
        >
          <ExplorerScreens onScreenChange={onScreenChange} />
        </TabsContent>

        <TabsContent
          value="objects"
          className="flex-1 m-0 data-[state=active]:flex flex-col min-h-0 overflow-hidden outline-none"
        >
          <ExplorerAssets />
        </TabsContent>

        <TabsContent
          value="colors"
          className="flex-1 m-0 data-[state=active]:flex flex-col min-h-0 overflow-hidden outline-none bg-[#0a0a0a]"
        >
          <ExplorerColors />
        </TabsContent>
      </Tabs>
    </div>
  );
}
