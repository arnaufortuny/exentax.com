import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft, Package, Calendar, MessageSquare, User, Sparkles, Heart } from "@/components/icons";

interface TourStep {
  target?: string;
  titleKey: string;
  descriptionKey: string;
  icon: any;
}

const tourSteps: TourStep[] = [
  {
    titleKey: "tour.welcome.title",
    descriptionKey: "tour.welcome.description",
    icon: Heart
  },
  {
    target: '[data-tour="orders"]',
    titleKey: "tour.orders.title",
    descriptionKey: "tour.orders.description",
    icon: Package
  },
  {
    target: '[data-tour="calendar"]',
    titleKey: "tour.calendar.title",
    descriptionKey: "tour.calendar.description",
    icon: Calendar
  },
  {
    target: '[data-tour="messages"]',
    titleKey: "tour.messages.title",
    descriptionKey: "tour.messages.description",
    icon: MessageSquare
  },
  {
    target: '[data-tour="profile"]',
    titleKey: "tour.profile.title",
    descriptionKey: "tour.profile.description",
    icon: User
  },
  {
    titleKey: "tour.ready.title",
    descriptionKey: "tour.ready.description",
    icon: Sparkles
  }
];

interface DashboardTourProps {
  onComplete?: () => void;
}

export function DashboardTour({ onComplete }: DashboardTourProps) {
  const { t } = useTranslation();
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
    const tourCompleted = localStorage.getItem('dashboard-tour-v4');
    if (tourCompleted) return;

    if (window.innerWidth < 768) return;

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
    localStorage.setItem('dashboard-tour-v4', 'true');
    onComplete?.();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const hasTarget = !!step.target && targetRect;
  const StepIcon = step.icon;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300"
        onClick={handleClose}
      />

      {hasTarget && (
        <div
          className="fixed z-[9999] rounded-xl ring-4 ring-accent ring-offset-4 ring-offset-background pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      <Card 
        className={`fixed z-[10000] w-[calc(100vw-2rem)] max-w-sm p-5 md:p-6 shadow-2xl border-0 bg-card transition-all duration-300 rounded-2xl ${
          hasTarget 
            ? 'md:left-auto md:translate-x-0' 
            : 'left-1/2 -translate-x-1/2 top-20 md:top-24'
        }`}
        style={hasTarget ? {
          top: Math.min(
            Math.max(100, targetRect.top),
            window.innerHeight - 320
          ),
          left: window.innerWidth >= 768 
            ? Math.min(targetRect.right + 24, window.innerWidth - 400)
            : '50%',
          transform: window.innerWidth >= 768 ? 'none' : 'translateX(-50%)',
          maxHeight: 'calc(100dvh - 160px)',
        } : {
          maxHeight: 'calc(100dvh - 160px)',
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
          data-testid="button-tour-close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <StepIcon className="w-6 h-6 text-accent" />
          </div>
          <div className="min-w-0 pt-1">
            <h3 className="font-black text-foreground text-lg leading-tight">
              {t(step.titleKey)}
            </h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              {t(step.descriptionKey)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
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
                className="h-10 font-semibold"
                data-testid="button-tour-prev"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('tour.back', 'Atrás')}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="h-10 font-black bg-accent text-accent-foreground"
              data-testid="button-tour-next"
            >
              {isLastStep ? t('tour.start', '¡Empezar!') : t('tour.next', 'Siguiente')}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

export function resetDashboardTour() {
  localStorage.removeItem('dashboard-tour-v4');
}
