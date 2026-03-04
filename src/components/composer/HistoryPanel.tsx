import { useState, useRef, useEffect } from "react";
import { useHistoryStore, HistoryEntry } from "@/store/useHistory";
import { Clock, Trash2, ChevronUp, ChevronDown, RotateCcw, RotateCw, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloatingToolbar, ToolbarDivider } from "@/components/ui/floating-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/typography";

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
    <div ref={dropdownRef} className="relative">
      {/* Horizontal toolbar pill */}
      <FloatingToolbar position="top-right" className="!top-6 !right-8">
        {/* Undo */}
        <Button
          variant="ghost-dark"
          size="icon-xs"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        {/* Redo */}
        <Button
          variant="ghost-dark"
          size="icon-xs"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <RotateCw className="w-4 h-4" />
        </Button>

        <ToolbarDivider />

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
            <span className="text-xs font-mono">
              {currentIndex + 1}/{entries.length}
            </span>
          )}
        </button>
      </FloatingToolbar>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-bg-elevated/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
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
              <SectionLabel>Max steps</SectionLabel>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost-dark"
                size="icon-xs"
                onClick={() => setMaxSteps(maxSteps - 1)}
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
              <Input
                type="number"
                value={maxSteps}
                onChange={(e) => setMaxSteps(parseInt(e.target.value) || 50)}
                min={1}
                max={100}
                className="w-12 h-7 text-center text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <Button
                variant="ghost-dark"
                size="icon-xs"
                onClick={() => setMaxSteps(maxSteps + 1)}
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* History List */}
          <ScrollArea className="h-[200px]">
            {entries.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No history yet. Start making changes!
              </div>
            ) : (
              [...entries].reverse().map((entry, reversedIdx) => {
                const originalIdx = entries.length - 1 - reversedIdx;
                return (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    index={originalIdx}
                    isActive={originalIdx === currentIndex}
                    onClick={() => jumpTo(originalIdx)}
                    formatTime={formatTime}
                  />
                );
              })
            )}
          </ScrollArea>

          {/* Footer */}
          {entries.length > 0 && (
            <div className="p-3 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={clear}
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear History
              </Button>
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
        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          isActive ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"
        }`}
      >
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{entry.description}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {formatTime(entry.timestamp)}
        </div>
      </div>
    </button>
  );
}
