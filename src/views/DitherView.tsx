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
  ArrowLeft,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

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
    const selected = await open({ directory: true, multiple: false });
    if (selected && typeof selected === "string") setter(selected);
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
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#050505] relative p-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl -translate-y-[5vh] animate-in fade-in zoom-in-95 duration-700">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-2 px-3 py-2 mb-8 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workspace
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
              <ImageIcon className="w-7 h-7 text-primary opacity-60" />
            </div>
            <div>
              <h2 className="text-4xl font-semibold tracking-tighter text-white">
                Dither Studio
              </h2>
              <div className="flex items-center gap-2 mt-1 opacity-50">
                <Sparkles className="w-3 h-3 text-primary" />
                <p className="text-[10px] font-medium uppercase tracking-[0.3em]">
                  Batch Processing Engine
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="border-b border-white/10 p-6 bg-white/[0.02]">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Conversion Parameters
            </h3>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-8">
            {/* Directories Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Directory */}
              <div className="space-y-3">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  Input Directory
                </label>
                <div className="flex gap-2 pt-3">
                  <div className="flex-1 relative group">
                    <FolderInput className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={inputDir}
                      readOnly
                      className="w-full bg-[#181818] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs font-mono text-white outline-none focus:border-primary/40 transition-all"
                      placeholder="Select input folder..."
                    />
                  </div>
                  <button
                    onClick={() => selectFolder(setInputDir)}
                    className="px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all"
                  >
                    <FolderInput className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Output Directory */}
              <div className="space-y-3">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  Output Directory
                </label>
                <div className="flex gap-2 pt-3">
                  <div className="flex-1 relative group">
                    <FolderOutput className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={outputDir}
                      readOnly
                      className="w-full bg-[#181818] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs font-mono text-white outline-none focus:border-primary/40 transition-all"
                      placeholder="Select output folder..."
                    />
                  </div>
                  <button
                    onClick={() => selectFolder(setOutputDir)}
                    className="px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all"
                  >
                    <FolderOutput className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mode Selection & Action */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
              {/* Mode Selection */}
              <div className="space-y-3 w-full max-w-xs">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                  Dithering Mode
                </label>
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                  {[
                    { value: "565", label: "RGB 565" },
                    { value: "4444", label: "RGBA 4444" },
                    { value: "1555", label: "RGBA 1555" },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => !isProcessing && setDitherMode(mode.value)}
                      disabled={isProcessing}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                        ditherMode === mode.value
                          ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startProcessing}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {isProcessing ? "Processing..." : "Start Conversion"}
              </button>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="pt-6 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {progress}%
                  </span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  {statusMsg}
                </p>
              </div>
            )}

            {/* Result */}
            {!isProcessing && resultMsg && (
              <div className="pt-6 border-t border-white/5 animate-in fade-in">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    resultMsg.includes("Error")
                      ? "bg-red-500/5 border-red-500/20 text-red-400"
                      : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {!resultMsg.includes("Error") && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">{resultMsg}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
