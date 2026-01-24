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
      <DialogContent className="w-[80vw] sm:w-[320px] max-w-md rounded-[2rem] border-0 shadow-2xl overflow-hidden p-0">
        <div className="bg-accent h-1 w-full" />
        <div className="p-5 sm:p-6 pt-5 sm:pt-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/5 rounded-[1rem] flex items-center justify-center p-2 border border-accent/10">
              <img src={logoIcon} alt="Easy US LLC" className="w-full h-full object-contain" />
            </div>
          </div>
          <DialogHeader className="mb-5 sm:mb-6 text-center">
            <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground leading-tight mb-1">
              ¿Quieres el mantenimiento<br />de tu LLC?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-[10px] sm:text-xs">
              Selecciona el estado donde quieres constituir tu empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 sm:gap-2.5">
            {STATES.map((state) => (
              <button
                key={state.id}
                onClick={() => handleSelect(state.name)}
                className={`group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-left w-full active:scale-[0.98]`}
              >
                <div className="flex items-center gap-3 sm:gap-3.5">
                  <div>
                    <p className="font-black uppercase tracking-tight text-foreground text-xs sm:text-sm leading-none mb-0.5">{state.name}</p>
                    <p className="text-accent font-black text-[9px] sm:text-[10px]">{state.price}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-foreground transition-colors translate-x-0 group-hover:translate-x-1" />
              </button>
            ))}
          </div>
          
          <p className="mt-5 sm:mt-6 text-[7px] sm:text-[8px] text-center text-gray-400 uppercase font-black tracking-widest opacity-40">
            Expertos en formación de LLC
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
