"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <DialogPortal container={typeof document !== 'undefined' ? document.body : undefined}>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 z-[99998] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          ref={ref}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[99999] flex flex-col",
            "bg-white dark:bg-zinc-900 border-t border-border",
            "rounded-t-3xl shadow-2xl",
            "max-h-[90dvh] overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "duration-300 ease-out",
            className
          )}
          {...props}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
            {children}
          </div>
          <DialogPrimitive.Close className="absolute right-4 top-4 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }

  return (
    <DialogPortal container={typeof document !== 'undefined' ? document.body : undefined}>
      <DialogPrimitive.Overlay 
        className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
      />
      <DialogPrimitive.Content
        ref={ref}
        onOpenAutoFocus={(e) => {
          const firstFocusable = (e.target as HTMLElement)?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            e.preventDefault();
            requestAnimationFrame(() => {
              firstFocusable.focus({ preventScroll: true });
            });
          }
        }}
        className={cn(
          "fixed left-1/2 top-1/2 z-[99999] -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-md",
          "bg-white dark:bg-zinc-900 border border-border",
          "rounded-2xl shadow-2xl",
          "max-h-[85dvh] overflow-y-auto",
          "p-6",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "duration-200",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 mb-4",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-3 mt-6 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-black leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
