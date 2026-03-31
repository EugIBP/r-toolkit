import { useGaugeStore, ArrowParams } from "@/store/useGaugeStore";
import { useProjectStore } from "@/store/useProjectStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Rocket,
  Target,
  Zap,
  Settings2,
  UploadCloud,
  Save,
  Layers,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { toast } from "sonner";

export function GaugeInspector() {
  const { arrows, selectedGaugeId, updateGauge, saveGauges, hasUnsavedGauges } =
    useGaugeStore();
  const { baseDir, addProjectAsset, saveProject } = useProjectStore();

  const activeArrow = arrows.find((a) => a.id === selectedGaugeId);
  const isSlider = activeArrow?.type === "slider";

  const handleSelectImage = async (
    targetField: "sourceImage" | "maskImage",
  ) => {
    if (!baseDir || !activeArrow) return;
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Images", extensions: ["png"] }],
      });
      if (selected && typeof selected === "string") {
        const destPath =
          `${baseDir}/.rtoolkit/sources/${activeArrow.id}_${targetField}.png`.replace(
            /\\/g,
            "/",
          );
        await invoke("copy_asset_file", {
          source: selected,
          destination: destPath,
        });

        updateGauge(activeArrow.id, { [targetField]: destPath });
        toast.success(
          `${targetField === "sourceImage" ? "Source image" : "Mask"} attached!`,
        );
      }
    } catch (e) {
      console.error(e);
      toast.error(
        "Failed to attach image. Ensure .rtoolkit/sources/ folder exists.",
      );
    }
  };

  const handleGenerateSelected = async () => {
    if (!baseDir || !activeArrow?.sourceImage) {
      toast.error("Attach a source image first!");
      return;
    }

    try {
      toast.loading("Generating binaries...", { id: "gen" });

      const commandName =
        activeArrow.type === "arc"
          ? "generate_widget_arc"
          : activeArrow.type === "slider"
            ? "generate_widget_slider"
            : "generate_widget_arrow";

      await invoke(commandName, {
        imagePath: activeArrow.sourceImage,
        maskPath: activeArrow.maskImage || "",
        outDir: baseDir,
        idName: activeArrow.id,
        cx: activeArrow.cx,
        cy: activeArrow.cy,
        r0: activeArrow.r0,
        r1: activeArrow.r1,
        d0: activeArrow.d0,
        d1: activeArrow.d1,
        minVal: activeArrow.minVal,
        maxVal: activeArrow.maxVal,
        frames: activeArrow.frames,
      });

      const idLower = activeArrow.id.toLowerCase();
      const imgBinPath = `assets\\img_${idLower}.bin`;

      addProjectAsset(imgBinPath);
      await saveProject();

      toast.success(`Generated successfully!`, { id: "gen" });
    } catch (e) {
      console.error(e);
      toast.error(`Generation failed: ${e}`, { id: "gen" });
    }
  };

  const handleGenerateAll = async () => {
    if (!baseDir) return;

    const validGauges = arrows.filter((a) => a.sourceImage);

    if (validGauges.length === 0) {
      toast.error("No items with attached source images found.");
      return;
    }

    toast.loading(`Generating ${validGauges.length} assets...`, {
      id: "gen-all",
    });
    let successCount = 0;

    try {
      for (const gauge of validGauges) {
        const commandName =
          gauge.type === "arc"
            ? "generate_widget_arc"
            : gauge.type === "slider"
              ? "generate_widget_slider"
              : "generate_widget_arrow";

        await invoke(commandName, {
          imagePath: gauge.sourceImage,
          maskPath: gauge.maskImage || "",
          outDir: baseDir,
          idName: gauge.id,
          cx: gauge.cx,
          cy: gauge.cy,
          r0: gauge.r0,
          r1: gauge.r1,
          d0: gauge.d0,
          d1: gauge.d1,
          minVal: gauge.minVal,
          maxVal: gauge.maxVal,
          frames: gauge.frames,
        });

        const idLower = gauge.id.toLowerCase();
        const imgBinPath = `assets\\img_${idLower}.bin`;
        addProjectAsset(imgBinPath);

        successCount++;
      }

      await saveProject();
      toast.success(`Successfully generated ${successCount} assets!`, {
        id: "gen-all",
      });
    } catch (e) {
      console.error(e);
      toast.error(`Generation failed: ${e}`, { id: "gen-all" });
    }
  };

  const handleInputChange = (field: keyof ArrowParams, value: string) => {
    if (!activeArrow) return;
    if (value === "" || value === "-") {
      updateGauge(activeArrow.id, { [field]: value as any });
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) updateGauge(activeArrow.id, { [field]: numValue });
  };

  const renderInput = (id: keyof ArrowParams, label: string, value: any) => (
    <div className="space-y-1.5 flex-1">
      <Label className="text-[10px] uppercase text-muted-foreground font-bold">
        {label}
      </Label>
      <Input
        type="text"
        value={value ?? ""}
        onFocus={(e) => e.target.select()}
        onChange={(e) => handleInputChange(id, e.target.value)}
        className="h-8 px-2 font-medium text-xs bg-background/50 border-border"
      />
    </div>
  );

  return (
    <aside className="w-90 flex flex-col h-full bg-muted/10 border-l border-border z-30 shrink-0">
      <div className="h-20 px-5 flex items-center border-b border-border bg-muted/30 shrink-0">
        <Settings2 className="w-4 h-4 text-primary mr-2 opacity-80" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/90">
          Gauge Properties
        </span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {activeArrow ? (
          <ScrollArea className="h-full w-full">
            <div className="p-5 space-y-6 pb-10">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-primary font-black tracking-widest">
                  Binding ID
                </Label>
                <Input
                  value={activeArrow.id ?? ""}
                  onChange={(e) => {
                    const formatted = e.target.value
                      .toUpperCase()
                      .replace(/\s+/g, "_");
                    updateGauge(activeArrow.id, { id: formatted });
                  }}
                  className="h-9 font-bold text-xs px-3 bg-background border-primary/20 text-primary focus-visible:ring-primary/30"
                />
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">
                  Source Image
                </Label>
                <div
                  onClick={() => handleSelectImage("sourceImage")}
                  className="relative group cursor-pointer aspect-video w-full rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden"
                >
                  {activeArrow.sourceImage ? (
                    <img
                      src={convertFileSrc(activeArrow.sourceImage)}
                      className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-50 transition-opacity"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 relative z-10 p-4 text-center">
                      <div className="p-2 bg-background/80 rounded-full shadow-sm border border-border group-hover:scale-110 transition-all">
                        <UploadCloud className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Select PNG Asset
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isSlider && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">
                    Mask Image (Optional)
                  </Label>
                  <div
                    onClick={() => handleSelectImage("maskImage")}
                    className="relative group cursor-pointer h-16 w-full rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/50 transition-all flex items-center justify-center overflow-hidden"
                  >
                    {activeArrow.maskImage ? (
                      <img
                        src={convertFileSrc(activeArrow.maskImage)}
                        className="w-full h-full object-contain p-1 opacity-80 group-hover:opacity-50 transition-opacity"
                      />
                    ) : (
                      <div className="flex items-center gap-2 relative z-10 text-center">
                        <UploadCloud className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          Select Mask PNG
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">
                    Center
                  </span>
                </div>
                <div className="flex gap-3">
                  {renderInput("cx", "X Pos", activeArrow.cx)}
                  {renderInput("cy", "Y Pos", activeArrow.cy)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">
                    {isSlider ? "Offsets" : "Radii"}
                  </span>
                </div>
                <div className="flex gap-3">
                  {renderInput(
                    "r0",
                    isSlider ? "Start" : "Inner",
                    activeArrow.r0,
                  )}
                  {renderInput(
                    "r1",
                    isSlider ? "End" : "Outer",
                    activeArrow.r1,
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {isSlider ? "Slant Angle" : "Angles"}
                </span>
                <div className="flex gap-3">
                  {renderInput(
                    "d0",
                    isSlider ? "Angle D0" : "Min D0",
                    activeArrow.d0,
                  )}
                  {!isSlider && renderInput("d1", "Max D1", activeArrow.d1)}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Logic
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {renderInput("minVal", "Min", activeArrow.minVal)}
                  {renderInput("maxVal", "Max", activeArrow.maxVal)}
                  {renderInput("frames", "Steps", activeArrow.frames)}
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-3.5 bg-background/50 border border-border p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold flex items-center gap-2">
                    <Play className="w-3 h-3 text-primary" /> Test Drive
                  </Label>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    VAL: {activeArrow.currentTestValue ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min={activeArrow.minVal || 0}
                  max={activeArrow.maxVal || 100}
                  value={activeArrow.currentTestValue ?? 0}
                  onChange={(e) =>
                    updateGauge(activeArrow.id, {
                      currentTestValue: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-1.5 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
                />
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground opacity-40">
            <Target className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-xs font-medium uppercase tracking-widest leading-relaxed">
              Select a gauge from the list or canvas to edit properties.
            </p>
          </div>
        )}
      </div>

      {/* ЕДИНЫЙ БЛОК ДЕЙСТВИЙ (ACTION CENTER) */}
      <div className="p-5 border-t border-border bg-muted/20 shrink-0 flex flex-col gap-3">
        {activeArrow && (
          <Button
            onClick={handleGenerateSelected}
            className="w-full gap-2 font-bold h-9 shadow-lg shadow-primary/10"
          >
            <Rocket className="w-4 h-4" /> Generate Selected
          </Button>
        )}

        <div className="flex gap-2 w-full">
          <Button
            onClick={handleGenerateAll}
            variant="outline"
            className="flex-1 gap-2 h-9 text-xs font-bold text-primary border-primary/20 hover:bg-primary/10"
          >
            <Layers className="w-3.5 h-3.5" /> Generate All
          </Button>

          <Button
            onClick={saveGauges}
            variant={hasUnsavedGauges ? "default" : "secondary"}
            className={`flex-1 gap-2 h-9 text-xs font-bold transition-all ${
              hasUnsavedGauges
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-900/20"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Save className="w-3.5 h-3.5" /> Save
            {hasUnsavedGauges && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
