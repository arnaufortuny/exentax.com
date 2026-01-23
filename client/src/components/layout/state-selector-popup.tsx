import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
      <DialogContent className="w-[90vw] max-w-md rounded-[2rem] border-0 shadow-2xl overflow-hidden p-0 sm:w-full">
        <div className="bg-accent h-1.5 w-full" />
        <div className="p-6 sm:p-8 pt-5 sm:pt-6">
          <DialogHeader className="mb-6 sm:mb-8">
            <DialogTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground leading-none mb-2">
              Selecciona el Estado
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-sm sm:text-base">
              Elige dónde quieres constituir tu LLC para comenzar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:gap-4">
            {STATES.map((state) => (
              <button
                key={state.id}
                onClick={() => handleSelect(state.name)}
                className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-left w-full active:scale-[0.98]`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div>
                    <p className="font-black uppercase tracking-tight text-foreground text-base sm:text-lg leading-none mb-1">{state.name}</p>
                    <p className="text-accent font-black text-xs sm:text-sm">{state.price}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-foreground transition-colors translate-x-0 group-hover:translate-x-1" />
              </button>
            ))}
          </div>
          
          <p className="mt-6 sm:mt-8 text-[9px] sm:text-[10px] text-center text-gray-400 uppercase font-bold tracking-widest">
            Expertos en formación de LLC
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
