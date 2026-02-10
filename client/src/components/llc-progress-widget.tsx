import { CheckCircle2, Circle, Clock, FileText, Building2, CreditCard, Wrench, Package } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

interface ProgressWidgetProps {
  status: string;
  serviceName?: string;
  state?: string;
  requestCode?: string;
  isMaintenance?: boolean;
}

const getLLCSteps = (t: (key: string) => string) => [
  { id: 'pending', label: t('progress.orderReceived'), icon: CreditCard, description: t('progress.orderRegistered') },
  { id: 'paid', label: t('progress.paymentConfirmed'), icon: CheckCircle2, description: t('progress.paymentProcessed') },
  { id: 'processing', label: t('progress.processing'), icon: Clock, description: t('progress.preparingDocs') },
  { id: 'filed', label: t('progress.filed'), icon: FileText, description: t('progress.docsSent') },
  { id: 'documents_ready', label: t('progress.documentsReady'), icon: Package, description: t('progress.documentsReadyDesc') },
  { id: 'completed', label: t('progress.llcActive'), icon: Building2, description: t('progress.llcOperational') }
];

const getMaintenanceSteps = (t: (key: string) => string) => [
  { id: 'pending', label: t('progress.requestReceived'), icon: CreditCard, description: t('progress.requestRegistered') },
  { id: 'paid', label: t('progress.paymentConfirmed'), icon: CheckCircle2, description: t('progress.paymentProcessed') },
  { id: 'processing', label: t('progress.inProcess'), icon: Clock, description: t('progress.managingRenewal') },
  { id: 'filed', label: t('progress.filed'), icon: FileText, description: t('progress.docsUpdated') },
  { id: 'documents_ready', label: t('progress.documentsReady'), icon: Package, description: t('progress.documentsReadyDesc') },
  { id: 'completed', label: t('progress.completed'), icon: Wrench, description: t('progress.maintenanceComplete') }
];

const STATUS_ORDER = ['pending', 'paid', 'processing', 'filed', 'documents_ready', 'completed'];

export function LLCProgressWidget({ status, serviceName, state, requestCode, isMaintenance = false }: ProgressWidgetProps) {
  const { t } = useTranslation();
  const STEPS = isMaintenance ? getMaintenanceSteps(t) : getLLCSteps(t);
  const currentIndex = STATUS_ORDER.indexOf(status);
  const progressPercent = currentIndex >= 0 ? Math.min(((currentIndex + 1) / STEPS.length) * 100, 100) : 0;
  
  const getStepStatus = (stepIndex: number) => {
    if (status === 'cancelled') return 'cancelled';
    if (currentIndex < 0) return 'pending';
    if (stepIndex < currentIndex || (stepIndex === currentIndex && status === 'completed')) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const stateLabels: Record<string, string> = {
    new_mexico: t('application.states.newMexico'),
    wyoming: t('application.states.wyoming'),
    delaware: t('application.states.delaware'),
    'New Mexico': t('application.states.newMexico'),
    'Wyoming': t('application.states.wyoming'),
    'Delaware': t('application.states.delaware')
  };

  if (status === 'cancelled') {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900" data-testid="widget-cancelled">
        <CardHeader className="pb-2 p-3 md:p-4">
          <CardTitle className="text-sm md:text-base flex items-center gap-2 text-red-700 dark:text-red-400">
            <Circle className="h-4 w-4" />
            {t('progress.cancelled')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
          <p className="text-xs md:text-sm text-red-600 dark:text-red-400">
            {t('progress.cancelledMessage')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden max-w-sm sm:max-w-none mx-auto sm:mx-0 ${status === 'completed' ? 'border-accent dark:border-accent' : ''}`} data-testid={`widget-progress-${isMaintenance ? 'maintenance' : 'llc'}`}>
      <CardHeader className="pb-2 md:pb-3 p-2.5 sm:p-3 md:p-4 bg-primary/5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
            {isMaintenance ? (
              <Wrench className="h-4 w-4 md:h-5 md:w-5 text-accent" />
            ) : (
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            )}
            <span className="truncate max-w-[180px] md:max-w-none">
              {serviceName || (isMaintenance ? t('progress.maintenance') : t('progress.yourLLC'))}
            </span>
          </CardTitle>
          {state && (
            <span className="text-[10px] md:text-xs bg-muted px-2 py-0.5 md:py-1 rounded-md font-medium shrink-0">
              {stateLabels[state] || state}
            </span>
          )}
        </div>
        {requestCode && (
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{t('progress.reference')}: {requestCode}</p>
        )}
      </CardHeader>
      <CardContent className="p-2.5 sm:p-3 md:p-4 space-y-2.5 sm:space-y-3 md:space-y-4">
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex justify-between text-[10px] md:text-xs">
            <span className="text-muted-foreground">{t('progress.progressLabel')}</span>
            <span className="font-bold text-primary">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 md:h-2" />
        </div>

        <div className="relative">
          <div className="absolute left-[9px] md:left-[11px] top-5 md:top-6 bottom-5 md:bottom-6 w-0.5 bg-border" />
          
          <div className="space-y-2 md:space-y-3">
            {STEPS.map((step, index) => {
              const stepStatus = getStepStatus(index);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-start gap-2 md:gap-3 relative">
                  <div className={`
                    relative z-10 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors shrink-0
                    ${stepStatus === 'completed' 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : stepStatus === 'current'
                        ? 'bg-primary/10 border-primary text-primary animate-pulse'
                        : 'bg-background border-muted-foreground/30 text-muted-foreground'
                    }
                  `}>
                    {stepStatus === 'completed' ? (
                      <CheckCircle2 className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                    ) : (
                      <Icon className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pb-1 md:pb-2">
                    <p className={`text-xs md:text-sm font-medium leading-tight ${
                      stepStatus === 'completed' 
                        ? 'text-foreground' 
                        : stepStatus === 'current'
                          ? 'text-primary font-bold'
                          : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 leading-tight hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
