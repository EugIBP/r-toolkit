import { useState, useCallback } from "react";

export function useSelection<T>() {
  const [selected, setSelected] = useState<Set<T>>(new Set());

  const toggle = useCallback((item: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    (items: T[]) => setSelected(new Set(items)),
    [],
  );
  const clear = useCallback(() => setSelected(new Set()), []);

  return {
    selected,
    toggle,
    selectAll,
    clear,
    count: selected.size,
    hasSelection: selected.size > 0,
  };
}
