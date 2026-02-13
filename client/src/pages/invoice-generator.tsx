import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Trash2, Plus, FileDown, ArrowLeft } from "@/components/icons";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { formatDateShort } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/use-page-title";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const EXPORT_LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "ca", label: "Català" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
];

export default function InvoiceGenerator() {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  usePageTitle();
  
  // All hooks must be called before any conditional returns
  const [issuerName, setIssuerName] = useState("");
  const [issuerAddress, setIssuerAddress] = useState("");
  const [issuerEmail, setIssuerEmail] = useState("");
  const [issuerTaxId, setIssuerTaxId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientTaxId, setClientTaxId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateId(), description: "", quantity: 1, price: 0 }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportLang, setExportLang] = useState(i18n.language?.split('-')[0] || 'es');
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  
  // Use shared auth hook - same as dashboard
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Only show loading on initial load
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      </div>
    );
  }
  
  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">{t("tools.invoiceGenerator.loginRequired")}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t("tools.invoiceGenerator.loginDescription")}</p>
          <Button onClick={() => setLocation("/auth/login")} className="bg-accent text-accent-foreground rounded-full px-6">
            {t("auth.login.submit")}
          </Button>
        </div>
      </div>
    );
  }

  const addItem = () => {
    setItems([...items, { id: generateId(), description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : "\u00A3";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return formatDateShort(dateStr);
  };

  const generatePDF = async () => {
    if (!issuerName || !clientName || items.some(i => !i.description)) {
      setFormMessage({ type: 'error', text: t('tools.invoiceGenerator.validationError') });
      return;
    }

    setIsGenerating(true);
    const tPdf = i18n.getFixedT(exportLang);

    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const bottomLimit = pageHeight - 30;
      let pageNum = 1;

      const addPageFooter = () => {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`${tPdf('tools.invoiceGenerator.title')} — exentax.com`, margin, pageHeight - 12);
        doc.text(`${pageNum}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
      };

      const checkPageBreak = (requiredSpace: number, yPos: number): number => {
        if (yPos + requiredSpace > bottomLimit) {
          addPageFooter();
          doc.addPage();
          pageNum++;
          return 30;
        }
        return yPos;
      };

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(margin, 15, pageWidth - margin, 15);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(tPdf('tools.invoiceGenerator.title').toUpperCase(), margin, 30);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const detailsX = pageWidth - margin;
      let detailY = 22;
      doc.text(`${tPdf('tools.invoiceGenerator.invoiceNumber')}:`, detailsX - 55, detailY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(invoiceNumber || '-', detailsX, detailY, { align: 'right' });
      
      detailY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`${tPdf('tools.invoiceGenerator.invoiceDate')}:`, detailsX - 55, detailY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(formatDate(invoiceDate), detailsX, detailY, { align: 'right' });
      
      if (dueDate) {
        detailY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`${tPdf('tools.invoiceGenerator.dueDate')}:`, detailsX - 55, detailY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(formatDate(dueDate), detailsX, detailY, { align: 'right' });
      }

      doc.setLineWidth(0.3);
      doc.line(margin, 38, pageWidth - margin, 38);

      let yPos = 48;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(tPdf('tools.invoiceGenerator.issuer').toUpperCase(), margin, yPos);
      doc.text(tPdf('tools.invoiceGenerator.client').toUpperCase(), pageWidth / 2 + 5, yPos);

      yPos += 7;
      doc.setFontSize(11);
      doc.text(issuerName, margin, yPos);
      doc.text(clientName, pageWidth / 2 + 5, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      
      let issuerY = yPos + 6;
      if (issuerAddress) {
        const lines = doc.splitTextToSize(issuerAddress, contentWidth / 2 - 10);
        doc.text(lines, margin, issuerY);
        issuerY += lines.length * 4;
      }
      if (issuerEmail) { doc.text(issuerEmail, margin, issuerY); issuerY += 4; }
      if (issuerTaxId) { doc.text(`${tPdf('tools.invoiceGenerator.taxId')}: ${issuerTaxId}`, margin, issuerY); issuerY += 4; }
      
      let clientY = yPos + 6;
      if (clientAddress) {
        const lines = doc.splitTextToSize(clientAddress, contentWidth / 2 - 10);
        doc.text(lines, pageWidth / 2 + 5, clientY);
        clientY += lines.length * 4;
      }
      if (clientEmail) { doc.text(clientEmail, pageWidth / 2 + 5, clientY); clientY += 4; }
      if (clientTaxId) { doc.text(`${tPdf('tools.invoiceGenerator.taxId')}: ${clientTaxId}`, pageWidth / 2 + 5, clientY); clientY += 4; }

      yPos = Math.max(issuerY, clientY) + 10;
      yPos = checkPageBreak(20, yPos);

      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 1;

      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, contentWidth, 10, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(tPdf('tools.invoiceGenerator.description').toUpperCase(), margin + 4, yPos + 7);
      doc.text(tPdf('tools.invoiceGenerator.quantity').toUpperCase(), 120, yPos + 7, { align: 'center' });
      doc.text(tPdf('tools.invoiceGenerator.price').toUpperCase(), 150, yPos + 7, { align: 'right' });
      doc.text(tPdf('tools.invoiceGenerator.total').toUpperCase(), pageWidth - margin - 2, yPos + 7, { align: 'right' });

      doc.line(margin, yPos + 11, pageWidth - margin, yPos + 11);
      yPos += 16;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      items.forEach((item, index) => {
        const descLines = doc.splitTextToSize(item.description, 85);
        const rowHeight = Math.max(descLines.length * 5, 8);
        yPos = checkPageBreak(rowHeight + 4, yPos);

        if (index % 2 === 1) {
          doc.setFillColor(248, 248, 248);
          doc.rect(margin, yPos - 4, contentWidth, rowHeight + 2, 'F');
        }

        doc.setTextColor(30, 30, 30);
        doc.text(descLines, margin + 4, yPos);
        doc.text(String(item.quantity), 120, yPos, { align: 'center' });
        doc.text(`${item.price.toFixed(2)}`, 150, yPos, { align: 'right' });
        const itemTotal = item.quantity * item.price;
        doc.text(`${itemTotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
        
        yPos += rowHeight + 2;
      });

      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      yPos = checkPageBreak(45, yPos);

      const summaryX = 140;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`${tPdf('tools.invoiceGenerator.subtotal')}:`, summaryX, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`${subtotal.toFixed(2)} ${currencySymbol}`, pageWidth - margin - 2, yPos, { align: 'right' });
      
      if (taxRate > 0) {
        yPos += 7;
        doc.setTextColor(80, 80, 80);
        doc.text(`${tPdf('tools.invoiceGenerator.tax')} (${taxRate}%):`, summaryX, yPos);
        doc.setTextColor(0, 0, 0);
        doc.text(`${taxAmount.toFixed(2)} ${currencySymbol}`, pageWidth - margin - 2, yPos, { align: 'right' });
      }
      
      yPos += 4;
      doc.setLineWidth(0.5);
      doc.line(summaryX, yPos, pageWidth - margin, yPos);
      yPos += 9;

      doc.setFillColor(0, 0, 0);
      doc.rect(summaryX - 2, yPos - 6, pageWidth - margin - summaryX + 4, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(tPdf('tools.invoiceGenerator.total').toUpperCase(), summaryX + 3, yPos + 3);
      doc.setFontSize(13);
      doc.text(`${total.toFixed(2)} ${currencySymbol}`, pageWidth - margin - 2, yPos + 3, { align: 'right' });

      if (notes) {
        yPos += 22;
        yPos = checkPageBreak(25, yPos);
        doc.setLineWidth(0.3);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(tPdf('tools.invoiceGenerator.notes').toUpperCase(), margin, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const noteLines = doc.splitTextToSize(notes, contentWidth);
        noteLines.forEach((line: string) => {
          yPos = checkPageBreak(6, yPos);
          doc.text(line, margin, yPos);
          yPos += 4.5;
        });
      }

      addPageFooter();

      doc.save(`invoice-${invoiceNumber || Date.now()}.pdf`);
      setIsGenerating(false);

    } catch (error) {
      setIsGenerating(false);
      setFormMessage({ type: 'error', text: t('tools.invoiceGenerator.generationError') });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10 pb-20">
        <div className="mb-6 md:mb-8">
          <Link href="/dashboard?tab=tools">
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground mb-4 -ml-2" data-testid="button-back-tools">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('tools.backToTools')}
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">{t('tools.invoiceGenerator.title')}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">{t('tools.invoiceGenerator.subtitle')}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">{t("tools.exportLanguage")}:</Label>
                <NativeSelect value={exportLang} onChange={(e) => setExportLang(e.target.value)} data-testid="select-invoice-export-lang">
                  {EXPORT_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </NativeSelect>
              </div>
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-accent text-accent-foreground font-black rounded-full px-5"
                data-testid="button-generate-pdf"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isGenerating ? t('tools.invoiceGenerator.generating') : t('tools.invoiceGenerator.generatePdf')}
              </Button>
            </div>
          </div>
        </div>

        {formMessage && (
          <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${
            formMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
            formMessage.type === 'success' ? 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/30 dark:border-accent/30' :
            'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/20 dark:border-accent/30'
          }`} data-testid="form-message">
            {formMessage.text}
          </div>
        )}

        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="border-0 shadow-md rounded-2xl">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-sm md:text-base font-semibold text-accent">{t('tools.invoiceGenerator.issuer')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="issuerName" className="text-xs md:text-sm">{t('tools.invoiceGenerator.nameCompany')} *</Label>
                  <Input id="issuerName"
                    value={issuerName}
                    onChange={(e) => setIssuerName(e.target.value)}
                    className="mt-1 rounded-full"
                    data-testid="input-issuer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="issuerAddress" className="text-xs md:text-sm">{t('tools.invoiceGenerator.address')}</Label>
                  <Textarea id="issuerAddress"
                    value={issuerAddress}
                    onChange={(e) => setIssuerAddress(e.target.value)}
                    rows={2}
                    className="mt-1 resize-none rounded-2xl"
                    data-testid="input-issuer-address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="issuerEmail" className="text-xs md:text-sm">Email</Label>
                    <Input id="issuerEmail"
                      type="email"
                      value={issuerEmail}
                      onChange={(e) => setIssuerEmail(e.target.value)}
                      className="mt-1 rounded-full"
                      data-testid="input-issuer-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuerTaxId" className="text-xs md:text-sm">{t('tools.invoiceGenerator.taxId')}</Label>
                    <Input id="issuerTaxId"
                      value={issuerTaxId}
                      onChange={(e) => setIssuerTaxId(e.target.value)}
                      className="mt-1 rounded-full"
                      data-testid="input-issuer-tax-id"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-sm md:text-base font-semibold text-accent">{t('tools.invoiceGenerator.client')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="clientName" className="text-xs md:text-sm">{t('tools.invoiceGenerator.nameCompany')} *</Label>
                  <Input id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="mt-1 rounded-full"
                    data-testid="input-client-name"
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress" className="text-xs md:text-sm">{t('tools.invoiceGenerator.address')}</Label>
                  <Textarea id="clientAddress"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    rows={2}
                    className="mt-1 resize-none rounded-2xl"
                    data-testid="input-client-address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="clientEmail" className="text-xs md:text-sm">Email</Label>
                    <Input id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="mt-1 rounded-full"
                      data-testid="input-client-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientTaxId" className="text-xs md:text-sm">{t('tools.invoiceGenerator.taxId')}</Label>
                    <Input id="clientTaxId"
                      value={clientTaxId}
                      onChange={(e) => setClientTaxId(e.target.value)}
                      className="mt-1 rounded-full"
                      data-testid="input-client-tax-id"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base font-semibold text-accent">{t('tools.invoiceGenerator.invoiceDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="invoiceNumber" className="text-xs md:text-sm">{t('tools.invoiceGenerator.invoiceNumber')}</Label>
                  <Input id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="mt-1 rounded-full"
                    data-testid="input-invoice-number"
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate" className="text-xs md:text-sm">{t('tools.invoiceGenerator.invoiceDate')} *</Label>
                  <Input id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="mt-1 text-[10px] sm:text-sm min-w-0 px-2 sm:px-4 rounded-full"
                    data-testid="input-invoice-date"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate" className="text-xs md:text-sm">{t('tools.invoiceGenerator.dueDate')}</Label>
                  <Input id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 text-[10px] sm:text-sm min-w-0 px-2 sm:px-4 rounded-full"
                    data-testid="input-due-date"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-xs md:text-sm">{t('tools.invoiceGenerator.currency')}</Label>
                  <NativeSelect
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 rounded-full"
                    data-testid="select-currency"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </NativeSelect>
                </div>
                <div>
                  <Label htmlFor="taxRate" className="text-xs md:text-sm">{t('tools.invoiceGenerator.taxRate')}</Label>
                  <NativeSelect
                    value={String(taxRate)}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="mt-1 rounded-full"
                    data-testid="select-tax-rate"
                  >
                    <option value="0">{t("tools.invoiceGenerator.noVat")}</option>
                    <option value="4">4%</option>
                    <option value="10">10%</option>
                    <option value="21">21%</option>
                  </NativeSelect>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 md:pb-4 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm md:text-base font-semibold text-accent">{t('tools.invoiceGenerator.items')}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="h-8 text-xs rounded-full"
                data-testid="button-add-item"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t('tools.invoiceGenerator.addItem')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 gap-3 text-xs text-muted-foreground font-medium px-1">
                  <div className="col-span-6">{t('tools.invoiceGenerator.description')} *</div>
                  <div className="col-span-2">{t('tools.invoiceGenerator.quantity')}</div>
                  <div className="col-span-3">{t('tools.invoiceGenerator.price')} ({currencySymbol})</div>
                  <div className="col-span-1"></div>
                </div>
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 md:gap-3 items-center">
                    <div className="col-span-12 md:col-span-6">
                      <Input value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="rounded-full"
                        data-testid={`input-item-description-${index}`}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Input type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="rounded-full"
                        data-testid={`input-item-quantity-${index}`}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <Input type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="rounded-full"
                        data-testid={`input-item-price-${index}`}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-full"
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <div className="text-right space-y-1">
                  <div className="flex justify-end gap-4 text-xs md:text-sm text-muted-foreground">
                    <span>{t('tools.invoiceGenerator.subtotal')}:</span>
                    <span>{subtotal.toFixed(2)} {currencySymbol}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-end gap-4 text-xs md:text-sm text-muted-foreground">
                      <span>{t('tools.invoiceGenerator.tax')} ({taxRate}%):</span>
                      <span>{taxAmount.toFixed(2)} {currencySymbol}</span>
                    </div>
                  )}
                  <p className="text-xl md:text-2xl font-bold text-foreground" data-testid="text-total">
                    {total.toFixed(2)} {currencySymbol}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base font-semibold text-accent">{t('tools.invoiceGenerator.notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none rounded-2xl"
                data-testid="input-notes"
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-2xl sm:hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{t("tools.exportLanguage")}:</Label>
                <NativeSelect value={exportLang} onChange={(e) => setExportLang(e.target.value)} data-testid="select-invoice-export-lang-mobile">
                  {EXPORT_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </NativeSelect>
              </div>
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-accent text-accent-foreground font-black rounded-full px-5 w-full"
                data-testid="button-generate-pdf-mobile"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isGenerating ? t('tools.invoiceGenerator.generating') : t('tools.invoiceGenerator.generatePdf')}
              </Button>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
