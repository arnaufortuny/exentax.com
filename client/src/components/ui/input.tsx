import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[44px] md:min-h-[36px] w-full rounded-full border border-border bg-background dark:bg-card dark:border-border px-4 py-3 md:py-2 text-base text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-[#00C48C] focus-visible:ring-2 focus-visible:ring-[#00C48C]/20 dark:focus-visible:border-[#00C48C] dark:focus-visible:ring-[#00C48C]/25 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 md:text-sm touch-manipulation rounded-lg",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
