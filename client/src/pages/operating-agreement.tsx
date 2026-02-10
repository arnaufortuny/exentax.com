import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FileDown, ArrowLeft, Loader2, AlertCircle, CheckCircle, Building2, User, MapPin, Phone } from "@/components/icons";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import logoGreen from "@assets/logo-icon.png";
import { usePageTitle } from "@/hooks/use-page-title";

interface CompletedLLC {
  id: number;
  orderId: number;
  companyName: string;
  ein: string | null;
  state: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone?: string;
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

interface FormData {
  memberAddress: string;
  memberPhone: string;
  capitalContribution: string;
  effectiveDate: string;
}

export default function OperatingAgreementGenerator() {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  usePageTitle();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [selectedLlcId, setSelectedLlcId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportLang, setExportLang] = useState(i18n.language?.split('-')[0] || 'es');
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    memberAddress: "",
    memberPhone: "",
    capitalContribution: "",
    effectiveDate: new Date().toISOString().split('T')[0],
  });
  
  const queryClient = useQueryClient();
  
  const { data: completedLLCs, isLoading: llcsLoading } = useQuery<CompletedLLC[]>({
    queryKey: ["/api/user/completed-llcs"],
    enabled: isAuthenticated,
  });
  
  const saveDocumentMutation = useMutation({
    mutationFn: async (data: { llcApplicationId: number; pdfBase64: string; fileName: string }) => {
      return apiRequest("POST", "/api/user/operating-agreements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
    },
  });
  
  const selectedLLC = completedLLCs?.find(llc => String(llc.id) === selectedLlcId);
  const hasCompletedLLCs = completedLLCs && completedLLCs.length > 0;
  
  useEffect(() => {
    if (selectedLLC) {
      const fullAddress = `${selectedLLC.ownerAddress}, ${selectedLLC.ownerCity}, ${selectedLLC.ownerProvince}, ${selectedLLC.ownerCountry} ${selectedLLC.ownerPostalCode}`;
      setFormData(prev => ({
        ...prev,
        memberAddress: fullAddress,
        memberPhone: selectedLLC.ownerPhone || "",
      }));
    }
  }, [selectedLLC]);
  
  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">{t("tools.operatingAgreement.loginRequired")}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t("tools.operatingAgreement.loginDescription")}</p>
          <Button onClick={() => setLocation("/auth/login")} className="bg-accent text-accent-foreground rounded-full px-6">
            {t("auth.login.submit")}
          </Button>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const isFormValid = formData.memberAddress.trim() !== "" && formData.effectiveDate !== "";

  const generatePDF = async () => {
    if (!selectedLLC || !selectedLLC.ein || !isFormValid) return;
    
    setIsGenerating(true);
    const tPdf = i18n.getFixedT(exportLang);
    
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 25;
      const contentWidth = pageWidth - (margin * 2);
      
      const accentColor: [number, number, number] = [110, 220, 138];
      const darkColor: [number, number, number] = [14, 18, 21];
      const grayColor: [number, number, number] = [107, 114, 128];
      const lightGray: [number, number, number] = [229, 231, 235];
      
      const companyFullName = `${selectedLLC.companyName} ${selectedLLC.designator || 'LLC'}`;
      
      let pageNumber = 1;
      
      const addPageFooter = () => {
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(tPdf("tools.operatingAgreement.pdf.footer1"), margin, pageHeight - 10);
        doc.text(`${tPdf("tools.operatingAgreement.pdf.page")} ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      };
      
      const addPageHeader = () => {
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(0, 0, pageWidth, 4, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(companyFullName, margin, 12);
        doc.text(tPdf("tools.operatingAgreement.pdf.title"), pageWidth - margin, 12, { align: 'right' });
        
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(margin, 16, pageWidth - margin, 16);
      };
      
      const checkNewPage = (requiredSpace: number): number => {
        if (yPos + requiredSpace > pageHeight - 30) {
          addPageFooter();
          doc.addPage();
          pageNumber++;
          addPageHeader();
          return 25;
        }
        return yPos;
      };
      
      // ===== COVER PAGE =====
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 0, pageWidth, 8, 'F');
      
      // Logo area - use actual logo image
      try {
        doc.addImage(logoGreen, 'PNG', pageWidth / 2 - 25, 30, 50, 25);
      } catch {
        // Fallback to text if image fails
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(pageWidth / 2 - 30, 35, 60, 20, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(tPdf("tools.operatingAgreement.pdf.easyUsLlc"), pageWidth / 2, 47, { align: 'center' });
      }
      
      let yPos = 80;
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(tPdf("tools.operatingAgreement.pdf.title"), pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 12;
      doc.setFontSize(14);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(tPdf("tools.operatingAgreement.pdf.of"), pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 16;
      doc.setFontSize(22);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(companyFullName, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 25;
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(2);
      doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
      
      yPos += 25;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      const introText = tPdf("tools.operatingAgreement.pdf.intro");
      const introLines = doc.splitTextToSize(introText, contentWidth - 40);
      doc.text(introLines, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += introLines.length * 6 + 20;
      
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin + 20, yPos, contentWidth - 40, 30, 4, 4, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(tPdf("tools.operatingAgreement.pdf.effectiveDate"), pageWidth / 2, yPos + 12, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(formatDate(formData.effectiveDate), pageWidth / 2, yPos + 24, { align: 'center' });
      
      addPageFooter();
      
      // ===== CONTENT PAGES =====
      doc.addPage();
      pageNumber++;
      addPageHeader();
      yPos = 25;
      
      const addSectionTitle = (num: number, title: string) => {
        yPos = checkNewPage(20);
        
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(margin, yPos, 8, 8, 1, 1, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(String(num), margin + 4, yPos + 5.5, { align: 'center' });
        
        doc.setFontSize(13);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text(title, margin + 12, yPos + 6);
        
        yPos += 14;
      };
      
      const addParagraph = (text: string, indent: boolean = false) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        
        const xStart = indent ? margin + 8 : margin;
        const width = indent ? contentWidth - 8 : contentWidth;
        const lines = doc.splitTextToSize(text, width);
        
        yPos = checkNewPage(lines.length * 5 + 5);
        doc.text(lines, xStart, yPos);
        yPos += lines.length * 5 + 6;
      };
      
      const addLabelValue = (label: string, value: string) => {
        yPos = checkNewPage(12);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(label, margin + 8, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text(value, margin + 8 + doc.getTextWidth(label) + 3, yPos);
        
        yPos += 6;
      };
      
      const addBulletPoint = (text: string) => {
        yPos = checkNewPage(8);
        
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.circle(margin + 10, yPos - 1.5, 1.5, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        
        const lines = doc.splitTextToSize(text, contentWidth - 20);
        doc.text(lines, margin + 16, yPos);
        yPos += lines.length * 5 + 3;
      };
      
      // Section 1 - Company Overview
      addSectionTitle(1, tPdf("tools.operatingAgreement.pdf.section1Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section1Content", { companyName: companyFullName, state: selectedLLC.state }));
      
      // Section 2 - Company Details
      addSectionTitle(2, tPdf("tools.operatingAgreement.pdf.section2Title"));
      yPos += 2;
      addLabelValue(tPdf("tools.operatingAgreement.pdf.legalName"), companyFullName);
      addLabelValue(tPdf("tools.operatingAgreement.pdf.stateOfFormation"), selectedLLC.state);
      addLabelValue(tPdf("tools.operatingAgreement.pdf.formationDate"), formatDate(selectedLLC.llcCreatedDate));
      addLabelValue(tPdf("tools.operatingAgreement.pdf.ein"), selectedLLC.ein || '');
      yPos += 4;
      addLabelValue(tPdf("tools.operatingAgreement.pdf.registeredAddress"), "");
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(tPdf("tools.operatingAgreement.pdf.registeredAddressLine1"), margin + 8, yPos);
      yPos += 5;
      doc.text(tPdf("tools.operatingAgreement.pdf.registeredAddressLine2"), margin + 8, yPos);
      yPos += 5;
      doc.text(tPdf("tools.operatingAgreement.pdf.registeredAddressLine3"), margin + 8, yPos);
      yPos += 5;
      doc.text(tPdf("tools.operatingAgreement.pdf.unitedStates"), margin + 8, yPos);
      yPos += 10;
      
      // Section 3 - Ownership
      addSectionTitle(3, tPdf("tools.operatingAgreement.pdf.section3Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section3Intro"));
      yPos += 2;
      addLabelValue(tPdf("tools.operatingAgreement.pdf.memberName"), selectedLLC.ownerFullName);
      addLabelValue(tPdf("tools.operatingAgreement.pdf.govId"), `${selectedLLC.ownerIdType} ${selectedLLC.ownerIdNumber}`);
      addLabelValue(tPdf("tools.operatingAgreement.pdf.residentialAddress"), formData.memberAddress);
      if (formData.memberPhone) {
        addLabelValue(tPdf("tools.operatingAgreement.pdf.telephone"), formData.memberPhone);
      }
      addLabelValue(tPdf("tools.operatingAgreement.pdf.email"), selectedLLC.ownerEmail);
      addLabelValue(tPdf("tools.operatingAgreement.pdf.ownership"), "100%");
      yPos += 4;
      addParagraph(tPdf("tools.operatingAgreement.pdf.section3Outro"));
      
      // Section 4 - Business Purpose
      addSectionTitle(4, tPdf("tools.operatingAgreement.pdf.section4Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section4Intro"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.purpose1"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.purpose2"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.purpose3"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.purpose4"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.purpose5"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section4Outro"));
      
      // Section 5 - Management Structure
      addSectionTitle(5, tPdf("tools.operatingAgreement.pdf.section5Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section5Intro"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.management1"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.management2"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.management3"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.management4"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.management5"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.management6"));
      
      // Section 6 - Capital Contribution
      addSectionTitle(6, tPdf("tools.operatingAgreement.pdf.section6Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section6Content"));
      if (formData.capitalContribution) {
        addLabelValue(tPdf("tools.operatingAgreement.pdf.initialContribution"), `$${formData.capitalContribution} USD`);
      }
      addParagraph(tPdf("tools.operatingAgreement.pdf.section6Outro"));
      
      // Section 7 - Profits and Distributions
      addSectionTitle(7, tPdf("tools.operatingAgreement.pdf.section7Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section7Content"));
      
      // Section 8 - Tax Treatment
      addSectionTitle(8, tPdf("tools.operatingAgreement.pdf.section8Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section8Intro"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.irs1120"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.irs5472"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.federalState"));
      
      // Section 9 - Financial Responsibility
      addSectionTitle(9, tPdf("tools.operatingAgreement.pdf.section9Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section9Content"));
      
      // Section 10 - Liability Protection
      addSectionTitle(10, tPdf("tools.operatingAgreement.pdf.section10Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section10Content"));
      
      // Section 11 - Record Keeping
      addSectionTitle(11, tPdf("tools.operatingAgreement.pdf.section11Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section11Intro"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.record1"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.record2"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.record3"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.record4"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.record5"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section11Outro"));
      
      // Section 12 - Transfer of Ownership
      addSectionTitle(12, tPdf("tools.operatingAgreement.pdf.section12Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section12Content"));
      
      // Section 13 - Dissolution
      addSectionTitle(13, tPdf("tools.operatingAgreement.pdf.section13Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section13Content"));
      
      // Section 14 - Source of Funds
      addSectionTitle(14, tPdf("tools.operatingAgreement.pdf.section14Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section14Intro"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.funds1"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.funds2"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.funds3"));
      addBulletPoint(tPdf("tools.operatingAgreement.pdf.funds4"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section14Outro"));
      
      // Section 15 - Preparation
      addSectionTitle(15, tPdf("tools.operatingAgreement.pdf.section15Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section15Content"));
      
      // Section 16 - Governing Law
      addSectionTitle(16, tPdf("tools.operatingAgreement.pdf.section16Title"));
      addParagraph(tPdf("tools.operatingAgreement.pdf.section16Content", { state: selectedLLC.state }));
      
      // ===== SIGNATURE PAGE =====
      yPos = checkNewPage(100);
      if (yPos < 50) {
        doc.addPage();
        pageNumber++;
        addPageHeader();
        yPos = 30;
      }
      
      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(tPdf("tools.operatingAgreement.pdf.memberConfirmation"), margin, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      const confirmText = tPdf("tools.operatingAgreement.pdf.confirmationText");
      const confirmLines = doc.splitTextToSize(confirmText, contentWidth);
      doc.text(confirmLines, margin, yPos);
      yPos += confirmLines.length * 5 + 15;
      
      // Signature box
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'S');
      
      doc.setFontSize(9);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(tPdf("tools.operatingAgreement.pdf.memberNameLabel"), margin + 8, yPos + 12);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedLLC.ownerFullName, margin + 8, yPos + 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(tPdf("tools.operatingAgreement.pdf.signature"), margin + 8, yPos + 35);
      doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.line(margin + 8 + doc.getTextWidth(tPdf("tools.operatingAgreement.pdf.signature")) + 5, yPos + 35, margin + contentWidth / 2 - 10, yPos + 35);
      
      doc.text(tPdf("tools.operatingAgreement.pdf.dateLabel"), margin + contentWidth / 2 + 10, yPos + 35);
      doc.line(margin + contentWidth / 2 + 10 + doc.getTextWidth(tPdf("tools.operatingAgreement.pdf.dateLabel")) + 5, yPos + 35, margin + contentWidth - 8, yPos + 35);
      
      yPos += 70;
      
      // Prepared by section
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(tPdf("tools.operatingAgreement.pdf.preparedBy"), margin + 8, yPos + 10);
      
      doc.setFontSize(12);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(tPdf("tools.operatingAgreement.pdf.easyUsLlc"), margin + 8, yPos + 20);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(tPdf("tools.operatingAgreement.pdf.corporateServices"), margin + 8, yPos + 27);
      
      const contactEmail = tPdf("tools.operatingAgreement.pdf.contactEmail");
      const contactPhone = tPdf("tools.operatingAgreement.pdf.contactPhone");
      doc.text(contactEmail, margin + contentWidth - 8 - doc.getTextWidth(contactPhone) - 40, yPos + 20, { align: 'left' });
      doc.text(contactPhone, margin + contentWidth - 8, yPos + 20, { align: 'right' });
      
      addPageFooter();
      
      const fileName = `Operating_Agreement_${selectedLLC.companyName.replace(/\s+/g, '_')}.pdf`;
      
      // Get PDF as base64 for saving to Document Center
      const pdfBase64 = doc.output('datauristring');
      
      // Save to browser
      doc.save(fileName);
      
      // Save to Document Center
      try {
        await saveDocumentMutation.mutateAsync({
          llcApplicationId: selectedLLC.id,
          pdfBase64: pdfBase64,
          fileName: fileName,
        });
      } catch (saveError) {
        console.error('Error saving to Document Center:', saveError);
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: t('tools.operatingAgreement.generationError') });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard?tab=tools">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground -ml-2" data-testid="button-back-tools">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("tools.backToTools")}
              </Button>
            </Link>
          </div>
          
          <Card className="rounded-2xl border-0 shadow-md">
            <CardHeader className="bg-accent/10 border-b border-accent/20 p-6">
              <div>
                <CardTitle className="text-xl font-black text-foreground tracking-tight">
                  {t("tools.operatingAgreement.title")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("tools.operatingAgreement.subtitle")}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {formMessage && (
                <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${
                  formMessage.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                  formMessage.type === 'success' ? 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/30 dark:border-accent/30' :
                  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                }`} data-testid="form-message">
                  {formMessage.text}
                </div>
              )}
              {llcsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : !hasCompletedLLCs ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 text-center">
                    {t("tools.operatingAgreement.noLlc")}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-sm text-center">
                    {t("tools.operatingAgreement.noLlcDescription")}
                  </p>
                  <Button onClick={() => setLocation("/llc/formation")} 
                    className="bg-accent text-accent-foreground rounded-full px-6"
                  >
                    {t("tools.operatingAgreement.formLlc")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* LLC Selection */}
                  <div>
                    <Label className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-accent" />
                      {t("tools.operatingAgreement.selectLlc")}
                    </Label>
                    <NativeSelect
                      value={selectedLlcId}
                      onValueChange={setSelectedLlcId}
                      className="h-12 rounded-full"
                      data-testid="select-llc"
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
                    <div className="space-y-6">
                      {/* Company Info */}
                      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-accent" />
                          {t("tools.operatingAgreement.llcDetails")}
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                        </div>
                      </div>
                      
                      {/* Editable Fields */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-accent" />
                          {t("tools.operatingAgreement.editableFields")}
                        </h4>
                        
                        <div>
                          <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {t("tools.operatingAgreement.memberAddress")} *
                          </Label>
                          <Textarea value={formData.memberAddress}
                            onChange={(e) => setFormData(prev => ({ ...prev, memberAddress: e.target.value }))}
                            className="min-h-[80px] resize-none rounded-2xl"
                            data-testid="input-member-address"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              {t("tools.operatingAgreement.memberPhone")}
                            </Label>
                            <Input value={formData.memberPhone}
                              onChange={(e) => setFormData(prev => ({ ...prev, memberPhone: e.target.value }))}
                              className="h-11 rounded-full"
                              data-testid="input-member-phone"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-foreground mb-2">
                              {t("tools.operatingAgreement.capitalContribution")}
                            </Label>
                            <Input value={formData.capitalContribution}
                              onChange={(e) => setFormData(prev => ({ ...prev, capitalContribution: e.target.value }))}
                              className="h-11 rounded-full"
                              data-testid="input-capital"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-foreground mb-2 block">
                            {t("tools.operatingAgreement.effectiveDate")} *
                          </Label>
                          <Input type="date"
                            value={formData.effectiveDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                            className="h-11 rounded-full"
                            data-testid="input-effective-date"
                          />
                        </div>
                      </div>
                      
                      {/* Status Messages */}
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
                      ) : !isFormValid ? (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">
                              {t("tools.operatingAgreement.requiredFields")}
                            </p>
                            <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                              {t("tools.operatingAgreement.requiredFieldsDescription")}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-accent/5 dark:bg-accent/10 border border-accent/30 dark:border-accent/30 rounded-xl p-4 flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-accent dark:text-accent text-sm">
                              {t("tools.operatingAgreement.readyToGenerate")}
                            </p>
                            <p className="text-accent dark:text-accent text-xs mt-1">
                              {t("tools.operatingAgreement.readyDescription")}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">{t("tools.exportLanguage")}:</Label>
                        <NativeSelect value={exportLang} onChange={(e) => setExportLang(e.target.value)} data-testid="select-agreement-export-lang">
                          {[
                            { code: "es", label: "Español" },
                            { code: "en", label: "English" },
                            { code: "ca", label: "Català" },
                            { code: "fr", label: "Français" },
                            { code: "de", label: "Deutsch" },
                            { code: "it", label: "Italiano" },
                            { code: "pt", label: "Português" },
                          ].map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                          ))}
                        </NativeSelect>
                      </div>
                      <Button
                        onClick={generatePDF}
                        disabled={!selectedLLC.ein || !isFormValid || isGenerating}
                        className="w-full bg-accent text-accent-foreground rounded-full h-12 font-bold text-base disabled:opacity-50"
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
    </div>
  );
}
