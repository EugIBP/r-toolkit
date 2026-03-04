import { Image as FolderOpen } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";

interface Props {
  assetName: string;
  isViewMode: boolean;
}

export function IconAssetInfo({ assetName, isViewMode }: Props) {
  const { projectData, convertAssetType } = useProjectStore();

  if (!projectData) return null;

  const asset = projectData.Objects.find((o: any) => o.Name === assetName);
  if (!asset) return null;

  const isSprite =
    asset.isSprite || asset.Path?.toLowerCase().includes("sprites");
  const isPal = asset.Type === "Pal";

  return (
    <div className="space-y-2.5">
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
        <FolderOpen className="w-3 h-3" /> Asset Info
      </span>
      <div className="bg-[#181818] border border-white/5 rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Path</span>
          <span className="text-xs font-mono text-white/80 truncate max-w-[60%]">
            {asset.Path}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Type</span>
          <span
            className={`text-xs font-bold ${
              isPal
                ? "text-green-400"
                : isSprite
                  ? "text-orange-400"
                  : "text-blue-400"
            }`}
          >
            {isPal ? "Pal" : isSprite ? "Sprite" : "Icon"}
          </span>
        </div>
        {!isViewMode && (
          <div className="pt-2 border-t border-white/5">
            <span className="text-xs text-muted-foreground mb-2 block">
              Convert to
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => convertAssetType(asset.Name, "icon")}
                disabled={!isSprite && !isPal}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isSprite && !isPal
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                }`}
              >
                Icon
              </button>
              <button
                onClick={() => convertAssetType(asset.Name, "sprite")}
                disabled={isSprite}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSprite
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                }`}
              >
                Sprite
              </button>
              <button
                onClick={() => convertAssetType(asset.Name, "pal")}
                disabled={isPal}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isPal
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                }`}
              >
                Pal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
