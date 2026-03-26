import { useCanvasStore } from "@/store/useCanvasStore";
import { ScreenList } from "./screens/ScreenList";
import { ScreenDetail } from "./screens/ScreenDetail";

export function ExplorerScreens({
  onScreenChange,
}: {
  onScreenChange: (i: number) => void;
}) {
  const { screenListMode } = useCanvasStore();

  if (screenListMode === "detail") {
    return <ScreenDetail />;
  }

  return <ScreenList onScreenChange={onScreenChange} />;
}
