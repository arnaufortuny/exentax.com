import { cn } from "@/lib/utils";

interface DashboardIconProps {
  name: 'tramites' | 'soporte' | 'calendar' | 'money' | 'notifications' | 'pagos' | 'facturas' | 'calculadora' | 'tracking';
  className?: string;
  size?: number;
}

export function DashboardIcon({ name, className, size = 48 }: DashboardIconProps) {
  const baseClass = cn("shrink-0 text-foreground", className);
  
  switch (name) {
    case 'tramites':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={baseClass}>
          <path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"/>
          <path d="M10 13l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'soporte':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={baseClass}>
          <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      );
    case 'calendar':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={baseClass}>
          <rect x="8" y="10" width="32" height="28" rx="6" fill="currentColor" className="opacity-20"/>
          <rect x="8" y="10" width="32" height="28" rx="6" stroke="currentColor" strokeWidth="2" className="opacity-70"/>
          <rect x="8" y="16" width="32" height="6" fill="currentColor" className="opacity-30"/>
          <circle cx="16" cy="28" r="2" fill="currentColor"/>
          <circle cx="24" cy="28" r="2" fill="currentColor"/>
          <circle cx="32" cy="28" r="2" fill="currentColor"/>
        </svg>
      );
    case 'money':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={baseClass}>
          <rect x="6" y="14" width="36" height="20" rx="6" fill="currentColor" className="opacity-20"/>
          <rect x="6" y="14" width="36" height="20" rx="6" stroke="currentColor" strokeWidth="2" className="opacity-70"/>
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2"/>
          <rect x="10" y="20" width="4" height="2" rx="1" fill="currentColor"/>
          <rect x="34" y="26" width="4" height="2" rx="1" fill="currentColor"/>
        </svg>
      );
    case 'notifications':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={baseClass}>
          <path d="M18 8a6 6 0 10-12 0c0 6-3 7-3 7h18s-3-1-3-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-70"/>
          <path d="M10 21h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'pagos':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={baseClass}>
          <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" className="opacity-70"/>
          <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'facturas':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={baseClass}>
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="opacity-70"/>
          <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'calculadora':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={baseClass}>
          <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="2" className="opacity-70"/>
          <path d="M8 6h8M8 10h2M12 10h2M8 14h2M12 14h2M8 18h8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'tracking':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={baseClass}>
          <circle cx="24" cy="24" r="16" fill="currentColor" className="opacity-20"/>
          <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" className="opacity-70"/>
          <line x1="24" y1="24" x2="24" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <line x1="24" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
}
