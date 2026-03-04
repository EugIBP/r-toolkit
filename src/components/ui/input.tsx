import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "border-input bg-background text-sm h-9 py-1 px-3 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        dark:
          "bg-bg-surface border-white/10 text-xs font-mono text-white h-9 py-2.5 px-3 placeholder:text-white/40 focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/40",
      },
      size: {
        default: "h-9 text-base",
        sm: "h-8 text-sm",
        lg: "h-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, icon, iconPosition = "left", ...props }, ref) => {
    const hasIcon = !!icon

    return (
      <div className="relative w-full">
        {hasIcon && (
          <span
            className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground",
              iconPosition === "left" ? "left-3" : "right-3"
            )}
          >
            {icon}
          </span>
        )}
        <input
          type={props.type ?? "text"}
          ref={ref}
          data-slot="input"
          className={cn(
            inputVariants({ variant, size }),
            hasIcon && iconPosition === "left" && "pl-9",
            hasIcon && iconPosition === "right" && "pr-9",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
