import { useProjectStore } from "@/store/useProjectStore";
import { Input } from "@/components/ui/input";

interface Props {
  screenIdx: number;
  iconIdx: number;
  isViewMode: boolean;
}

export function IconTransform({ screenIdx, iconIdx, isViewMode }: Props) {
  const { projectData, updateIcon } = useProjectStore();
  const icon = projectData?.Screens[screenIdx]?.Icons[iconIdx];
  if (!icon) return null;

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Transform
      </span>
      <div className="grid grid-cols-2 gap-3">
        {(["X", "Y"] as const).map((axis) => (
          <div key={axis} className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              {axis}
            </span>
            <Input
              type="number"
              disabled={isViewMode}
              value={icon[axis]}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                updateIcon(screenIdx, iconIdx, {
                  [axis]: parseInt(e.target.value) || 0,
                })
              }
              // Заменили font-mono на font-medium
              className="pl-7 h-8 font-medium text-xs bg-muted/50 border-border [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
