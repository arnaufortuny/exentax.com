import { Variants, Transition } from "framer-motion";

// Professional easing curves - GPU accelerated, no lag
export const easing = {
  smooth: [0.22, 0.03, 0.26, 1] as const,
  snappy: [0.32, 0, 0.14, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  decelerate: [0, 0, 0.15, 1] as const,
  accelerate: [0.35, 0, 1, 1] as const,
  professional: [0.16, 1, 0.3, 1] as const,
};

// Ultra-smooth transitions - optimized for 60fps
export const transitions = {
  instant: { duration: 0.08, ease: easing.snappy } as Transition,
  fast: { duration: 0.15, ease: easing.professional } as Transition,
  normal: { duration: 0.25, ease: easing.professional } as Transition,
  slow: { duration: 0.4, ease: easing.smooth } as Transition,
  spring: { type: "spring", stiffness: 400, damping: 30, mass: 0.5 } as Transition,
  springBounce: { type: "spring", stiffness: 300, damping: 20, mass: 0.5 } as Transition,
};

// Fade animations - optimized with smaller movements for snappier feel
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.fast,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
};

// Scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.normal,
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.springBounce,
  },
};

// Line/bar animations
export const lineExpand: Variants = {
  hidden: { scaleX: 0, originX: 0.5 },
  visible: { 
    scaleX: 1,
    transition: { duration: 0.3, ease: easing.smooth, delay: 0.1 },
  },
};

// Container with stagger children - faster stagger for fluidity
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.02,
    },
  },
};

// Card animations for grid items
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
};

// Hero text animations - professional entrance
export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: easing.professional },
  },
};

export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.08, ease: easing.professional },
  },
};

// Counter/number animations
export const numberPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring,
  },
};

// List item animations
export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.fast,
  },
};

// Button hover animations (use with whileHover/whileTap)
export const buttonHover = {
  scale: 1.02,
  transition: transitions.fast,
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// Viewport settings optimized for performance - trigger earlier for smoother feel
export const viewportOnce = { once: true, amount: 0.1, margin: "-50px" };
export const viewportRepeat = { once: false, amount: 0.15 };

// Utility function for staggered delays
export const getStaggerDelay = (index: number, baseDelay = 0.05) => ({
  transition: { delay: index * baseDelay },
});

// CSS animation classes (for non-motion elements)
export const cssAnimations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  scaleIn: "animate-scale-in",
  pageIn: "animate-page-in",
};

// Performance optimizations
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
