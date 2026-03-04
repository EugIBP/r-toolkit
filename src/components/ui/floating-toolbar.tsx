import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingToolbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-right"
}

const FloatingToolbar = React.forwardRef<HTMLDivElement, FloatingToolbarProps>(
  ({ className, children, position = "top-left", ...props }, ref) => {
    const positionClasses = {
      "top-left": "top-6 left-8",
      "top-center": "top-6 left-1/2 -translate-x-1/2",
      "top-right": "top-6 right-8",
      "bottom-left": "bottom-6 left-8",
      "bottom-right": "bottom-6 right-8",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 flex items-center p-1.5 bg-bg-elevated/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl gap-2",
          positionClasses[position],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FloatingToolbar.displayName = "FloatingToolbar"

// Toolbar Divider component
interface ToolbarDividerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ToolbarDivider = React.forwardRef<HTMLDivElement, ToolbarDividerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-px h-6 bg-white/10 mx-0.5", className)}
        {...props}
      />
    )
  }
)
ToolbarDivider.displayName = "ToolbarDivider"

export { FloatingToolbar, ToolbarDivider }
