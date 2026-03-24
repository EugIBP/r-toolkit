import { useState } from "react";
import { useHistoryStore } from "@/store/useHistory";
import { History, Undo2, Redo2, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function HistoryPanel() {
  const {
    entries,
    currentIndex,
    maxSteps,
    setMaxSteps,
    undo,
    redo,
    canUndo,
    canRedo,
    push,
    clear,
    jumpTo,
  } = useHistoryStore();

  const [isOpen, setIsOpen] = useState(false);
  const [customAction, setCustomAction] = useState("");

  const handlePushCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customAction.trim()) {
      push(customAction.trim());
      setCustomAction("");
    }
  };

  const handleMaxStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setMaxSteps(val);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Тулбар с кнопками истории */}
      <div className="flex items-center p-1.5 bg-background/90 backdrop-blur-xl border border-border rounded-2xl shadow-xl gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-xl"
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle History"
        >
          <History
            className={`w-4 h-4 ${isOpen ? "text-primary" : "text-muted-foreground"}`}
          />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-xl text-muted-foreground"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-xl text-muted-foreground"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Выпадающая панель истории */}
      {isOpen && (
        <div className="bg-background/90 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-xl w-[320px] animate-in slide-in-from-top-2 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              History
            </h3>

            <div className="flex items-center gap-2">
              {/* ВОЗВРАЩЕНО: Поле для изменения количества шагов (maxSteps) */}
              <div
                className="flex items-center gap-1 bg-muted/50 border border-border rounded-md px-2 h-6 transition-colors focus-within:border-primary/50"
                title="Max History Steps"
              >
                <Settings2 className="w-3 h-3 text-muted-foreground" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxSteps}
                  onChange={handleMaxStepsChange}
                  className="w-8 bg-transparent text-[10px] text-foreground text-center outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Input
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              onKeyDown={handlePushCustom}
              placeholder="Type manual action and press Enter..."
              className="h-8 text-xs bg-muted/50 border-border"
            />
          </div>

          <ScrollArea className="h-[250px] pr-3 -mr-3">
            {!entries || entries.length === 0 ? (
              <div className="py-10 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-50">
                No history
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {/* Отрисовываем историю (самые новые сверху) */}
                {[...entries].reverse().map((entry, idx) => {
                  // Вычисляем реальный индекс элемента в оригинальном массиве (так как мы его развернули)
                  const realIndex = entries.length - 1 - idx;
                  const isActive = realIndex === currentIndex;
                  const isFuture = realIndex > currentIndex;

                  return (
                    <div
                      key={entry.id || idx}
                      onClick={() => jumpTo && jumpTo(realIndex)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-colors cursor-pointer truncate ${
                        isActive
                          ? "bg-primary/20 border-primary/30 text-primary font-medium" // Текущее состояние
                          : isFuture
                            ? "bg-muted/10 border-transparent text-muted-foreground/50 line-through" // Отмененные действия (Redo)
                            : "bg-muted/30 border-border/50 text-foreground/80 hover:bg-muted" // Прошлые действия
                      }`}
                      title={entry.description}
                    >
                      {entry.description || "Unknown action"}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
