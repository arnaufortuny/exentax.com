import { Variants, Transition } from "framer-motion";

export const easing = {
  smooth: [0.25, 0.1, 0.25, 1] as const,
  elegant: [0.4, 0, 0.2, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  professional: [0.22, 0.03, 0.26, 1] as const,
};

export const transitions = {
  instant: { duration: 0.1, ease: easing.elegant } as Transition,
  fast: { duration: 0.18, ease: easing.professional } as Transition,
  normal: { duration: 0.25, ease: easing.elegant } as Transition,
  slow: { duration: 0.35, ease: easing.smooth } as Transition,
  spring: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 } as Transition,
  springBounce: { type: "spring", stiffness: 280, damping: 28, mass: 0.7 } as Transition,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.fast,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: easing.elegant },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.normal,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.normal,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.normal,
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.springBounce,
  },
};

export const lineExpand: Variants = {
  hidden: { scaleX: 0, originX: 0.5 },
  visible: { 
    scaleX: 1,
    transition: { duration: 0.3, ease: easing.elegant, delay: 0.05 },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.025,
      delayChildren: 0.02,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: easing.elegant },
  },
};

export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.25, ease: easing.elegant },
  },
};

export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, delay: 0.05, ease: easing.elegant },
  },
};

export const numberPop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring,
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.fast,
  },
};

export const buttonHover = {
  scale: 1.01,
  transition: transitions.fast,
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.08, ease: easing.elegant },
};

export const viewportOnce = { once: true, amount: 0.15, margin: "-30px" };
export const viewportRepeat = { once: false, amount: 0.2 };

export const getStaggerDelay = (index: number, baseDelay = 0.04) => ({
  transition: { delay: index * baseDelay },
});

export const cssAnimations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  scaleIn: "animate-scale-in",
  pageIn: "animate-page-in",
};

export const willChangeTransform = "";
export const willChangeOpacity = "";
export const willChangeBoth = "";

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
