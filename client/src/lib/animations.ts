import { Variants, Transition } from "framer-motion";

// Professional easing curves - GPU accelerated, elegant motion
export const easing = {
  smooth: [0.25, 0.1, 0.25, 1] as const,
  elegant: [0.4, 0, 0.2, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  professional: [0.22, 0.03, 0.26, 1] as const,
};

// Elegant transitions - optimized for 60fps with smoother motion
export const transitions = {
  instant: { duration: 0.15, ease: easing.elegant } as Transition,
  fast: { duration: 0.3, ease: easing.professional } as Transition,
  normal: { duration: 0.5, ease: easing.elegant } as Transition,
  slow: { duration: 0.7, ease: easing.smooth } as Transition,
  spring: { type: "spring", stiffness: 280, damping: 30, mass: 0.9 } as Transition,
  springBounce: { type: "spring", stiffness: 220, damping: 24, mass: 0.7 } as Transition,
};

// Fade animations - smooth with elegant timing
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.fast,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
};

// Scale animations - elegant entrance
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.normal,
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.springBounce,
  },
};

// Line/bar animations - smooth expansion
export const lineExpand: Variants = {
  hidden: { scaleX: 0, originX: 0.5 },
  visible: { 
    scaleX: 1,
    transition: { duration: 0.5, ease: easing.elegant, delay: 0.15 },
  },
};

// Container with stagger children - elegant cascade
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// Card animations for grid items - smooth reveal
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
};

// Hero text animations - cinematic entrance
export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: easing.elegant },
  },
};

export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.2, ease: easing.elegant },
  },
};

// Counter/number animations - satisfying pop
export const numberPop: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring,
  },
};

// List item animations - smooth slide
export const listItem: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.fast,
  },
};

// Button hover animations (use with whileHover/whileTap)
export const buttonHover = {
  scale: 1.03,
  transition: transitions.fast,
};

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.12, ease: easing.elegant },
};

// Viewport settings - trigger for smooth reveal
export const viewportOnce = { once: true, amount: 0.15, margin: "-80px" };
export const viewportRepeat = { once: false, amount: 0.2 };

// Utility function for staggered delays
export const getStaggerDelay = (index: number, baseDelay = 0.08) => ({
  transition: { delay: index * baseDelay },
});

// CSS animation classes (for non-motion elements)
export const cssAnimations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  scaleIn: "animate-scale-in",
  pageIn: "animate-page-in",
};

// Performance optimizations - GPU acceleration
export const willChangeTransform = "will-change-transform";
export const willChangeOpacity = "will-change-[opacity]";
export const willChangeBoth = "will-change-[transform,opacity]";

// Reduced motion utilities
export const reducedMotionTransition: Transition = { duration: 0 };

export const getMotionProps = (prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: reducedMotionTransition,
    };
  }
  return {};
};
