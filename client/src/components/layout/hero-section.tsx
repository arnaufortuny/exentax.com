import { ReactNode } from "react";
import heroBg from "@/assets/hero-bg.png";

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
  showOverlay = true 
}: HeroSectionProps) {
  return (
    <section 
      className={`relative overflow-hidden pt-8 pb-6 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24 bg-white flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col items-center justify-center text-center">
        <div className="w-full text-center flex flex-col items-center justify-center">
          <div className="w-full mb-2 sm:mb-6 flex flex-col items-center justify-center">
            {title}
          </div>
          <div className="max-w-4xl flex flex-col items-center justify-center">
            {subtitle && (
              <div className="text-xs sm:text-xl lg:text-2xl text-brand-dark mb-4 sm:mb-8 leading-relaxed font-medium text-center">
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
