import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface ActionIconProps {
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  tooltip: string;
  className?: string;
  disabled?: boolean;
}

export function ActionIcon({
  icon: Icon,
  onClick,
  tooltip,
  className = "",
  disabled = false,
}: ActionIconProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className={`h-7 w-7 rounded-lg ${className}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="text-[10px] font-bold uppercase tracking-wider"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
