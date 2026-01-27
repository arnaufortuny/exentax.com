import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto rounded-[2rem] text-center">
          <CardContent className="pt-8 pb-8">
            <div className="text-6xl mb-4">404</div>
            <h1 className="text-2xl font-black font-serif text-primary mb-4">Página No Encontrada</h1>
            <p className="text-sm text-muted-foreground mb-6">
              La página que buscas no existe o ha sido movida.
            </p>
            <Button asChild className="rounded-full bg-brand-lime text-brand-dark font-black px-8 tracking-tight" data-testid="button-go-home">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
