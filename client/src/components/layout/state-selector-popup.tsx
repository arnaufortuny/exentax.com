import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import logoIcon from "@/assets/logo-icon.png";

interface StateSelectorPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATES = [
  { id: "NM", name: "New Mexico", price: "639€", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { id: "WY", name: "Wyoming", price: "799€", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { id: "DE", name: "Delaware", price: "999€", color: "bg-amber-50 text-amber-700 border-amber-100" }
];

export function StateSelectorPopup({ isOpen, onOpenChange }: StateSelectorPopupProps) {
  const [, setLocation] = useLocation();

  const handleSelect = async (state: string) => {
    try {
      // Notify admin about activity
      await apiRequest("POST", "/api/activity/track", { 
        action: "CLICK_ELEGIR_ESTADO", 
        details: `Usuario seleccionó ${state}` 
      });
    } catch (e) {
      console.error("Error tracking activity:", e);
    }
    
    onOpenChange(false);
    setLocation(`/application?state=${state}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[85vw] sm:w-[400px] max-w-md rounded-[2.5rem] border-0 shadow-2xl overflow-hidden p-0">
        <div className="bg-accent h-1.5 w-full" />
        <div className="p-6 sm:p-8 pt-6 sm:pt-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/5 rounded-[1.5rem] flex items-center justify-center p-3 border border-accent/10">
              <img src={logoIcon} alt="Easy US LLC" className="w-full h-full object-contain" />
            </div>
          </div>
          <DialogHeader className="mb-6 sm:mb-8 text-center">
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground leading-tight mb-2">
              ¿Quieres el mantenimiento<br />de tu LLC?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-xs sm:text-sm">
              Selecciona el estado donde quieres constituir tu empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2.5 sm:gap-3">
            {STATES.map((state) => (
              <button
                key={state.id}
                onClick={() => handleSelect(state.name)}
                className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-left w-full active:scale-[0.98]`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div>
                    <p className="font-black uppercase tracking-tight text-foreground text-sm sm:text-base leading-none mb-1">{state.name}</p>
                    <p className="text-accent font-black text-[10px] sm:text-xs">{state.price}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-foreground transition-colors translate-x-0 group-hover:translate-x-1" />
              </button>
            ))}
          </div>
          
          <p className="mt-6 sm:mt-8 text-[8px] sm:text-[9px] text-center text-gray-400 uppercase font-black tracking-widest opacity-50">
            Expertos en formación de LLC
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
