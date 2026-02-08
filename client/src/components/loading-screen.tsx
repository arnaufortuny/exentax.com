import { useState, useEffect } from "react";
import logoIcon from "@/assets/logo-icon.png";

interface LoadingScreenProps {
  delay?: number;
}

export function LoadingScreen({ delay = 150 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gpu-accelerated" data-testid="loading-screen">
      <img 
        src={logoIcon} 
        alt="Easy US LLC" 
        className="w-16 h-16 mb-6 opacity-90"
      />
      <div className="w-[280px] h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#6EDC8A] to-[#4FCF70] rounded-full loading-bar-animation" />
      </div>
    </div>
  );
}
