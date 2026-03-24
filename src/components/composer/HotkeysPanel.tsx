import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="absolute bottom-4 left-6 z-10 flex flex-col items-start gap-2">
      {/* Toggle button */}
      <Button variant="ghost-dark" onClick={() => setIsOpen(!isOpen)}>
        <Keyboard className="w-4 h-4" />
        Hotkeys
      </Button>

      {/* Panel - expands upward */}
      {isOpen && (
        <div className="bg-background/90 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-xl w-[320px] animate-in slide-in-from-bottom-2 fade-in">
          {/* Заменили SectionLabel на стандартный h3 */}
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Keyboard Shortcuts
          </h3>
          <div className="space-y-3">
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
