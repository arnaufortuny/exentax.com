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
      className={`relative overflow-hidden pt-10 pb-8 sm:pt-24 sm:pb-24 lg:pt-32 lg:pb-32 bg-white ${className}`}
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'white'
      }}
    >
      {showOverlay && (
        <div className="absolute inset-0 z-1 bg-black/40" />
      )}
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="w-full text-left">
          <div className="w-full mb-4 sm:mb-6">
            {title}
          </div>
          <div className="max-w-4xl">
            {subtitle && (
              <div className="text-sm sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed font-medium">
                {subtitle}
              </div>
            )}
            <div className="flex flex-col items-start gap-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
