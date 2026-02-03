import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { FileDown, ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface CompletedLLC {
  id: number;
  orderId: number;
  companyName: string;
  ein: string | null;
  state: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerIdNumber: string;
  ownerIdType: string;
  ownerAddress: string;
  ownerCity: string;
  ownerCountry: string;
  ownerProvince: string;
  ownerPostalCode: string;
  llcCreatedDate: string | null;
  designator: string;
}

export default function OperatingAgreementGenerator() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [selectedLlcId, setSelectedLlcId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: completedLLCs, isLoading: llcsLoading } = useQuery<CompletedLLC[]>({
    queryKey: ["/api/user/completed-llcs"],
    enabled: isAuthenticated,
  });
  
  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">{t("tools.operatingAgreement.loginRequired")}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t("tools.operatingAgreement.loginDescription")}</p>
          <Button onClick={() => setLocation("/auth/login")} className="bg-accent text-accent-foreground rounded-full px-6">
            {t("auth.login")}
          </Button>
        </div>
      </div>
    );
  }
  
  const selectedLLC = completedLLCs?.find(llc => String(llc.id) === selectedLlcId);
  const hasCompletedLLCs = completedLLCs && completedLLCs.length > 0;
  
  const { i18n } = useTranslation();
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const generatePDF = async () => {
    if (!selectedLLC || !selectedLLC.ein) return;
    
    setIsGenerating(true);
    
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      const accentColor = [110, 220, 138];
      const darkColor = [14, 18, 21];
      const grayColor = [107, 114, 128];
      
      const companyFullName = `${selectedLLC.companyName} ${selectedLLC.designator || 'LLC'}`;
      const fullAddress = `${selectedLLC.ownerAddress}, ${selectedLLC.ownerCity}, ${selectedLLC.ownerProvince}, ${selectedLLC.ownerCountry} ${selectedLLC.ownerPostalCode}`;
      
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 0, pageWidth, 6, 'F');
      
      let yPos = 25;
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(t("tools.operatingAgreement.pdf.title"), pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(14);
      doc.text(companyFullName, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(`${t("tools.operatingAgreement.pdf.subtitle")} ${selectedLLC.state}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 6;
      doc.text(`EIN: ${selectedLLC.ein}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      yPos += 12;
      
      const addSection = (title: string, content: string) => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 25;
        }
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPos);
        yPos += 6;
        
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(content, contentWidth);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 4 + 8;
      };
      
      addSection(
        t("tools.operatingAgreement.pdf.article1Title"),
        t("tools.operatingAgreement.pdf.article1Content", { companyName: companyFullName, state: selectedLLC.state })
      );
      
      addSection(
        t("tools.operatingAgreement.pdf.article2Title"),
        t("tools.operatingAgreement.pdf.article2Content", { state: selectedLLC.state })
      );
      
      addSection(
        t("tools.operatingAgreement.pdf.article3Title"),
        t("tools.operatingAgreement.pdf.article3Content", { 
          ownerName: selectedLLC.ownerFullName,
          idType: selectedLLC.ownerIdType,
          idNumber: selectedLLC.ownerIdNumber,
          address: fullAddress,
          email: selectedLLC.ownerEmail
        })
      );
      
      addSection(
        t("tools.operatingAgreement.pdf.article4Title"),
        t("tools.operatingAgreement.pdf.article4Content")
      );
      
      addSection(
        t("tools.operatingAgreement.pdf.article5Title"),
        t("tools.operatingAgreement.pdf.article5Content")
      );
      
      addSection(
        t("tools.operatingAgreement.pdf.article6Title"),
        t("tools.operatingAgreement.pdf.article6Content")
      );
      
      addSection(
        t("tools.operatingAgreement.pdf.article7Title"),
        t("tools.operatingAgreement.pdf.article7Content", { ein: selectedLLC.ein })
      );
      
      addSection(
        t("tools.operatingAgreement.pdf.article8Title"),
        t("tools.operatingAgreement.pdf.article8Content")
      );
      
      addSection(
        t("tools.operatingAgreement.pdf.article9Title"),
        t("tools.operatingAgreement.pdf.article9Content", { state: selectedLLC.state })
      );
      
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 30;
      }
      
      yPos += 10;
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const witnessLines = doc.splitTextToSize(t("tools.operatingAgreement.pdf.witness"), contentWidth);
      doc.text(witnessLines, margin, yPos);
      
      yPos += witnessLines.length * 5 + 15;
      doc.setFont('helvetica', 'normal');
      doc.text(`${t("tools.operatingAgreement.pdf.date")}: ${selectedLLC.llcCreatedDate ? formatDate(selectedLLC.llcCreatedDate) : '____________________'}`, margin, yPos);
      
      yPos += 20;
      doc.text(`${t("tools.operatingAgreement.pdf.memberSignature")}: ____________________________`, margin, yPos);
      yPos += 8;
      doc.text(`${t("tools.operatingAgreement.pdf.printedName")}: ${selectedLLC.ownerFullName}`, margin, yPos);
      
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, pageHeight - 25, contentWidth, 18, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(t("tools.operatingAgreement.pdf.footer1"), pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text(t("tools.operatingAgreement.pdf.footer2"), pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      const fileName = `Operating_Agreement_${selectedLLC.companyName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t("tools.backToDashboard")}
            </Link>
          </div>
          
          <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-accent/10 border-b border-accent/20 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-foreground">
                    {t("tools.operatingAgreement.title")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("tools.operatingAgreement.subtitle")}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {llcsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : !hasCompletedLLCs ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {t("tools.operatingAgreement.noLlc")}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                    {t("tools.operatingAgreement.noLlcDescription")}
                  </p>
                  <Button 
                    onClick={() => setLocation("/llc/formation")} 
                    className="bg-accent text-accent-foreground rounded-full px-6"
                  >
                    {t("tools.operatingAgreement.formLlc")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-bold text-foreground mb-2 block">
                      {t("tools.operatingAgreement.selectLlc")}
                    </Label>
                    <NativeSelect
                      value={selectedLlcId}
                      onValueChange={setSelectedLlcId}
                      className="h-12"
                    >
                      <option value="">{t("tools.operatingAgreement.selectPlaceholder")}</option>
                      {completedLLCs?.map(llc => (
                        <option key={llc.id} value={String(llc.id)}>
                          {llc.companyName} {llc.designator || 'LLC'} - {llc.state}
                          {!llc.ein && ` (${t("tools.operatingAgreement.pendingEin")})`}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  
                  {selectedLLC && (
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                        <h4 className="font-bold text-sm text-foreground">{t("tools.operatingAgreement.llcDetails")}</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t("tools.operatingAgreement.companyName")}:</span>
                            <p className="font-medium text-foreground">{selectedLLC.companyName} {selectedLLC.designator || 'LLC'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("tools.operatingAgreement.state")}:</span>
                            <p className="font-medium text-foreground">{selectedLLC.state}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">EIN:</span>
                            <p className={`font-mono font-medium ${selectedLLC.ein ? 'text-foreground' : 'text-destructive'}`}>
                              {selectedLLC.ein || t("tools.operatingAgreement.einPending")}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("tools.operatingAgreement.member")}:</span>
                            <p className="font-medium text-foreground">{selectedLLC.ownerFullName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("tools.operatingAgreement.identification")}:</span>
                            <p className="font-medium text-foreground">{selectedLLC.ownerIdType} {selectedLLC.ownerIdNumber}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium text-foreground">{selectedLLC.ownerEmail}</p>
                          </div>
                        </div>
                      </div>
                      
                      {!selectedLLC.ein ? (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">
                              {t("tools.operatingAgreement.einRequired")}
                            </p>
                            <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                              {t("tools.operatingAgreement.einRequiredDescription")}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-green-800 dark:text-green-200 text-sm">
                              {t("tools.operatingAgreement.readyToGenerate")}
                            </p>
                            <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                              {t("tools.operatingAgreement.readyDescription")}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={generatePDF}
                        disabled={!selectedLLC.ein || isGenerating}
                        className="w-full bg-accent text-accent-foreground rounded-full h-12 font-bold text-base shadow-lg shadow-accent/30 disabled:opacity-50"
                        data-testid="button-generate-agreement"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t("tools.operatingAgreement.generating")}
                          </>
                        ) : (
                          <>
                            <FileDown className="w-5 h-5 mr-2" />
                            {t("tools.operatingAgreement.generateButton")}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
