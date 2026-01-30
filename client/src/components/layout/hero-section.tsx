import { ReactNode } from "react";

interface HeroSectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  showOverlay?: boolean;
}

export function HeroSection({ 
  title, 
  subtitle, 
  children, 
  className = "", 
}: HeroSectionProps) {
  return (
    <section 
      className={`relative overflow-hidden pt-8 pb-6 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20 flex flex-col items-center justify-center text-center ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(110, 220, 138, 0.15) 0%, rgba(110, 220, 138, 0.08) 50%, rgba(110, 220, 138, 0.02) 80%, transparent 100%)'
      }}
    >
      {/* Soft radial gradient overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none dark:opacity-50"
        style={{
          background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(110, 220, 138, 0.2) 0%, rgba(110, 220, 138, 0.08) 40%, transparent 80%)'
        }}
      />
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col items-center justify-center text-center">
        <div className="w-full text-center flex flex-col items-center justify-center">
          <div className="w-full mb-0 sm:mb-6 flex flex-col items-center justify-center">
            {title}
          </div>
          <div className="max-w-4xl flex flex-col items-center justify-center">
            {subtitle && (
              <div className="text-xs sm:text-xl lg:text-2xl text-foreground mb-4 sm:mb-8 leading-relaxed font-medium text-center">
                {subtitle}
              </div>
            )}
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
