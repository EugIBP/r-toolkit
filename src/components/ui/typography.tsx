import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Typography variants
const typographyVariants = cva(
  "",
  {
    variants: {
      variant: {
        // Page titles
        pageTitle: "text-2xl text-4xl font-semibold tracking-tight text-white",
        
        // Section labels
        sectionLabel: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
        
        // Body text (main size)
        body: "text-xs text-muted-foreground",
        
        // Item name
        itemName: "text-xs font-semibold text-white truncate",
        
        // Mono text (paths, code)
        mono: "text-xs font-mono text-white/80",
        
        // Empty state
        emptyState: "py-10 text-center opacity-30 text-xs uppercase tracking-widest font-medium",
        
        // Badge
        badge: "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
      },
    },
    defaultVariants: {
      variant: "body",
    },
  }
)

// Badge color variants
const badgeVariants = cva(
  "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
  {
    variants: {
      color: {
        emerald: "bg-emerald-500/20 text-emerald-400",
        amber: "bg-amber-500/20 text-amber-400",
        blue: "bg-blue-500/20 text-blue-400",
        red: "bg-red-500/20 text-red-400",
      },
    },
    defaultVariants: {
      color: "emerald",
    },
  }
)

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as = "span", ...props }, ref) => {
    const Component = as
    return (
      <Component
        className={cn(typographyVariants({ variant }), className)}
        ref={ref as React.Ref<any>}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  ({ className, color, children, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ color }), className)}
        ref={ref as React.Ref<any>}
        {...props}
      >
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"

// Pre-configured components for convenience
const PageTitle = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} variant="pageTitle" as="h1" {...props} />
)
PageTitle.displayName = "PageTitle"

const SectionLabel = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} variant="sectionLabel" as="span" {...props} />
)
SectionLabel.displayName = "SectionLabel"

const BodyText = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} variant="body" as="span" {...props} />
)
BodyText.displayName = "BodyText"

const ItemName = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} variant="itemName" as="span" {...props} />
)
ItemName.displayName = "ItemName"

const MonoText = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} variant="mono" as="span" {...props} />
)
MonoText.displayName = "MonoText"

const EmptyState = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => <Typography ref={ref} variant="emptyState" as="div" {...props} />
)
EmptyState.displayName = "EmptyState"

export {
  Typography,
  typographyVariants,
  Badge,
  badgeVariants,
  PageTitle,
  SectionLabel,
  BodyText,
  ItemName,
  MonoText,
  EmptyState,
}
