import { ReactNode } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
};

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
      className={`relative overflow-hidden pt-8 pb-6 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20 bg-white flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div 
          className="w-full text-center flex flex-col items-center justify-center"
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.04
              }
            }
          }}
        >
          <motion.div className="w-full mb-0 sm:mb-6 flex flex-col items-center justify-center" variants={fadeIn}>
            {title}
          </motion.div>
          <div className="max-w-4xl flex flex-col items-center justify-center">
            {subtitle && (
              <motion.div 
                className="text-xs sm:text-xl lg:text-2xl text-brand-dark mb-4 sm:mb-8 leading-relaxed font-medium text-center"
                variants={fadeIn}
              >
                {subtitle}
              </motion.div>
            )}
            <motion.div className="flex flex-col items-center justify-center gap-2 sm:gap-4 w-full" variants={fadeIn}>
              {children}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
