import { Image as ImageIcon, RefreshCw, FolderOpen } from "lucide-react";
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

  const isSprite = asset.isSprite || asset.Path?.toLowerCase().includes("sprites");

  return (
    <div className="space-y-2.5">
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
        <FolderOpen className="w-3 h-3" /> Asset Info
      </span>
      <div className="bg-[#181818] border border-white/5 rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">Path</span>
          <span className="text-[10px] font-mono text-white/80 truncate max-w-[60%]">
            {asset.Path}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">Type</span>
          <span className={`text-[10px] font-bold ${isSprite ? "text-orange-400" : "text-blue-400"}`}>
            {isSprite ? "Sprite" : "Icon"}
          </span>
        </div>
        {!isViewMode && (
          <div className="pt-2 border-t border-white/5">
            <span className="text-[9px] text-muted-foreground mb-2 block">Convert to</span>
            <div className="flex gap-2">
              <button
                onClick={() => convertAssetType(asset.Name, "icon")}
                disabled={!isSprite}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                  isSprite
                    ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                <ImageIcon className="w-3 h-3" /> Icon
              </button>
              <button
                onClick={() => convertAssetType(asset.Name, "sprite")}
                disabled={isSprite}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                  !isSprite
                    ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                <RefreshCw className="w-3 h-3" /> Sprite
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
