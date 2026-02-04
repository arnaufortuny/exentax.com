import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto flex flex-col items-center justify-center">
          <div className="text-[120px] sm:text-[180px] font-black text-[#6EDC8A]/30 leading-none mb-4">404</div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tight">
            {t("notFound.title")}
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            {t("notFound.description")}
          </p>
          
          <Button 
            asChild 
            className="!bg-[#6EDC8A] hover:!bg-[#5cd67a] !text-[#0A0A0A] font-bold px-8 py-6 text-base rounded-full shadow-lg transition-colors" 
            data-testid="button-go-home"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              {t("notFound.button")}
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
