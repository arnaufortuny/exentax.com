import { CheckCircle2, Circle, Clock, FileText, Building2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LLCProgressWidgetProps {
  status: string;
  llcName?: string;
  state?: string;
  requestCode?: string;
}

const STEPS = [
  { id: 'pending', label: 'Pedido Recibido', icon: CreditCard, description: 'Tu pedido ha sido registrado' },
  { id: 'paid', label: 'Pago Confirmado', icon: CheckCircle2, description: 'Pago procesado correctamente' },
  { id: 'processing', label: 'En Tramitación', icon: Clock, description: 'Preparando documentación' },
  { id: 'filed', label: 'Presentado', icon: FileText, description: 'Documentos enviados al estado' },
  { id: 'completed', label: 'LLC Activa', icon: Building2, description: 'Tu LLC está operativa' }
];

const STATUS_ORDER = ['pending', 'paid', 'processing', 'filed', 'documents_ready', 'completed'];

export function LLCProgressWidget({ status, llcName, state, requestCode }: LLCProgressWidgetProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const progressPercent = currentIndex >= 0 ? ((currentIndex + 1) / STEPS.length) * 100 : 0;
  
  const getStepStatus = (stepIndex: number) => {
    if (status === 'cancelled') return 'cancelled';
    if (currentIndex < 0) return 'pending';
    if (stepIndex < currentIndex || (stepIndex === currentIndex && status === 'completed')) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const stateLabels: Record<string, string> = {
    new_mexico: 'New Mexico',
    wyoming: 'Wyoming',
    delaware: 'Delaware'
  };

  if (status === 'cancelled') {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
            <Circle className="h-4 w-4" />
            Pedido Cancelado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">
            Este pedido ha sido cancelado. Contacta con soporte si tienes dudas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {llcName || 'Tu LLC'}
          </CardTitle>
          {state && (
            <span className="text-xs bg-muted px-2 py-1 rounded-md">
              {stateLabels[state] || state}
            </span>
          )}
        </div>
        {requestCode && (
          <p className="text-xs text-muted-foreground">Ref: {requestCode}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="relative">
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-border" />
          
          <div className="space-y-3">
            {STEPS.map((step, index) => {
              const stepStatus = getStepStatus(index);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-start gap-3 relative">
                  <div className={`
                    relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors
                    ${stepStatus === 'completed' 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : stepStatus === 'current'
                        ? 'bg-primary/10 border-primary text-primary animate-pulse'
                        : 'bg-background border-muted-foreground/30 text-muted-foreground'
                    }
                  `}>
                    {stepStatus === 'completed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pb-2">
                    <p className={`text-sm font-medium leading-none ${
                      stepStatus === 'completed' 
                        ? 'text-foreground' 
                        : stepStatus === 'current'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
