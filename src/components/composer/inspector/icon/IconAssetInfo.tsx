import { Image as FolderOpen } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { Button } from "@/components/ui/button";

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
  const isIcon = !isSprite && !isPal;

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        <FolderOpen className="w-3 h-3" /> Asset Info
      </span>
      <div className="bg-muted/20 border border-border rounded-xl p-3 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            Path
          </span>
          <span className="text-[10px] font-mono text-foreground/80 truncate max-w-[60%] bg-muted/50 px-1.5 py-0.5 rounded-md border border-border/50">
            {asset.Path}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            Type
          </span>
          <span
            className={`text-[10px] uppercase font-bold tracking-wider ${isPal ? "text-emerald-500" : isSprite ? "text-orange-500" : "text-blue-500"}`}
          >
            {isPal ? "Pal" : isSprite ? "Sprite" : "Icon"}
          </span>
        </div>

        {!isViewMode && (
          <div className="pt-3 border-t border-border/50">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block font-medium">
              Convert Asset Type
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => convertAssetType(asset.Name, "icon")}
                disabled={isIcon}
                // disabled:opacity-100 нужен, чтобы активная цветная кнопка не становилась тусклой
                className={`flex-1 h-8 text-[10px] uppercase tracking-wider font-bold transition-all disabled:opacity-100 ${
                  isIcon
                    ? "bg-blue-500/20 text-blue-500 border-blue-500/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50"
                }`}
              >
                Icon
              </Button>
              <Button
                variant="outline"
                onClick={() => convertAssetType(asset.Name, "sprite")}
                disabled={isSprite}
                className={`flex-1 h-8 text-[10px] uppercase tracking-wider font-bold transition-all disabled:opacity-100 ${
                  isSprite
                    ? "bg-orange-500/20 text-orange-500 border-orange-500/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50"
                }`}
              >
                Sprite
              </Button>
              <Button
                variant="outline"
                onClick={() => convertAssetType(asset.Name, "pal")}
                disabled={isPal}
                className={`flex-1 h-8 text-[10px] uppercase tracking-wider font-bold transition-all disabled:opacity-100 ${
                  isPal
                    ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50"
                }`}
              >
                Pal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
