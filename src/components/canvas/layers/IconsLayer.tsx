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
      {activeScreen.Icons.map((iconInstance: any, idx: number) => {
        // --- ЛОГИКА ФИЛЬТРАЦИИ НА ХОЛСТЕ ---
        if (assetFilter !== "all") {
          // Находим ассет, чтобы проверить его путь
          const asset = projectData.Objects.find(
            (o: any) => o.Name === iconInstance.Name,
          );

          if (asset) {
            const isSprite = asset.isSprite || asset.Path.toLowerCase().includes("sprites");

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
            <SmartIcon iconInstance={iconInstance} iconIndex={idx} screenIdx={activeScreenIdx} />
          </div>
        );
      })}
    </div>
  );
}
