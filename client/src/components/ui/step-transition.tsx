import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface StepTransitionProps {
  step: number;
  children: ReactNode;
  direction?: "forward" | "backward";
}

const variants = {
  enter: (direction: string) => ({
    x: direction === "forward" ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: string) => ({
    x: direction === "forward" ? -20 : 20,
    opacity: 0,
  }),
};

export function StepTransition({ step, children, direction = "forward" }: StepTransitionProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={step}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
