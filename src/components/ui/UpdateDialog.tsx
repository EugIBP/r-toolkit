import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { UpdateInfo, downloadAndInstall, scheduleUpdate, clearScheduledUpdate } from "@/lib/updater";
import { X, Download, Sparkles, Bug, Zap, Star, ArrowDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UpdateDialogProps {
  updateInfo: UpdateInfo;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function UpdateDialog({ updateInfo }: UpdateDialogProps) {
  const { setPendingUpdate } = useAppStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleInstallNow = async () => {
    setIsDownloading(true);
    try {
      await downloadAndInstall(updateInfo.update, setProgress);
    } catch (error) {
      console.error("Update failed:", error);
      setIsDownloading(false);
    }
  };

  const handleInstallLater = async () => {
    await scheduleUpdate(updateInfo.update);
    setPendingUpdate(null);
  };

  const handleSkip = async () => {
    clearScheduledUpdate();
    setPendingUpdate(null);
  };

  const handleClose = () => {
    if (!isDownloading) {
      setPendingUpdate(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 w-[480px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <Download className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">
            Update Available
          </h2>
          <button
            onClick={handleClose}
            disabled={isDownloading}
            className="ml-auto text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="mb-1">
              <span className="text-lg font-bold text-white">
                v{updateInfo.version}
              </span>
            </div>
            {updateInfo.date && (
              <span className="text-xs text-white/40">
                {formatDate(updateInfo.date)}
              </span>
            )}
          </div>

          {updateInfo.body && (
            <ScrollArea className="h-[160px]">
              <div className="space-y-2 pr-4">
                {updateInfo.body.split("\n").filter(Boolean).map((line, index) => {
                  const icons = [Sparkles, Zap, Bug, Star, ArrowDown];
                  const Icon = icons[index % icons.length];
                  const text = line.replace(/^[-•]\s*/, "").trim();
                  return (
                    <div key={index} className="flex items-start gap-3 text-sm text-white/80">
                      <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {isDownloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Downloading...</span>
                <span className="text-white/70">{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            onClick={handleSkip}
            disabled={isDownloading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Skip Update
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallLater}
              disabled={isDownloading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
            >
              Update on Exit
            </button>
            <button
              onClick={handleInstallNow}
              disabled={isDownloading}
              className="px-5 py-2.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Update Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
