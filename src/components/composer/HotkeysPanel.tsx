import { useState } from "react";
import { Keyboard } from "lucide-react";

export function HotkeysPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const hotkeys = [
    { keys: ["Ctrl", "Z"], action: "Undo" },
    { keys: ["Ctrl", "Y"], action: "Redo" },
    { keys: ["MMB"], action: "Pan" },
    { keys: ["Scroll"], action: "Zoom" },
    { keys: ["Ctrl", "K"], action: "Find assets ..." },
    { keys: ["Ctrl", "S"], action: "Save Workspace" },
    { keys: ["Ctrl", "Shift", "S"], action: "Save JSON" },
  ];

  return (
    <div className="absolute bottom-6 right-8 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-muted-foreground hover:text-white transition-colors"
      >
        <Keyboard className="w-4 h-4" />
        <span className="text-xs font-medium">Hotkeys</span>
      </button>

      {/* Panel - expands upward */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-64 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <span className="text-xs font-semibold text-white">
              Keyboard Shortcuts
            </span>
          </div>
          <div className="p-2 space-y-1">
            {hotkeys.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5"
              >
                <span className="text-xs text-muted-foreground">
                  {item.action}
                </span>
                <div className="flex items-center gap-1">
                  {item.keys.map((key, keyIdx) => (
                    <span key={keyIdx}>
                      {keyIdx > 0 && (
                        <span className="text-xs text-muted-foreground mx-0.5">
                          +
                        </span>
                      )}
                      <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono text-white">
                        {key}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
