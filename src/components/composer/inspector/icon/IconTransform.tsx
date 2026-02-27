import { useProjectStore } from "@/store/useProjectStore";

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
    <div className="space-y-2.5">
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
        Transform
      </span>
      <div className="grid grid-cols-2 gap-3">
        {(["X", "Y"] as const).map((axis) => (
          <div key={axis} className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
              {axis}
            </div>
            <input
              type="number"
              disabled={isViewMode}
              value={icon[axis]}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                updateIcon(screenIdx, iconIdx, { [axis]: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-[#181818] border border-white/5 rounded-lg py-2 pl-7 pr-2 text-xs text-white focus:border-primary/40 outline-none transition-all font-mono"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
