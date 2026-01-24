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
      <DialogContent 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] rounded-xl border-0 shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden p-0 z-[9999] !bg-white focus:outline-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-4">
          {/* LOGO SIN CONTENEDORES CIRCULARES, SOLO LA IMAGEN PNG */}
          <div className="flex justify-center mb-2 bg-transparent">
            <img src={logoIcon} alt="Easy US LLC" className="w-8 h-8 object-contain" style={{ background: 'none', border: 'none', borderRadius: '0' }} />
          </div>
          <DialogHeader className="mb-3 text-center">
            <DialogTitle className="text-xs font-black uppercase tracking-tight text-primary leading-tight">
              Constituye tu LLC
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-1.5">
            {STATES.map((state) => (
              <button
                key={state.id}
                onClick={() => handleSelect(state.name)}
                className="group flex items-center justify-between p-2.5 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all text-left w-full active:scale-[0.98] bg-white"
              >
                <div className="flex items-center">
                  <div>
                    <p className="font-black uppercase tracking-tight text-primary text-[10px] leading-none mb-0.5">{state.name}</p>
                    <p className="text-accent font-black text-[8px]">{state.price}</p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
