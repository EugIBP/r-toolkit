import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-bg-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

// Card Header
interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-b border-white/10 p-6 bg-white/[0.02]",
          className
        )}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

// Card Content
interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-6", className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = "CardContent"

// Card Footer
interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-t border-white/10 p-6 bg-white/[0.02]",
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardContent, CardFooter }
