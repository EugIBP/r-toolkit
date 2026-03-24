import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "dark"
  icon?: React.ReactNode
}

function Input({ className, type, variant, icon, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          variant === "dark"
            ? icon
              ? "h-9 w-full min-w-0 rounded-xl border border-white/5 bg-white/[0.02] pl-9 pr-3 py-1 text-xs text-white shadow-xs transition-all outline-none focus-visible:border-primary/50 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-white/20"
              : "h-9 w-full min-w-0 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1 text-xs text-white shadow-xs transition-all outline-none focus-visible:border-primary/50 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-white/20"
            : "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input }
