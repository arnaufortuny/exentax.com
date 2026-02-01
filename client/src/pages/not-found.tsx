import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background bg-green-gradient-subtle">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 py-20 sm:py-32">
        <div className="text-center max-w-lg mx-auto">
          <div className="text-[120px] sm:text-[180px] font-black text-[#6EDC8A]/30 leading-none mb-4">404</div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tight">
            Página No Encontrada
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            La página que buscas no existe o ha sido movida.
          </p>
          
          <Button 
            asChild 
            className="!bg-[#6EDC8A] hover:!bg-[#5cd67a] !text-[#0E1215] font-bold px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]" 
            data-testid="button-go-home"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
