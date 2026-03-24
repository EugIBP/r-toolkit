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
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden font-sans border-r border-white/10 bg-[#121212] z-10">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        {/* ОРИГИНАЛЬНЫЙ ВАШ СТИЛЬ ТАБОВ ИЗ ПРЕДЫДУЩИХ ВЕРСИЙ */}
        <div className="px-3 pt-3 pb-2 border-b border-white/5 bg-white/[0.02] shrink-0">
          <TabsList className="w-full grid grid-cols-3 h-9 bg-black/40 border border-white/5">
            <TabsTrigger
              value="objects"
              className="text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground"
            >
              Objects
            </TabsTrigger>
            <TabsTrigger
              value="colors"
              className="text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground"
            >
              Colors
            </TabsTrigger>
            <TabsTrigger
              value="screens"
              className="text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground"
            >
              Screens
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="objects"
          className="flex-1 m-0 data-[state=active]:flex flex-col min-h-0 overflow-hidden outline-none"
        >
          <ExplorerAssets />
        </TabsContent>

        <TabsContent
          value="colors"
          className="flex-1 m-0 data-[state=active]:flex flex-col min-h-0 overflow-hidden outline-none"
        >
          <ExplorerColors />
        </TabsContent>

        <TabsContent
          value="screens"
          className="flex-1 m-0 data-[state=active]:flex flex-col min-h-0 overflow-hidden outline-none"
        >
          <ExplorerScreens onScreenChange={onScreenChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
