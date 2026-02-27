import { useState, useRef, useEffect } from "react";
import { useHistoryStore, HistoryEntry } from "@/store/useHistory";
import { Clock, Trash2, ChevronUp, ChevronDown, RotateCcw, RotateCw, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function HistoryPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    entries,
    currentIndex,
    maxSteps,
    undo,
    redo,
    clear,
    setMaxSteps,
    canUndo,
    canRedo,
    jumpTo,
  } = useHistoryStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div ref={dropdownRef}>
      {/* Horizontal toolbar pill */}
      <div className="flex items-center p-1.5 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-0.5">
        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Shift+Z)"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-white/10 mx-0.5" />

        {/* History dropdown trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="History"
          className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all",
            isOpen
              ? "bg-primary/20 text-primary ring-1 ring-primary/30"
              : "text-muted-foreground hover:text-white hover:bg-white/10"
          )}
        >
          <Clock className="w-4 h-4" />
          {entries.length > 0 && (
            <span className="text-[10px] font-mono">
              {currentIndex + 1}/{entries.length}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium">History</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Shift+Z)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Max Steps Setting */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Settings2 className="w-3.5 h-3.5" />
              <span>Max steps:</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMaxSteps(maxSteps - 1)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <input
                type="number"
                value={maxSteps}
                onChange={(e) => setMaxSteps(parseInt(e.target.value) || 50)}
                min={1}
                max={100}
                className="w-12 h-6 text-center text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={() => setMaxSteps(maxSteps + 1)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* History List */}
          <ScrollArea className="h-[200px]">
            {entries.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No history yet. Start making changes!
              </div>
            ) : (
              entries.map((entry, idx) => (
                <HistoryItem
                  key={entry.id}
                  entry={entry}
                  index={idx}
                  isActive={idx === currentIndex}
                  onClick={() => jumpTo(idx)}
                  formatTime={formatTime}
                />
              ))
            )}
          </ScrollArea>

          {/* Footer */}
          {entries.length > 0 && (
            <div className="p-3 border-t border-white/10">
              <button
                onClick={clear}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryItem({
  entry,
  index,
  isActive,
  onClick,
  formatTime,
}: {
  entry: HistoryEntry;
  index: number;
  isActive: boolean;
  onClick: () => void;
  formatTime: (ts: number) => string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 flex items-start gap-3 text-left transition-colors ${
        isActive
          ? "bg-primary/10 border-l-2 border-primary"
          : "hover:bg-white/5 border-l-2 border-transparent"
      }`}
    >
      <div
        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
          isActive ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"
        }`}
      >
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{entry.description}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {formatTime(entry.timestamp)}
        </div>
      </div>
    </button>
  );
}
