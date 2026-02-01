import { useEffect, useRef } from "react";
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

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfUrl.split('/').pop() || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-green-gradient-subtle font-sans selection:bg-brand-lime selection:text-brand-dark print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <HeroSection 
        className="pt-20 sm:pt-24 lg:pt-28 pb-0 print:pt-4"
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-brand-dark leading-[1.1] text-left print:text-3xl">
            {title} <span className="text-brand-lime">{titleHighlight}</span>
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl text-brand-dark font-medium max-w-2xl mb-8 text-left">
            Easy US LLC - {lastUpdated}
          </p>
        }
      />
      
      <section className="py-8 sm:py-12 bg-background print:py-2">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 print:px-2">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-row justify-between items-center gap-4 mb-10 print:hidden">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{t("legal.documentInfo")}</span>
              </div>
              <Button 
                onClick={handleDownload}
                variant="default"
                className="rounded-full bg-brand-lime text-brand-dark hover:bg-brand-lime/90 transition-all gap-2 px-6 font-black text-sm tracking-wider shadow-lg flex-shrink-0"
                data-testid="button-download-pdf"
              >
                <Download className="w-4 h-4" />
                {t("legal.downloadPdf")}
              </Button>
            </div>

            <div ref={contentRef} className="space-y-10 text-brand-dark leading-relaxed print:space-y-4">
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
      <h2 className="flex items-baseline gap-3 text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mb-6 print:text-xl print:mb-3">
        <span className="text-brand-lime">{number}</span>
        <span>{title}</span>
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
    <ListTag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-6 space-y-2 font-medium print:space-y-1 marker:text-brand-lime`}>
      {items.map((item, index) => (
        <li key={index} className="pl-2">{item}</li>
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
      <div className="bg-brand-dark text-white rounded-2xl p-8 sm:p-10 shadow-xl print:bg-gray-100 print:text-black print:p-4 print:rounded-lg">
        <div className="text-base sm:text-lg leading-relaxed opacity-90 font-medium print:text-sm">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-lime/5 border-2 border-brand-lime/20 rounded-2xl p-6 sm:p-8 space-y-2 font-medium print:p-4 print:rounded-lg print:border">
      {children}
    </div>
  );
}
