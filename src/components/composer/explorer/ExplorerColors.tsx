import { useState, useEffect } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useAppStore } from "@/store/useAppStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Palette,
  Plus,
  Trash2,
  Pipette,
  Save,
  CheckSquare,
  X,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartCheckboxAction } from "@/components/ui/smart-checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { toast } from "sonner";

function ActionIcon({ icon: Icon, onClick, tooltip, className = "" }: any) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={`h-7 w-7 rounded-lg ${className}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="text-[10px] font-bold uppercase tracking-wider"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const getDisplayHex = (color: string) => {
  if (color.length === 9 && color.startsWith("#00"))
    return "#" + color.substring(3);
  return color;
};

const hexToRgb = (hex: string) => {
  let cleanHex = getDisplayHex(hex).replace("#", "");
  if (cleanHex.length === 3)
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  if (cleanHex.length !== 6) return { r: 0, g: 0, b: 0, string: "0, 0, 0" };
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b, string: `${r}, ${g}, ${b}` };
};

export function ExplorerColors() {
  const { projectData, addColor, updateColor, deleteColor, deleteColors } =
    useProjectStore();
  const { selectedColorKey, setSelectedColorKey, canvasMode } =
    useCanvasStore();
  const { confirm } = useAppStore();

  const [editName, setEditName] = useState("");
  const [editHex, setEditHex] = useState("#FFFFFF");
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());

  if (!projectData) return null;

  const isEditMode = canvasMode === "edit";
  const colorsList = Object.entries(projectData.Colors);

  useEffect(() => {
    if (selectedColorKey && projectData.Colors[selectedColorKey]) {
      setEditName(selectedColorKey);
      setEditHex(getDisplayHex(projectData.Colors[selectedColorKey]));
    } else {
      setEditName("");
      setEditHex("#FFFFFF");
    }
  }, [selectedColorKey, projectData.Colors]);

  useEffect(() => {
    if (!isEditMode && selectedColorKey) setSelectedColorKey(null);
  }, [isEditMode]);

  const handleAddColor = () => {
    let newName = "NEW_COLOR";
    let counter = 1;
    while (projectData.Colors[newName]) {
      newName = `NEW_COLOR_${counter}`;
      counter++;
    }
    addColor(newName, "#00ffffff");
    setSelectedColorKey(newName);
  };

  const handleUpdate = () => {
    if (!selectedColorKey) return;
    const upperName =
      editName.trim().toUpperCase().replace(/\s+/g, "_") || "COLOR";
    updateColor(selectedColorKey, upperName, editHex);
    if (selectedColorKey !== upperName) setSelectedColorKey(upperName);
  };

  const handleDelete = async () => {
    if (!selectedColorKey) return;
    if (
      await confirm(
        "Delete Color",
        `Are you sure you want to remove ${selectedColorKey}?`,
      )
    ) {
      deleteColor(selectedColorKey);
      setSelectedColorKey(null);
    }
  };

  const copyHexToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success("Hex code copied!");
  };

  const isSelectionMode = selectedColors.size > 0;
  const isAllSelected =
    selectedColors.size > 0 && selectedColors.size === colorsList.length;

  return (
    <div className="flex flex-col h-full min-h-0 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-border bg-muted/10 shrink-0 min-h-[52px]">
        {isSelectionMode ? (
          <div className="flex items-center justify-between w-full animate-in fade-in gap-2">
            <span className="text-[11px] font-bold text-primary whitespace-nowrap">
              {selectedColors.size} sel.
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <ActionIcon
                icon={CheckSquare}
                tooltip={isAllSelected ? "Deselect All" : "Select All"}
                className={
                  isAllSelected
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() =>
                  setSelectedColors(
                    isAllSelected
                      ? new Set()
                      : new Set(colorsList.map(([name]) => name)),
                  )
                }
              />
              <div className="h-4 w-px bg-border mx-0.5" />
              <ActionIcon
                icon={Trash2}
                tooltip="Delete"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={async () => {
                  if (
                    await confirm(
                      "Delete Colors",
                      `Delete ${selectedColors.size} colors?`,
                    )
                  ) {
                    deleteColors(Array.from(selectedColors));
                    setSelectedColors(new Set());
                  }
                }}
              />
              <ActionIcon
                icon={X}
                onClick={() => setSelectedColors(new Set())}
                tooltip="Cancel"
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-primary opacity-80" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Colors
              </span>
            </div>
            <Button
              onClick={handleAddColor}
              disabled={!isEditMode}
              size="sm"
              variant="secondary"
              className="h-7 px-2.5 text-[10px] gap-1.5 font-bold uppercase tracking-wider bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
            >
              <Plus className="w-3.5 h-3.5" /> Add Color
            </Button>
          </div>
        )}

        {isEditMode && selectedColorKey && !isSelectionMode && (
          <div className="flex flex-col gap-3 bg-background border border-border p-3 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-3 w-full items-start">
              <div className="space-y-2 flex-1 min-w-0">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 font-bold uppercase text-xs bg-muted/30 border-border"
                  placeholder="COLOR_NAME"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                    #
                  </span>
                  <Input
                    value={editHex.replace("#", "")}
                    onChange={(e) => setEditHex("#" + e.target.value)}
                    className="pl-7 h-8 font-mono text-xs bg-muted/30 border-border"
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 items-center shrink-0">
                <div
                  className="w-14 h-14 rounded-lg border border-border shadow-sm relative overflow-hidden group/color shrink-0"
                  style={{ backgroundColor: editHex }}
                >
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none -z-10"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)",
                      backgroundSize: "8px 8px",
                    }}
                  />
                  <input
                    type="color"
                    value={editHex}
                    onChange={(e) => setEditHex(e.target.value)}
                    className="absolute -inset-2 w-[150%] h-[150%] opacity-0 cursor-pointer"
                  />
                  <Pipette className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white drop-shadow-md opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full pt-2 border-t border-border/50">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="h-7 flex-1 text-[10px] gap-1 px-2 font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
              >
                <Save className="w-3 h-3" /> Update
              </Button>
              <Button
                onClick={handleDelete}
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-1 pb-4">
          {colorsList.length === 0 ? (
            <div className="py-10 text-center opacity-30 text-xs uppercase tracking-widest font-medium text-muted-foreground">
              No colors defined
            </div>
          ) : (
            colorsList.map(([name, hexValue]) => {
              const isSelectedRow = selectedColorKey === name;
              const isCheckboxSelected = selectedColors.has(name);
              const displayHex = getDisplayHex(hexValue as string);
              const rgb = hexToRgb(hexValue as string).string;

              let wrapperClasses = `group/row flex items-stretch w-full rounded-xl border transition-all overflow-hidden ${
                isCheckboxSelected
                  ? "bg-primary/10 border-primary/30"
                  : isSelectedRow && isEditMode
                    ? "bg-primary/20 border-primary/50 shadow-sm"
                    : "bg-muted/20 border-transparent hover:border-border/50"
              }`;

              return (
                <div key={name} className={wrapperClasses}>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <button
                        onClick={() => {
                          if (isEditMode) setSelectedColorKey(name);
                        }}
                        className={`flex-1 flex items-center min-w-0 gap-3 px-3 py-2.5 ${isEditMode ? "rounded-l-xl" : "rounded-xl"} hover:bg-foreground/5 transition-colors text-left`}
                      >
                        <div
                          className="w-8 h-8 rounded-md border border-border/50 shrink-0 shadow-sm relative overflow-hidden"
                          style={{ backgroundColor: displayHex }}
                        >
                          <div
                            className="absolute inset-0 opacity-10 pointer-events-none -z-10"
                            style={{
                              backgroundImage:
                                "linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)",
                              backgroundSize: "8px 8px",
                            }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <span
                            className="text-xs font-semibold text-foreground truncate"
                            title={name}
                          >
                            {name}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mt-0.5">
                            <span className="text-foreground/80 uppercase font-mono">
                              {displayHex}
                            </span>
                            <span className="opacity-40 hidden xl:inline">
                              |
                            </span>
                            <span className="font-mono hidden xl:inline">
                              {rgb}
                            </span>
                          </div>
                        </div>
                        {isSelectedRow && isEditMode && !isSelectionMode && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold uppercase shrink-0 mr-1">
                            Active
                          </span>
                        )}
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        disabled={!isEditMode}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyHexToClipboard(displayHex);
                        }}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 opacity-70" /> Copy HEX
                      </ContextMenuItem>
                      <ContextMenuSeparator className="bg-border/50" />
                      <ContextMenuItem
                        disabled={!isEditMode}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            await confirm("Delete Color", `Remove ${name}?`)
                          ) {
                            deleteColor(name);
                            if (selectedColorKey === name)
                              setSelectedColorKey(null);
                          }
                        }}
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Color
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  {isEditMode && (
                    <SmartCheckboxAction
                      checked={isCheckboxSelected}
                      onToggle={() => {
                        const next = new Set(selectedColors);
                        if (next.has(name)) next.delete(name);
                        else next.add(name);
                        setSelectedColors(next);
                      }}
                      forceShow={isSelectionMode}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
