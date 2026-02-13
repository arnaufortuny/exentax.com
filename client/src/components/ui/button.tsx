import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#00C48C] text-white hover:bg-[#00855F] shadow-md hover:shadow-lg border-0 font-semibold [&]:text-white",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0",
        outline:
          "border-2 border-[#00C48C] bg-transparent text-[#00C48C] hover:bg-[#00C48C] hover:text-white transition-all duration-200",
        secondary:
          "bg-[#B4ED50] text-[#0A1F17] hover:bg-[#A0D444] font-semibold border-0 transition-all duration-200",
        ghost: "hover:bg-[#00C48C]/10 hover:text-[#00C48C] text-muted-foreground border-0 transition-all duration-200",
        link: "text-[#00C48C] underline-offset-4 hover:underline border-0",
        cta: "bg-[#00C48C] text-white hover:bg-[#00E57A] shadow-lg border-0 font-bold tracking-wide [&]:text-white",
        neon: "bg-[#00E57A] text-[#0A1F17] hover:bg-[#00C48C] font-bold shadow-md border-0",
        premium: "bg-[#00C48C] text-white shadow-lg border-0 hover:bg-[#00855F] [&]:text-white",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4",
        lg: "h-14 px-10 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
