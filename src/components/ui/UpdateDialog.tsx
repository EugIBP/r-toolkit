import { useState, ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  UpdateInfo,
  downloadAndInstall,
  scheduleUpdate,
  clearScheduledUpdate,
} from "@/lib/updater";
import { X, Download } from "lucide-react";
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

// --- ЛЕГКОВЕСНЫЙ ПАРСЕР MARKDOWN ---
function renderInlineMarkdown(text: string): ReactNode[] {
  // Разбиваем текст, вылавливая **жирный текст** и `моноширинный код`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-white/10 px-1.5 py-0.5 rounded-md text-[11px] font-mono text-emerald-400"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderMarkdownLine(line: string, index: number) {
  const trimmed = line.trim();

  // Пустые строки превращаем в отступы
  if (!trimmed) return <div key={index} className="h-2" />;

  // Обработка заголовков (## Заголовок)
  const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const content = headingMatch[2];
    const isMain = level <= 2;
    return (
      <div
        key={index}
        className={`font-semibold text-white ${isMain ? "text-base mt-4 mb-2" : "text-sm mt-3 mb-1"}`}
      >
        {renderInlineMarkdown(content)}
      </div>
    );
  }

  // Обработка списков (- пункт или * пункт)
  const isBullet = /^[-*•]\s+/.test(trimmed);
  const cleanLine = trimmed.replace(/^[-*•]\s+/, "");

  return (
    <div
      key={index}
      className={`text-sm text-white/80 leading-relaxed flex gap-2.5 ${isBullet ? "ml-2 mt-1" : "mt-1"}`}
    >
      {isBullet && (
        <span className="text-white/30 select-none text-[10px] mt-1">●</span>
      )}
      <div className="flex-1">{renderInlineMarkdown(cleanLine)}</div>
    </div>
  );
}
// -----------------------------------

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
          <h2 className="text-sm font-semibold text-white">Update Available</h2>
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
            <ScrollArea className="h-[180px] bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="pr-4 pb-2">
                {/* Рендерим Markdown построчно */}
                {updateInfo.body
                  .split("\n")
                  .map((line, index) => renderMarkdownLine(line, index))}
              </div>
            </ScrollArea>
          )}

          {isDownloading && (
            <div className="space-y-2 pt-2">
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
