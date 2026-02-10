import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Send, Building2, CreditCard, Clock, CheckCircle, AlertCircle } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

const WALLET_TEST_DATA = {
  holder: "ARNAU FORTUNY HERNANDEZ",
  iban: "DK2489000045271938",
  swift: "SXPYDKKKXXX",
  bankName: "BANKING CIRCLE DENMARK SA",
  bankAddress: "Lautruspsgade 13-15, Copenhagen, Dinamarca",
  balance: 15000.00,
  currency: "EUR",
  transactions: [
    { id: "9086782", date: "2026-02-08", description: "Fortuny Payments INC", amount: 15000.00, type: 'credit' as const },
  ],
};

function formatIBAN(iban: string) {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export function WalletTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showSendModal, setShowSendModal] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('wallet.copied'),
      description: `${label} ${t('wallet.copiedToClipboard')}`,
    });
  };

  const handleGenerateStatement = () => {
    toast({
      title: t('wallet.statementUnavailable'),
      description: t('wallet.statementUnavailableDesc'),
      variant: "destructive",
    });
  };

  const handleSendMoney = () => {
    setShowSendModal(true);
    setTimeout(() => {
      toast({
        title: t('wallet.transferUnavailable'),
        description: t('wallet.transferUnavailableDesc'),
        variant: "destructive",
      });
      setShowSendModal(false);
    }, 600);
  };

  return (
    <div key="wallet" className="space-y-6">
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">
            {t('wallet.title')}
          </h2>
        </div>
        <p className="text-base text-muted-foreground mt-1">
          {t('wallet.subtitle')}
        </p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm overflow-visible bg-gradient-to-br from-accent to-accent dark:from-accent dark:to-accent text-white" data-testid="card-wallet-balance">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/70">{t('wallet.availableBalance')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black tracking-tight" data-testid="text-wallet-balance">
                  {WALLET_TEST_DATA.balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xl font-bold text-white/80">{WALLET_TEST_DATA.currency}</span>
              </div>
              <p className="text-sm text-white/60 font-medium mt-2" data-testid="text-wallet-holder">
                {WALLET_TEST_DATA.holder}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSendMoney}
                className="bg-white/20 border border-white/30 text-white rounded-full font-bold backdrop-blur-sm"
                disabled={showSendModal}
                data-testid="button-wallet-send"
              >
                <Send className="w-4 h-4 mr-2" />
                {t('wallet.sendMoney')}
              </Button>
              <Button
                onClick={handleGenerateStatement}
                variant="outline"
                className="bg-white/10 border border-white/30 text-white rounded-full font-bold backdrop-blur-sm"
                data-testid="button-wallet-statement"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('wallet.generateStatement')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card" data-testid="card-wallet-account-details">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-black text-foreground tracking-tight">{t('wallet.accountDetails')}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IBAN</p>
                  <p className="text-sm font-bold text-foreground mt-0.5 font-mono" data-testid="text-wallet-iban">{formatIBAN(WALLET_TEST_DATA.iban)}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(WALLET_TEST_DATA.iban, 'IBAN')}
                  className="shrink-0 rounded-full"
                  data-testid="button-copy-iban"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SWIFT / BIC</p>
                  <p className="text-sm font-bold text-foreground mt-0.5 font-mono" data-testid="text-wallet-swift">{WALLET_TEST_DATA.swift}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(WALLET_TEST_DATA.swift, 'SWIFT')}
                  className="shrink-0 rounded-full"
                  data-testid="button-copy-swift"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 dark:bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('wallet.accountHolder')}</p>
                <p className="text-sm font-bold text-foreground mt-0.5" data-testid="text-wallet-account-holder">{WALLET_TEST_DATA.holder}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card" data-testid="card-wallet-bank-info">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-black text-foreground tracking-tight">{t('wallet.bankInformation')}</h3>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50 dark:bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('wallet.bankName')}</p>
                <p className="text-sm font-bold text-foreground mt-0.5" data-testid="text-wallet-bank-name">{WALLET_TEST_DATA.bankName}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 dark:bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('wallet.bankAddress')}</p>
                <p className="text-sm font-bold text-foreground mt-0.5" data-testid="text-wallet-bank-address">{WALLET_TEST_DATA.bankAddress}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 dark:bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('wallet.currency')}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-foreground">EUR</span>
                  <span className="text-sm text-muted-foreground">- Euro</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 dark:bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('wallet.accountStatus')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-accent">{t('wallet.active')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card" data-testid="card-wallet-transactions">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-black text-foreground tracking-tight">{t('wallet.recentTransactions')}</h3>
            </div>
          </div>

          {WALLET_TEST_DATA.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 dark:bg-muted/30 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h4 className="text-base font-bold text-foreground mb-1">{t('wallet.noTransactions')}</h4>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t('wallet.noTransactionsDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {WALLET_TEST_DATA.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 dark:bg-muted/30"
                  data-testid={`row-transaction-${tx.id}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'credit'
                      ? 'bg-accent/10 dark:bg-accent/20'
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {tx.type === 'credit'
                      ? <Download className="w-5 h-5 text-accent" />
                      : <Send className="w-5 h-5 text-red-500 dark:text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <p className="text-xs text-muted-foreground font-mono">ID {tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${
                      tx.type === 'credit' ? 'text-accent' : 'text-red-500 dark:text-red-400'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {WALLET_TEST_DATA.currency}
                    </p>
                    <Badge variant="outline" className="rounded-full text-[10px] mt-1 no-default-hover-elevate no-default-active-elevate border-accent/30 text-accent">
                      {tx.type === 'credit' ? t('wallet.received') : t('wallet.sent')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
