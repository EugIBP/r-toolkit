import { useGaugeStore } from "@/store/useGaugeStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useCanvasInteraction } from "@/views/hooks/useCanvasInteraction";
import { resolveAssetPath } from "@/lib/utils";
import { AssetObject } from "@/types/project";
import { convertFileSrc } from "@tauri-apps/api/core";

export function GaugeCanvas() {
  const { arrows, selectedGaugeId, selectGauge, activeType } = useGaugeStore();
  const { projectPath, projectData } = useProjectStore();
  const { activeScreenIdx, zoom, iconNaturalSizes } = useCanvasStore();

  const { containerRef, offset, isMiddlePanning, handleMouseDown } =
    useCanvasInteraction(projectPath);

  const activeScreen = projectData?.Screens[activeScreenIdx];
  const bgAsset = projectData?.Objects.find(
    (o: AssetObject) => o.Name === activeScreen?.Background,
  );

  const bgImage =
    projectPath && bgAsset?.Path
      ? resolveAssetPath(projectPath, bgAsset.Path)
      : null;

  const displayWidth = projectData?.DisplayWidth || 1920;
  const displayHeight = projectData?.DisplayHeight || 720;

  const canvasWidth = displayWidth * zoom;
  const canvasHeight = displayHeight * zoom;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className={`w-full h-full relative overflow-hidden select-none outline-none ${
        isMiddlePanning ? "cursor-grabbing" : ""
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      }}
    >
      <div
        className="absolute shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-black border border-white/10"
        style={{
          left: `calc(50% + ${offset.x}px)`,
          top: `calc(50% + ${offset.y}px)`,
          transform: "translate(-50%, -50%)",
          width: canvasWidth,
          height: canvasHeight,
        }}
      >
        <div className="absolute -top-6 left-0 text-[10px] font-bold text-white/40 uppercase tracking-wider">
          Context: {activeScreen?.Name || "NONE"} ({displayWidth}x
          {displayHeight})
        </div>

        {bgImage && (
          <img
            src={bgImage}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none z-10"
          />
        )}

        {/* СЛОЙ ИЗОБРАЖЕНИЙ (СТРЕЛКИ, ШЕЙДЕРЫ И СЛАЙДЕРЫ) */}
        <div className="absolute inset-0 z-40 pointer-events-none">
          {arrows.map((arrow) => {
            if (!arrow.sourceImage) return null;

            const currentType = arrow.type || "arrow";
            if (currentType !== activeType) return null;

            const cx = Number(arrow.cx) || 0;
            const cy = Number(arrow.cy) || 0;
            const r0 = Number(arrow.r0) || 0;
            const r1 = Number(arrow.r1) || 0;
            const d0 = Number(arrow.d0) || 0;
            const d1 = Number(arrow.d1) || 0;
            const minVal = Number(arrow.minVal) || 0;
            const maxVal = Number(arrow.maxVal) || 100;
            const currentVal = Number(arrow.currentTestValue) || 0;

            const isSelected = selectedGaugeId === arrow.id;
            const opacity = isSelected ? 1 : 0.2;
            const finalCx = projectData ? cx : displayWidth / 2;
            const finalCy = projectData ? cy : displayHeight / 2;

            let fillPct = 0;
            if (maxVal !== minVal) {
              fillPct = (currentVal - minVal) / (maxVal - minVal);
            }

            // Рендер для СЛАЙДЕРОВ (Slider)
            if (currentType === "slider") {
              // ИСПРАВЛЕНО: Берем реальную высоту из стора, либо 50px по умолчанию (чтобы скос считался правильно)
              const h = arrow.sourceImage
                ? iconNaturalSizes[arrow.sourceImage]?.height || 50
                : 50;
              const d0_rad = ((90 - d0) * Math.PI) / 180;

              const x_slant =
                Math.abs(d0_rad) < 0.001 ? 0 : h / Math.tan(d0_rad);
              const offsetPx = r0 - fillPct * (r0 - r1);

              // ИСПРАВЛЕНО: Полигон режется строго по высоте h, чтобы не ломался угол!
              let clipPoly = "";
              if (r0 > r1) {
                // Заливка справа налево (Right to Left)
                clipPoly = `polygon(calc(${offsetPx}px + ${x_slant}px) 0px, 5000px 0px, 5000px ${h}px, ${offsetPx}px ${h}px)`;
              } else {
                // Заливка слева направо (Left to Right)
                clipPoly = `polygon(-5000px 0px, calc(${offsetPx}px + ${x_slant}px) 0px, ${offsetPx}px ${h}px, -5000px ${h}px)`;
              }

              const hasMask = arrow.maskImage && arrow.maskImage !== "";
              const maskUrl = hasMask
                ? `url(${convertFileSrc(arrow.maskImage!)})`
                : "none";

              return (
                <div
                  key={arrow.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: finalCx * zoom,
                    top: finalCy * zoom,
                    opacity,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <img
                      src={convertFileSrc(arrow.sourceImage)}
                      className="absolute object-contain pointer-events-none max-w-none"
                      style={{
                        left: 0,
                        top: 0,
                        clipPath: clipPoly,
                        ...(hasMask
                          ? {
                              WebkitMaskImage: maskUrl,
                              maskImage: maskUrl,
                              WebkitMaskSize: "100% 100%",
                              maskSize: "100% 100%",
                            }
                          : {}),
                      }}
                    />
                  </div>
                </div>
              );
            }

            // Рендер для ШЕЙДЕРОВ (Arc)
            if (currentType === "arc") {
              let angle = d0 + fillPct * (d1 - d0);
              if (Number.isNaN(angle)) angle = d0;

              let sweep = d1 - d0;
              let startAngleCSS = d0 + 180;
              let fillDeg = Math.abs(sweep * fillPct);

              let maskImage = "";
              if (sweep >= 0) {
                // По часовой
                maskImage = `conic-gradient(from ${startAngleCSS}deg at 50% 50%, black ${fillDeg}deg, transparent 0)`;
              } else {
                // Против часовой
                maskImage = `conic-gradient(from ${startAngleCSS - fillDeg}deg at 50% 50%, black ${fillDeg}deg, transparent 0)`;
              }

              return (
                <div
                  key={arrow.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: finalCx * zoom,
                    top: finalCy * zoom,
                    opacity,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                      width: 0,
                      height: 0,
                      position: "relative",
                    }}
                  >
                    <img
                      src={convertFileSrc(arrow.sourceImage)}
                      className="absolute object-contain pointer-events-none max-w-none"
                      style={{
                        width: r1 * 2,
                        height: r1 * 2,
                        transform: "translate(-50%, -50%)",
                        WebkitMaskImage: maskImage,
                        maskImage: maskImage,
                      }}
                    />
                  </div>
                </div>
              );
            }

            // Рендер для СТРЕЛОК (Arrow)
            let angle = d0 + fillPct * (d1 - d0);
            if (Number.isNaN(angle)) angle = d0;

            return (
              <div
                key={arrow.id}
                className="absolute pointer-events-none"
                style={{
                  left: finalCx * zoom,
                  top: finalCy * zoom,
                  opacity,
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoom}) rotate(${angle}deg)`,
                    transformOrigin: "center center",
                    width: 0,
                    height: 0,
                    position: "relative",
                  }}
                >
                  <img
                    src={convertFileSrc(arrow.sourceImage)}
                    className="absolute object-contain pointer-events-none max-w-none"
                    style={{
                      left: 0,
                      top: r0,
                      height: Math.max(0, r1 - r0),
                      transform: "translateX(-50%) rotate(180deg)",
                      transformOrigin: "center center",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* СЛОЙ ПРИЦЕЛА И РАЗМЕТКИ */}
        <svg
          viewBox={`0 0 ${displayWidth} ${displayHeight}`}
          className="w-full h-full absolute inset-0 z-50 pointer-events-none"
        >
          {arrows.map((arrow) => {
            const currentType = arrow.type || "arrow";
            if (currentType !== activeType) return null;

            const cx = Number(arrow.cx) || 0;
            const cy = Number(arrow.cy) || 0;
            const r0 = Number(arrow.r0) || 0;
            const r1 = Number(arrow.r1) || 0;
            const d0 = Number(arrow.d0) || 0;
            const d1 = Number(arrow.d1) || 0;

            const isSelected = selectedGaugeId === arrow.id;
            const opacity = selectedGaugeId !== null && !isSelected ? 0.2 : 1;
            const finalCx = projectData ? cx : displayWidth / 2;
            const finalCy = projectData ? cy : displayHeight / 2;

            // Разметка для СЛАЙДЕРА (Slider)
            if (currentType === "slider") {
              const minR = Math.min(r0, r1);
              const maxR = Math.max(r0, r1);

              // ИСПРАВЛЕНО: Линии UI теперь рисуются с правильным углом скоса
              const h = arrow.sourceImage
                ? iconNaturalSizes[arrow.sourceImage]?.height || 50
                : 50;
              const d0_rad = ((90 - d0) * Math.PI) / 180;
              const x_slant =
                Math.abs(d0_rad) < 0.001 ? 0 : h / Math.tan(d0_rad);

              return (
                <g
                  key={arrow.id}
                  style={{ opacity }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectGauge(arrow.id);
                  }}
                  className={
                    isSelected
                      ? "pointer-events-auto"
                      : "pointer-events-auto cursor-pointer hover:opacity-100"
                  }
                >
                  {/* Прозрачный хитбокс для клика */}
                  <rect
                    x={finalCx + minR - 20}
                    y={finalCy - 20}
                    width={Math.max(1, maxR - minR) + Math.abs(x_slant) + 40}
                    height={h + 40}
                    fill="transparent"
                  />

                  {/* Рамка габаритов с учетом скоса */}
                  <line
                    x1={finalCx + minR + x_slant}
                    y1={finalCy}
                    x2={finalCx + maxR + x_slant}
                    y2={finalCy}
                    stroke="rgba(59,130,246,0.3)"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={finalCx + minR}
                    y1={finalCy + h}
                    x2={finalCx + maxR}
                    y2={finalCy + h}
                    stroke="rgba(59,130,246,0.3)"
                    strokeDasharray="4 4"
                  />

                  {/* Линия START со скосом */}
                  <line
                    x1={finalCx + r0 + x_slant}
                    y1={finalCy}
                    x2={finalCx + r0}
                    y2={finalCy + h}
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <text
                    x={finalCx + r0 + x_slant / 2}
                    y={finalCy - 10}
                    fill="#3b82f6"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    START {r0}
                  </text>

                  {/* Линия END со скосом */}
                  <line
                    x1={finalCx + r1 + x_slant}
                    y1={finalCy}
                    x2={finalCx + r1}
                    y2={finalCy + h}
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <text
                    x={finalCx + r1 + x_slant / 2}
                    y={finalCy - 10}
                    fill="#ef4444"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    END {r1}
                  </text>

                  {/* Точка привязки */}
                  {isSelected && (
                    <circle
                      cx={finalCx}
                      cy={finalCy}
                      r={4}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth={1}
                    />
                  )}
                </g>
              );
            }

            // Разметка для СТРЕЛОК и ШЕЙДЕРОВ (Arc & Arrow)
            return (
              <g
                key={arrow.id}
                style={{ opacity }}
                className={
                  isSelected
                    ? "pointer-events-auto"
                    : "pointer-events-auto cursor-pointer hover:opacity-100"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  selectGauge(arrow.id);
                }}
              >
                <circle cx={finalCx} cy={finalCy} r={r1} fill="transparent" />
                <circle
                  cx={finalCx}
                  cy={finalCy}
                  r={r1}
                  fill="rgba(59,130,246,0.1)"
                  stroke="rgba(59,130,246,0.4)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <circle
                  cx={finalCx}
                  cy={finalCy}
                  r={r0}
                  fill="none"
                  stroke="rgba(59,130,246,0.4)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />

                <g transform={`rotate(${d0}, ${finalCx}, ${finalCy})`}>
                  <line
                    x1={finalCx}
                    y1={finalCy + r0}
                    x2={finalCx}
                    y2={finalCy + r1 + 20}
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <text
                    x={finalCx}
                    y={finalCy + r1 + 35}
                    fill="#3b82f6"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    MIN {d0}°
                  </text>
                </g>

                <g transform={`rotate(${d1}, ${finalCx}, ${finalCy})`}>
                  <line
                    x1={finalCx}
                    y1={finalCy + r0}
                    x2={finalCx}
                    y2={finalCy + r1 + 20}
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <text
                    x={finalCx}
                    y={finalCy + r1 + 35}
                    fill="#ef4444"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    MAX {d1}°
                  </text>
                </g>

                {isSelected && (
                  <g>
                    <circle
                      cx={finalCx}
                      cy={finalCy}
                      r={4}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth={1}
                    />
                    <line
                      x1={finalCx - 15}
                      y1={finalCy}
                      x2={finalCx + 15}
                      y2={finalCy}
                      stroke="#ef4444"
                      strokeWidth={1.5}
                    />
                    <line
                      x1={finalCx}
                      y1={finalCy - 15}
                      x2={finalCx}
                      y2={finalCy + 15}
                      stroke="#ef4444"
                      strokeWidth={1.5}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 border border-white/20 pointer-events-none z-[100]" />
      </div>
    </div>
  );
}
