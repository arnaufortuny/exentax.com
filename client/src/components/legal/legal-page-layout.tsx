import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Download, FileText, Calendar } from "lucide-react";

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
    <div className="min-h-screen bg-background font-sans selection:bg-accent selection:text-accent-foreground print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <header className="pt-24 sm:pt-32 lg:pt-40 pb-10 sm:pb-14 lg:pb-16 print:pt-4 print:pb-4">
        <div className="container max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center w-full flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15] mb-4 sm:mb-5 print:text-2xl text-center w-full">
              <span className="text-accent tracking-widest text-xs sm:text-sm font-black block mb-2 uppercase">{title}</span>
              <span className="text-foreground">{titleHighlight}</span>
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 text-muted-foreground dark:text-zinc-400 mb-6 sm:mb-8 w-full text-center">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{lastUpdated}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{t("legal.documentInfo")}</span>
              </div>
            </div>

            <div className="print:hidden flex justify-center w-full">
              <button 
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-full px-6 h-11 font-bold text-sm shadow-md transition-all gap-2 hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#6EDC8A', color: '#0A0A0A' }}
                data-testid="button-download-pdf"
              >
                <Download className="w-4 h-4" />
                {t("legal.downloadPdf")}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-8 sm:py-10 lg:py-12 print:py-2">
        <div className="container max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 print:px-2">
          <div ref={contentRef} className="space-y-8 sm:space-y-10 print:space-y-4 text-left">
            {children}
          </div>
        </div>
      </main>

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
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center print:w-8 print:h-8 bg-accent">
          <span className="font-black text-sm sm:text-base print:text-xs text-accent-foreground">{number}</span>
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-brand-dark dark:text-white tracking-tight print:text-base">
          {title}
        </h2>
      </div>
      <div className="pl-0 sm:pl-16 space-y-3 sm:space-y-4 text-sm sm:text-base text-brand-dark/85 dark:text-zinc-300 leading-relaxed print:text-sm print:space-y-2 print:pl-0">
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
    <div className="mt-4 sm:mt-5 print:mt-3">
      <h3 className="text-sm sm:text-base font-bold text-brand-dark dark:text-white mb-2 sm:mb-3 print:text-sm print:mb-2">{title}</h3>
      <div className="space-y-2 sm:space-y-3 print:space-y-1">{children}</div>
    </div>
  );
}

interface LegalListProps {
  items: string[];
  ordered?: boolean;
}

export function LegalList({ items, ordered = false }: LegalListProps) {
  return (
    <ul className="space-y-2 sm:space-y-2.5 print:space-y-1">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2.5 sm:gap-3">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 sm:mt-2.5 bg-accent" />
          <span className="text-brand-dark/80 dark:text-zinc-300">{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface LegalHighlightBoxProps {
  children: React.ReactNode;
  variant?: 'info' | 'dark';
}

export function LegalHighlightBox({ children, variant = 'info' }: LegalHighlightBoxProps) {
  if (variant === 'dark') {
    return (
      <div className="bg-brand-dark dark:bg-muted text-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md print:bg-gray-100 print:text-black print:p-4 print:rounded-lg">
        <div className="text-sm sm:text-base leading-relaxed font-medium print:text-sm">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-muted/50 border border-border rounded-lg p-4 print:p-3 print:rounded-lg print:border">
      <div className="text-sm text-brand-dark/80 dark:text-zinc-300 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
