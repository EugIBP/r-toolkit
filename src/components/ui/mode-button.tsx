import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modeButtonVariants = cva(
  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:text-white hover:bg-white/5",
        active: "bg-primary/20 text-primary ring-1 ring-primary/30 shadow-sm",
        emerald: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 shadow-sm",
        amber: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 shadow-sm",
        blue: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ModeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modeButtonVariants> {
  icon?: React.ReactNode
  active?: boolean
}

const ModeButton = React.forwardRef<HTMLButtonElement, ModeButtonProps>(
  ({ className, variant, icon, active, ...props }, ref) => {
    const computedVariant = active ? "active" : (variant ?? "default")

    return (
      <button
        ref={ref}
        className={cn(modeButtonVariants({ variant: computedVariant }), className)}
        {...props}
      >
        {icon}
        {props.children}
      </button>
    )
  }
)
ModeButton.displayName = "ModeButton"

export { ModeButton, modeButtonVariants }
