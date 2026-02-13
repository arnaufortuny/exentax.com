import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const MAX_RETRIES = 3;
const AUTO_RETRY_DELAY = 5000;
const RETRY_RESET_DELAY = 30000;
const MIN_ERROR_INTERVAL = 2000;

interface PanelErrorBoundaryProps {
  children: ReactNode;
  panelName?: string;
}

interface PanelErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  lastErrorTime: number;
}

function ErrorDisplay({
  panelName,
  errorMessage,
  retryCount,
  onRetry,
}: {
  panelName?: string;
  errorMessage?: string;
  retryCount: number;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const exhausted = retryCount >= MAX_RETRIES;

  return (
    <Card
      className="rounded-2xl shadow-sm p-6 md:p-8 text-center"
      data-testid={`error-boundary-${panelName || "panel"}`}
    >
      <div className="flex flex-col items-center gap-3">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <div>
          <h3 className="text-base font-black text-foreground mb-1">
            {panelName
              ? t("errors.errorInPanel", { panel: panelName })
              : t("errors.somethingWentWrong")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {errorMessage || t("errors.unexpectedError")}
          </p>
        </div>
        {exhausted ? (
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="rounded-full font-bold mt-2"
            data-testid="button-panel-error-reload"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {t("errors.reloadPage")}
          </Button>
        ) : (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="rounded-full font-bold mt-2"
            data-testid="button-panel-error-retry"
          >
            {t("errors.retry")}
          </Button>
        )}
      </div>
    </Card>
  );
}

export class PanelErrorBoundary extends Component<PanelErrorBoundaryProps, PanelErrorBoundaryState> {
  private autoRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryResetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: PanelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0, lastErrorTime: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<PanelErrorBoundaryState> {
    return { hasError: true, error, lastErrorTime: Date.now() };
  }

  componentDidUpdate(_prevProps: PanelErrorBoundaryProps, prevState: PanelErrorBoundaryState): void {
    if (this.state.hasError && !prevState.hasError) {
      const timeSinceLastError = this.state.lastErrorTime - prevState.lastErrorTime;
      const isDeterministic = prevState.lastErrorTime > 0 && timeSinceLastError < MIN_ERROR_INTERVAL;

      if (!isDeterministic && this.state.retryCount < MAX_RETRIES) {
        this.scheduleAutoRetry();
      } else {
        this.clearAutoRetry();
      }
    }

    if (!this.state.hasError && prevState.hasError) {
      this.clearRetryResetTimer();
      this.retryResetTimer = setTimeout(() => {
        this.setState({ retryCount: 0 });
      }, RETRY_RESET_DELAY);
    }
  }

  componentWillUnmount(): void {
    this.clearAutoRetry();
    this.clearRetryResetTimer();
  }

  private scheduleAutoRetry(): void {
    this.clearAutoRetry();
    this.autoRetryTimer = setTimeout(() => {
      this.handleRetry();
    }, AUTO_RETRY_DELAY);
  }

  private clearAutoRetry(): void {
    if (this.autoRetryTimer) {
      clearTimeout(this.autoRetryTimer);
      this.autoRetryTimer = null;
    }
  }

  private clearRetryResetTimer(): void {
    if (this.retryResetTimer) {
      clearTimeout(this.retryResetTimer);
      this.retryResetTimer = null;
    }
  }

  handleRetry = (): void => {
    this.clearAutoRetry();
    this.clearRetryResetTimer();
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          panelName={this.props.panelName}
          errorMessage={this.state.error?.message}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
