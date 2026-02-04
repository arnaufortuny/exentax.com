import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex max-h-screen w-[calc(100%-2rem)] max-w-[420px] flex-col-reverse gap-3",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border-0 p-4 pr-10 shadow-2xl transition-all data-[swipe=cancel]:translate-y-0 data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-card text-foreground shadow-xl shadow-black/10 dark:shadow-black/30 border border-gray-100 dark:border-border",
        destructive: "bg-white dark:bg-card text-foreground shadow-xl shadow-red-500/10 border-l-4 border-l-red-500 border border-red-100 dark:border-red-900/50",
        success: "bg-white dark:bg-card text-foreground shadow-xl shadow-green-500/10 border-l-4 border-l-[#6EDC8A] border border-green-100 dark:border-green-900/50",
        warning: "bg-white dark:bg-card text-foreground shadow-xl shadow-yellow-500/10 border-l-4 border-l-yellow-500 border border-yellow-100 dark:border-yellow-900/50",
        info: "bg-white dark:bg-card text-foreground shadow-xl shadow-blue-500/10 border-l-4 border-l-blue-500 border border-blue-100 dark:border-blue-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-accent bg-accent/10 px-4 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-full p-1 text-muted-foreground opacity-60 transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-bold text-foreground leading-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs text-muted-foreground leading-relaxed mt-0.5", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

function ToastIcon({ variant }: { variant?: string }) {
  const iconClass = "w-5 h-5 flex-shrink-0"
  
  switch (variant) {
    case "success":
      return <CheckCircle2 className={cn(iconClass, "text-[#6EDC8A]")} />
    case "destructive":
      return <AlertCircle className={cn(iconClass, "text-red-500")} />
    case "warning":
      return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />
    case "info":
      return <Info className={cn(iconClass, "text-blue-500")} />
    default:
      return <CheckCircle2 className={cn(iconClass, "text-[#6EDC8A]")} />
  }
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
}
