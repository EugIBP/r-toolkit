import type { IconInstance, AssetObject } from "@/types/project";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore"; // <-- Импорт
import { SmartIcon } from "../entities/SmartIcon";

export function IconsLayer({ activeScreenIdx }: { activeScreenIdx: number }) {
  const { projectData } = useProjectStore();
  const { assetFilter } = useCanvasStore(); // <-- Достаем фильтр

  if (!projectData) return null;

  const activeScreen = projectData.Screens[activeScreenIdx];
  if (!activeScreen || !activeScreen.Icons) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* 2. Заменяем (iconInstance: any) на (iconInstance: IconInstance) */}
      {activeScreen.Icons.map((iconInstance: IconInstance, idx: number) => {
        if (assetFilter !== "all") {
          // 3. Заменяем (o: any) на (o: AssetObject)
          const asset = projectData.Objects.find(
            (o: AssetObject) => o.Name === iconInstance.Name,
          );

          if (asset) {
            const isSprite =
              asset.isSprite || asset.Path.toLowerCase().includes("sprites");

            // Если выбран фильтр 'icons', а это спрайт -> скрываем
            if (assetFilter === "icons" && isSprite) return null;

            // Если выбран фильтр 'sprites', а это не спрайт -> скрываем
            if (assetFilter === "sprites" && !isSprite) return null;

            // Если выбран фильтр 'bg', скрываем всё (так как тут только иконки)
            if (assetFilter === "bg") return null;
          }
        }
        // ------------------------------------

        return (
          <div
            key={`${iconInstance.Name}-${idx}`}
            className="pointer-events-auto"
          >
            <SmartIcon
              iconInstance={iconInstance}
              iconIndex={idx}
              screenIdx={activeScreenIdx}
            />
          </div>
        );
      })}
    </div>
  );
}
