import * as React from "react"
import { cn } from "@/lib/utils"
import { SectionLabel } from "@/components/ui/typography"

export interface PanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  side?: "left" | "right"
  width?: string
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, children, side = "right", width = "w-80", ...props }, ref) => {
    const sideClasses = side === "left" ? "border-r" : "border-l"

    return (
      <div
        ref={ref}
        className={cn(
          "h-full flex flex-col bg-bg-panel z-30 overflow-hidden",
          sideClasses,
          "border-white/10",
          width,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Panel.displayName = "Panel"

// Panel Header
interface PanelHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  icon?: React.ReactNode
}

const PanelHeader = React.forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ className, title, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "h-[80px] border-b border-white/10 flex items-center px-5 bg-white/[0.02] shrink-0",
          className
        )}
        {...props}
      >
        {icon && <span className="w-4 h-4 text-primary mr-2 opacity-80">{icon}</span>}
        <SectionLabel className="text-xs font-bold uppercase tracking-widest text-white/90">
          {title}
        </SectionLabel>
      </div>
    )
  }
)
PanelHeader.displayName = "PanelHeader"

// Panel Content
interface PanelContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const PanelContent = React.forwardRef<HTMLDivElement, PanelContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 overflow-auto p-3", className)}
        {...props}
      />
    )
  }
)
PanelContent.displayName = "PanelContent"

// Panel Footer
interface PanelFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const PanelFooter = React.forwardRef<HTMLDivElement, PanelFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-t border-white/10 p-3 bg-white/[0.02] shrink-0",
          className
        )}
        {...props}
      />
    )
  }
)
PanelFooter.displayName = "PanelFooter"

export { Panel, PanelHeader, PanelContent, PanelFooter }
