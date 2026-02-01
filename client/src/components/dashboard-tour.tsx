import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface TourStep {
  target?: string;
  title: string;
  description: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Bienvenido a tu Area de Cliente",
    description: "Te mostramos las funciones principales de tu panel."
  },
  {
    target: '[data-tour="orders"]',
    title: "Tus Pedidos",
    description: "Consulta el estado de tus pedidos y documentos."
  },
  {
    target: '[data-tour="calendar"]',
    title: "Calendario Fiscal",
    description: "Fechas importantes: IRS, informes y renovaciones."
  },
  {
    target: '[data-tour="messages"]',
    title: "Mensajes",
    description: "Contacta con nuestro equipo de soporte."
  },
  {
    target: '[data-tour="profile"]',
    title: "Tu Perfil",
    description: "Gestiona tus datos personales."
  },
  {
    title: "Listo para empezar",
    description: "Si tienes dudas, usa la seccion de Mensajes."
  }
];

interface DashboardTourProps {
  onComplete?: () => void;
}

export function DashboardTour({ onComplete }: DashboardTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetPosition = useCallback(() => {
    const step = tourSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
        return;
      }
    }
    setTargetRect(null);
  }, [currentStep]);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('dashboard-tour-v3');
    if (tourCompleted) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);
    
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
    };
  }, [isVisible, updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('dashboard-tour-v3', 'true');
    onComplete?.();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const hasTarget = !!step.target && targetRect;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300"
        onClick={handleClose}
      />

      {hasTarget && (
        <div
          className="fixed z-[9999] rounded-lg ring-4 ring-accent ring-offset-2 ring-offset-background pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      <Card 
        className={`fixed z-[10000] w-[calc(100vw-2rem)] max-w-sm p-4 md:p-5 shadow-2xl border-0 bg-card transition-all duration-300 rounded-2xl ${
          hasTarget 
            ? 'left-1/2 -translate-x-1/2' 
            : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        style={hasTarget ? {
          top: Math.min(
            targetRect.bottom + 16,
            window.innerHeight - 220
          ),
          maxHeight: 'calc(100vh - 280px)',
        } : {
          maxHeight: 'calc(100vh - 100px)',
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          data-testid="button-tour-close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground text-base md:text-lg leading-tight">
              {step.title}
            </h3>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-accent' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="h-9"
                data-testid="button-tour-prev"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="h-9"
              data-testid="button-tour-next"
            >
              {isLastStep ? 'Empezar' : 'Siguiente'}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

export function resetDashboardTour() {
  localStorage.removeItem('dashboard-tour-v3');
}
