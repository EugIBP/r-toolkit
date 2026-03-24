import { Checkbox } from "@/components/ui/checkbox";

interface SmartCheckboxActionProps {
  checked: boolean;
  onToggle: () => void;
  forceShow?: boolean;
  color?: "primary" | "amber";
}

export function SmartCheckboxAction({
  checked,
  onToggle,
  forceShow = false,
  color = "primary",
}: SmartCheckboxActionProps) {
  const show = forceShow || checked;

  // Цвета разделителя (линии)
  const dividerColor = show
    ? color === "amber"
      ? "bg-amber-500/30"
      : "bg-primary/30"
    : "bg-transparent group-hover/row:bg-border/50";

  const hoverBg =
    color === "amber" ? "hover:bg-amber-500/10" : "hover:bg-foreground/10";

  // Стили для самого чекбокса (для amber нужны кастомные)
  const checkboxClass =
    color === "amber"
      ? "border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:text-amber-950"
      : "";

  return (
    <>
      <div
        className={`w-px shrink-0 transition-colors duration-200 ${dividerColor}`}
      />
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer overflow-hidden ${
          show
            ? `w-11 opacity-100 ${hoverBg}`
            : `w-0 opacity-0 group-hover/row:w-11 group-hover/row:opacity-100 group-hover/row:${hoverBg}`
        }`}
      >
        {/* Внутренний контейнер фиксированной ширины не дает чекбоксу сжиматься во время анимации */}
        <div className="w-11 flex items-center justify-center shrink-0">
          <Checkbox
            checked={checked}
            className={`pointer-events-none shadow-sm ${checkboxClass}`}
          />
        </div>
      </div>
    </>
  );
}
