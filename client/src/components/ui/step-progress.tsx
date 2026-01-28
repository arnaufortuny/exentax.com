import { motion } from "framer-motion";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepProgress({ currentStep, totalSteps, className = "" }: StepProgressProps) {
  const progress = Math.min(((currentStep + 1) / totalSteps) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black text-muted-foreground">
          Paso {Math.min(currentStep + 1, totalSteps)} de {totalSteps}
        </span>
        <span className="text-sm font-black text-accent">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
