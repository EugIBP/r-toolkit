import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface BackButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  icon?: React.ReactNode
}

const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className, label = "Back", icon, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors rounded-lg",
          className
        )}
        {...props}
      >
        {icon ?? <ArrowLeft className="w-3.5 h-3.5" />}
        {label}
      </Button>
    )
  }
)
BackButton.displayName = "BackButton"

export { BackButton }
