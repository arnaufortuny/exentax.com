import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { Download, FileText } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  titleHighlight: string;
  lastUpdated: string;
  pdfUrl?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, titleHighlight, lastUpdated, pdfUrl, children }: LegalPageLayoutProps) {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownload = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-background bg-green-gradient-subtle font-sans text-left selection:bg-brand-lime selection:text-brand-dark print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <HeroSection 
        className="pt-20 sm:pt-24 lg:pt-28 pb-0 print:pt-4"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-brand-dark leading-[1.1] text-center sm:text-left print:text-3xl">
            {title} <span className="text-brand-lime">{titleHighlight}</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl text-brand-dark font-medium max-w-2xl mb-8 text-center sm:text-left mx-auto sm:mx-0">
            Easy US LLC - {lastUpdated}
          </p>
        }
      />
      
      <section className="py-8 sm:py-12 bg-background print:py-2">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 print:px-2">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mb-8 print:hidden">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">{t("legal.documentInfo") || "Official legal document"}</span>
              </div>
              <Button 
                onClick={handleDownload}
                variant="default"
                className="rounded-full bg-brand-lime text-brand-dark hover:bg-brand-lime/90 transition-all gap-3 px-8 font-black text-sm tracking-wider w-full sm:w-auto shadow-lg"
                data-testid="button-download-pdf"
              >
                <Download className="w-5 h-5" />
                {t("legal.downloadPdf") || "Download PDF"}
              </Button>
            </div>

            <div ref={contentRef} className="space-y-12 text-brand-dark leading-relaxed print:space-y-4">
              {children}
            </div>
          </div>
        </div>
      </section>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

interface LegalSectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ number, title, children }: LegalSectionProps) {
  return (
    <section className="print:break-inside-avoid">
      <h2 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter mb-6 print:text-xl print:mb-3">
        <span className="text-brand-lime mr-4">{number}</span> {title}
      </h2>
      <div className="space-y-4 text-base sm:text-lg print:text-sm print:space-y-2">
        {children}
      </div>
    </section>
  );
}

interface LegalSubSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSubSection({ title, children }: LegalSubSectionProps) {
  return (
    <div className="mt-6 print:mt-3">
      <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-3 print:text-base print:mb-2">{title}</h3>
      <div className="space-y-3 print:space-y-1">{children}</div>
    </div>
  );
}

interface LegalListProps {
  items: string[];
  ordered?: boolean;
}

export function LegalList({ items, ordered = false }: LegalListProps) {
  const ListTag = ordered ? 'ol' : 'ul';
  return (
    <ListTag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-8 space-y-2 font-medium print:space-y-1`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ListTag>
  );
}

interface LegalHighlightBoxProps {
  children: React.ReactNode;
  variant?: 'info' | 'dark';
}

export function LegalHighlightBox({ children, variant = 'info' }: LegalHighlightBoxProps) {
  if (variant === 'dark') {
    return (
      <div className="bg-brand-dark text-white rounded-2xl p-10 sm:p-12 shadow-xl print:bg-gray-100 print:text-black print:p-4 print:rounded-lg">
        <div className="text-lg sm:text-xl leading-relaxed opacity-90 font-medium print:text-sm">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-8 space-y-2 font-medium print:p-4 print:rounded-lg print:border">
      {children}
    </div>
  );
}
