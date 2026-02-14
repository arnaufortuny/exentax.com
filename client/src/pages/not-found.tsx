import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Home } from "@/components/icons";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto flex flex-col items-center justify-center">
          <div className="text-[120px] sm:text-[180px] font-black text-accent/30 leading-none mb-4">404</div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tight">
            {t("notFound.title")}
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            {t("notFound.description")}
          </p>
          
          <Button 
            asChild 
            size="lg"
            className="bg-accent text-accent-foreground border-accent font-bold rounded-full shadow-lg" 
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
