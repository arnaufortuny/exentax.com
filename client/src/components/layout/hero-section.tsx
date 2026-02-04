import { ReactNode } from "react";

interface HeroSectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  showOverlay?: boolean;
  showGradient?: boolean;
  mobilePaddingTop?: string;
}

export function HeroSection({ 
  title, 
  subtitle, 
  children, 
  className = "",
  mobilePaddingTop = "pt-8 sm:pt-16 lg:pt-20",
}: HeroSectionProps) {
  return (
    <section 
      className={`relative overflow-hidden pb-6 sm:pb-16 lg:pb-20 flex flex-col items-center justify-center text-center ${mobilePaddingTop} ${className}`}
    >
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
