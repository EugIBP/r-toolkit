import {
  Check,
  Image as BgIcon,
  Pencil,
  Trash2,
  Plus,
  ArrowRightLeft,
} from "lucide-react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import type { ScreenData } from "@/types/project";

interface Props {
  isUnregistered: boolean;
  isEditMode: boolean;
  isBG: boolean;
  isSprite: boolean;
  assetName: string;
  activeScreenBackground?: string;
  activeScreenIdx: number;
  screens?: ScreenData[];
  isAssetBulk: boolean;
  assetBulkCount: number;
  onRegister: () => void;
  onSetBackground: () => void;
  onEditBg: () => void;
  onDelete: () => void;
  onQuickAdd: () => void;
  onAddToScreen: (screenIdx: number) => void;
  onConvertType: (type: "icon" | "sprite") => void;
}

export function AssetContextMenuContent({
  isUnregistered,
  isEditMode,
  isBG,
  isSprite,
  assetName,
  activeScreenBackground,
  activeScreenIdx,
  screens,
  isAssetBulk,
  assetBulkCount,
  onRegister,
  onSetBackground,
  onEditBg,
  onDelete,
  onQuickAdd,
  onAddToScreen,
  onConvertType,
}: Props) {
  if (isUnregistered) {
    return (
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            onRegister();
          }}
          className="gap-2 cursor-pointer text-xs font-bold text-amber-500 focus:text-amber-500 focus:bg-amber-500/10"
        >
          <Check className="w-3.5 h-3.5" /> Register Asset
        </ContextMenuItem>
      </ContextMenuContent>
    );
  }

  if (isBG) {
    return (
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            onSetBackground();
          }}
          className="gap-2 cursor-pointer text-xs"
        >
          {activeScreenBackground === assetName ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Remove Background</span>
            </>
          ) : (
            <>
              <BgIcon className="w-3.5 h-3.5 opacity-70" /> Set as Background
            </>
          )}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            onEditBg();
          }}
          className="gap-2 cursor-pointer text-xs"
        >
          <Pencil className="w-3.5 h-3.5 opacity-70" /> Edit Properties...
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-border/50" />
        <ContextMenuItem
          disabled={!isEditMode}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />{" "}
          {isAssetBulk
            ? `Delete ${assetBulkCount} assets`
            : "Remove from project"}
        </ContextMenuItem>
      </ContextMenuContent>
    );
  }

  return (
    <ContextMenuContent className="w-56">
      <ContextMenuItem
        disabled={!isEditMode}
        onClick={(e) => {
          e.stopPropagation();
          onQuickAdd();
        }}
        className="gap-2 cursor-pointer text-xs font-bold text-primary focus:text-primary focus:bg-primary/10"
      >
        <Plus className="w-3.5 h-3.5 opacity-80" /> Add to current screen
      </ContextMenuItem>
      {screens && screens.length > 1 && (
        <>
          <ContextMenuSeparator className="bg-border/50" />
          {screens.map(
            (screen, idx) =>
              idx !== activeScreenIdx && (
                <ContextMenuItem
                  disabled={!isEditMode}
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToScreen(idx);
                  }}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <span className="w-4 h-4 rounded bg-background border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                    S{idx + 1}
                  </span>{" "}
                  Add to {screen.Name}
                </ContextMenuItem>
              ),
          )}
        </>
      )}
      <ContextMenuSeparator className="bg-border/50" />
      <ContextMenuItem
        disabled={!isEditMode}
        onClick={(e) => {
          e.stopPropagation();
          onConvertType(isSprite ? "icon" : "sprite");
        }}
        className="gap-2 cursor-pointer text-xs text-muted-foreground"
      >
        <ArrowRightLeft className="w-3.5 h-3.5 opacity-70" /> Convert to{" "}
        {isSprite ? "Static Icon" : "Sprite"}
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-border/50" />
      <ContextMenuItem
        disabled={!isEditMode}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
      >
        <Trash2 className="w-3.5 h-3.5" />{" "}
        {isAssetBulk
          ? `Delete ${assetBulkCount} assets`
          : "Remove from project"}
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
