import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/typography";

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
      <Button
        variant="ghost-dark"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Keyboard className="w-4 h-4" />
        Hotkeys
      </Button>

      {/* Panel - expands upward */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-64 bg-bg-elevated/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <SectionLabel>Keyboard Shortcuts</SectionLabel>
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
