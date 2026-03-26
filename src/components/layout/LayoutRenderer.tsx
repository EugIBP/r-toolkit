import { useCanvasStore } from "@/store/useCanvasStore";

export function LayoutRenderer() {
  const { activeScreenIdx, zoom, screenLayouts } = useCanvasStore();

  const layouts = screenLayouts[activeScreenIdx] || [];
  const visibleLayouts = layouts.filter((l) => l.visible);

  if (visibleLayouts.length === 0) return null;

  const parseGaps = (gapsStr: string, count: number) => {
    if (!gapsStr || !gapsStr.trim())
      return Array(Math.max(0, count - 1)).fill(0);
    const parts = gapsStr.split(",").map((s) => parseInt(s.trim()) || 0);
    if (parts.length === 1) return Array(Math.max(0, count - 1)).fill(parts[0]);
    return Array.from({ length: Math.max(0, count - 1) }, (_, i) =>
      parts[i] !== undefined ? parts[i] : parts[parts.length - 1] || 0,
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[10]">
      {visibleLayouts.map((layout) => {
        const hex = layout.color || "#3b82f6";
        let r = 0,
          g = 0,
          b = 0;
        if (hex.length === 7) {
          r = parseInt(hex.slice(1, 3), 16);
          g = parseInt(hex.slice(3, 5), 16);
          b = parseInt(hex.slice(5, 7), 16);
        }
        const bgRgba = `rgba(${r}, ${g}, ${b}, 0.1)`;
        const borderRgba = `rgba(${r}, ${g}, ${b}, 0.4)`;

        if (layout.type === "mesh" || layout.type === "islands") {
          const size = Math.max(4, layout.size);
          const offsetX = layout.offset || 0;
          const offsetY = layout.offsetY || 0;

          if (layout.type === "mesh") {
            // Бесконечная сетка
            return (
              <div
                key={layout.id}
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to right, ${borderRgba} 1px, transparent 1px), linear-gradient(to bottom, ${borderRgba} 1px, transparent 1px)`,
                  backgroundSize: `${size * zoom}px ${size * zoom}px`,
                  backgroundPosition: `${offsetX * zoom}px ${offsetY * zoom}px`,
                }}
              />
            );
          } else {
            // Islands - Ограниченная сетка
            const cols = layout.count || 1;
            const rows = layout.rows || 1;
            return (
              <div
                key={layout.id}
                className="absolute pointer-events-none border border-dashed"
                style={{
                  left: offsetX * zoom,
                  top: offsetY * zoom,
                  width: cols * size * zoom,
                  height: rows * size * zoom,
                  backgroundColor: bgRgba,
                  borderColor: borderRgba,
                  backgroundImage: `linear-gradient(to right, ${borderRgba} 1px, transparent 1px), linear-gradient(to bottom, ${borderRgba} 1px, transparent 1px)`,
                  backgroundSize: `${size * zoom}px ${size * zoom}px`,
                }}
              />
            );
          }
        }

        const gaps = parseGaps(layout.gaps, layout.count);
        const isCols = layout.type === "columns";
        let currentOffset = layout.offset;

        return (
          <div key={layout.id}>
            {Array.from({ length: layout.count }).map((_, i) => {
              const pos = currentOffset;
              if (i < layout.count - 1) {
                currentOffset += layout.size + gaps[i];
              }

              return (
                <div
                  key={i}
                  className="absolute border border-dashed"
                  style={{
                    backgroundColor: bgRgba,
                    borderColor: borderRgba,
                    ...(isCols
                      ? {
                          left: pos * zoom,
                          top: 0,
                          bottom: 0,
                          width: layout.size * zoom,
                        }
                      : {
                          top: pos * zoom,
                          left: 0,
                          right: 0,
                          height: layout.size * zoom,
                        }),
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
