import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  ImageIcon,
  FolderInput,
  FolderOutput,
  Play,
  Loader2,
  Sparkles,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DitherView() {
  const { setCurrentView } = useAppStore();
  const [inputDir, setInputDir] = useState("");
  const [outputDir, setOutputDir] = useState("");
  const [ditherMode, setDitherMode] = useState("565");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Waiting to start...");
  const [resultMsg, setResultMsg] = useState("");

  useEffect(() => {
    const unlistenProgress = listen<number>("dither-progress", (event) =>
      setProgress(event.payload),
    );
    const unlistenStatus = listen<string>("dither-status", (event) =>
      setStatusMsg(event.payload),
    );
    return () => {
      unlistenProgress.then((f) => f());
      unlistenStatus.then((f) => f());
    };
  }, []);

  const selectFolder = async (setter: (path: string) => void) => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected && typeof selected === "string") setter(selected);
    } catch (e) {
      console.error(e);
    }
  };

  const startProcessing = async () => {
    if (!inputDir || !outputDir) {
      setResultMsg("Error: Select directories first!");
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    setResultMsg("");
    setStatusMsg("Starting process...");

    try {
      const finalResult = await invoke<string>("process_images", {
        inDir: inputDir,
        outDir: outputDir,
        mode: ditherMode,
      });
      setResultMsg(finalResult);
    } catch (error) {
      setResultMsg(`Error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background relative p-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl -translate-y-[5vh] animate-in fade-in zoom-in-95 duration-700">
        {/* Header */}
        <div className="mb-12">
          <BackButton
            label="Back to Dashboard"
            onClick={() => {
              sessionStorage.removeItem("currentView");
              sessionStorage.removeItem("projectPath");
              sessionStorage.removeItem("workspaceTab");
              setCurrentView("dashboard");
            }}
          />
          <div className="flex items-center gap-4 mt-8">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center shadow-xl backdrop-blur-md">
              <ImageIcon className="w-7 h-7 text-primary opacity-80" />
            </div>
            <div>
              <h2 className="text-4xl font-semibold tracking-tighter text-foreground">
                Dither Studio
              </h2>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-medium uppercase tracking-[0.3em]">
                  Batch Processing Engine
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="w-full bg-background border-border shadow-lg">
          {/* Card Header */}
          <CardHeader className="pb-4 border-b border-border bg-muted/10">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary opacity-80" />{" "}
              Conversion Parameters
            </h3>
          </CardHeader>

          {/* Card Content */}
          <CardContent className="space-y-8 pt-6">
            {/* Directories Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Directory */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider block mb-1">
                  Input Directory
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FolderInput className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={inputDir}
                      readOnly
                      className="pl-9 bg-muted/50 border-border text-xs font-mono text-muted-foreground"
                      placeholder="Select input folder..."
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => selectFolder(setInputDir)}
                    className="shrink-0"
                  >
                    <FolderInput className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Output Directory */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider block mb-1">
                  Output Directory
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FolderOutput className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={outputDir}
                      readOnly
                      className="pl-9 bg-muted/50 border-border text-xs font-mono text-muted-foreground"
                      placeholder="Select output folder..."
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => selectFolder(setOutputDir)}
                    className="shrink-0"
                  >
                    <FolderOutput className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mode Selection & Action */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
              {/* Mode Selection */}
              <div className="space-y-2 w-full max-w-xs">
                <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider block mb-1">
                  Dithering Mode
                </label>
                <div className="flex bg-muted/30 border border-border rounded-lg p-1">
                  {[
                    { value: "565", label: "RGB 565" },
                    { value: "4444", label: "RGBA 4444" },
                    { value: "1555", label: "RGBA 1555" },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => !isProcessing && setDitherMode(mode.value)}
                      disabled={isProcessing}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        ditherMode === mode.value
                          ? "bg-primary/20 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <Button
                size="lg"
                onClick={startProcessing}
                disabled={isProcessing}
                className="px-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                {isProcessing ? "Processing..." : "Start Conversion"}
              </Button>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="pt-6 border-t border-border space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                    Progress
                  </label>
                  <span className="text-xs font-mono font-bold text-primary">
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-mono animate-pulse">
                  {statusMsg}
                </p>
              </div>
            )}

            {/* Result */}
            {!isProcessing && resultMsg && (
              <div className="pt-6 border-t border-border animate-in fade-in">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    resultMsg.includes("Error")
                      ? "bg-destructive/10 border-destructive/20 text-destructive"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  }`}
                >
                  {!resultMsg.includes("Error") && (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  )}
                  <span className="text-xs font-medium">{resultMsg}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
