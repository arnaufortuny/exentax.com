"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useTranslation } from "react-i18next"

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
      "fixed inset-0 z-50 bg-black/80",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

function DialogContentInner({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, ref: React.ForwardedRef<React.ElementRef<typeof DialogPrimitive.Content>>) {
  const { t } = useTranslation();
  
  React.useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <DialogPortal container={typeof document !== 'undefined' ? document.body : undefined}>
      <DialogPrimitive.Overlay 
        className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm"
      />
      <div 
        className="fixed inset-0 z-[99999] overflow-y-auto"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}
      >
        <div className="flex min-h-full w-full items-center justify-center p-4">
          <DialogPrimitive.Content
            ref={ref}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className={cn(
              "relative w-full max-w-md my-auto",
              "bg-white dark:bg-zinc-900 border border-border",
              "rounded-xl shadow-2xl",
              "max-h-[85vh] overflow-y-auto overscroll-contain",
              "p-4 sm:p-6",
              className
            )}
            style={{ 
              WebkitOverflowScrolling: 'touch',
            }}
            {...props}
          >
            {children}
            <DialogPrimitive.Close 
              className="absolute right-3 top-3 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-muted/80 hover-elevate active-elevate-2 flex items-center justify-center z-10 touch-manipulation"
              data-testid="button-dialog-close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">{t("common.close")}</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </div>
      </div>
    </DialogPortal>
  );
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(DialogContentInner)
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
