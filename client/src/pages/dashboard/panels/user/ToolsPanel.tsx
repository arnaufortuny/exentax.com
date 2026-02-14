import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Receipt, Calculator, ClipboardList, FileText, ChevronRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ToolsPanel() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.tools.title')}</h2>
        <p className="text-base text-muted-foreground mt-1">{t('dashboard.tools.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-2xl shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-6 h-6 text-accent" />
              <h3 className="font-black text-foreground tracking-tight">{t('dashboard.clientTools.invoiceGenerator')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.invoiceDescription')}</p>
            <Link href="/tools/invoice">
              <Button className="bg-accent text-accent-foreground font-black rounded-full" size="sm" data-testid="button-invoice-generator">
                {t('dashboard.clientTools.createInvoice')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
        
        <Card className="rounded-2xl shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-6 h-6 text-accent" />
              <h3 className="font-black text-foreground tracking-tight">{t('dashboard.clientTools.priceCalculator')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.calculatorDescription')}</p>
            <Link href="/tools/price-calculator">
              <Button className="bg-accent text-accent-foreground font-black rounded-full" size="sm" data-testid="button-price-calculator">
                {t('dashboard.clientTools.calculate')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
        
        <Card className="rounded-2xl shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-6 h-6 text-accent" />
              <h3 className="font-black text-foreground tracking-tight">{t('dashboard.clientTools.operatingAgreement')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t('dashboard.clientTools.operatingDescription')}</p>
            <Link href="/tools/operating-agreement">
              <Button className="bg-accent text-accent-foreground font-black rounded-full" size="sm" data-testid="button-operating-agreement">
                {t('dashboard.clientTools.generateDocument')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
        
        <Card className="rounded-2xl shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-6 h-6 text-accent" />
              <h3 className="font-black text-foreground tracking-tight">{t('tools.csvGenerator.toolTitle')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t('tools.csvGenerator.toolDescription')}</p>
            <Link href="/tools/csv-generator">
              <Button className="bg-accent text-accent-foreground font-black rounded-full" size="sm" data-testid="button-csv-generator">
                {t('tools.csvGenerator.openTool')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
