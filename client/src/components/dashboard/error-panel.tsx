import { useTranslation } from "react-i18next";
import { AlertCircle, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorPanelProps {
  error?: any;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function ErrorPanel({
  error,
  isLoading,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRetry,
  children,
}: ErrorPanelProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="space-y-3 p-4" data-testid="skeleton-panel-loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded" style={{ width: `${60 + Math.random() * 20}%` }} />
                <div className="h-3 bg-muted rounded" style={{ width: `${30 + Math.random() * 30}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl shadow-sm p-6 md:p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <div>
            <h3 className="text-base font-black text-foreground mb-1">{t('common.error')}</h3>
            <p className="text-xs text-muted-foreground">
              {error?.message || t('errors.connectionError', 'Could not load data.')}
            </p>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="rounded-full font-bold mt-2"
              data-testid="button-error-retry"
            >
              {t('common.retry', 'Retry')}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center">
        <div className="flex flex-col items-center gap-3 md:gap-4">
          {emptyIcon}
          <div>
            {emptyTitle && (
              <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">
                {emptyTitle}
              </h3>
            )}
            {emptyDescription && (
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">
                {emptyDescription}
              </p>
            )}
          </div>
          {emptyAction}
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
