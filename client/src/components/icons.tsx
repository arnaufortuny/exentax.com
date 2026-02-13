import type { SVGProps, ReactNode } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

function Icon({ children, className, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function Home({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </Icon>
  );
}

export function ArrowRight({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </Icon>
  );
}

export function ArrowLeft({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M19 12H5" />
      <path d="M11 19l-7-7 7-7" />
    </Icon>
  );
}

export function Check({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M20 6L9 17l-5-5" />
    </Icon>
  );
}

export function CheckCircle({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </Icon>
  );
}

export function CheckCircle2({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </Icon>
  );
}

export function ChevronDown({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function ChevronUp({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M6 15l6-6 6 6" />
    </Icon>
  );
}

export function ChevronRight({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function ChevronLeft({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M15 6l-6 6 6 6" />
    </Icon>
  );
}

export function Briefcase({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </Icon>
  );
}

export function HelpCircle({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.8.6-1.5 1.2-1.5 2" />
      <circle cx="12" cy="17" r="0.5" />
    </Icon>
  );
}

export function Share2({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.5 11l6-4" />
      <path d="M8.5 13l6 4" />
    </Icon>
  );
}

export function TrendingDown({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M3 7h6l4 6 6-8" />
      <path d="M21 21H3V3" />
    </Icon>
  );
}

export function Clock({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </Icon>
  );
}

export function Send({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </Icon>
  );
}

export function Eye({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOff({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M17.9 17.9C16.1 19.1 14.1 20 12 20 6 20 2 12 2 12c1.2-2 2.7-3.6 4.4-4.9" />
      <path d="M22 12s-4-7-10-7c-1.6 0-3 .3-4.3 1" />
      <path d="M1 1l22 22" />
    </Icon>
  );
}

export function Loader2({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10" />
    </svg>
  );
}

export function Building2({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 7h2M11 7h2M15 7h2" />
      <path d="M7 11h2M11 11h2M15 11h2" />
      <path d="M10 21v-4h4v4" />
    </Icon>
  );
}

export function FileDown({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 11v6" />
      <path d="M9 14l3 3 3-3" />
    </Icon>
  );
}

export function Trash2({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <rect x="6" y="6" width="12" height="14" rx="2" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}

export function Plus({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function PlusCircle({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </Icon>
  );
}

export function Globe({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 4 3 14 0 18" />
      <path d="M12 3c-3 4-3 14 0 18" />
    </Icon>
  );
}

export function MapPin({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  );
}

export function Download({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 4v10" />
      <path d="M8 10l4 4 4-4" />
      <path d="M4 20h16" />
    </Icon>
  );
}

export function Edit({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M3 17.25V21h3.75L19.81 7.94l-3.75-3.75L3 17.25z" />
      <path d="M14.06 4.19l3.75 3.75" />
    </Icon>
  );
}

export function Edit2({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M3 17.25V21h3.75L19.81 7.94l-3.75-3.75L3 17.25z" />
      <path d="M14.06 4.19l3.75 3.75" />
    </Icon>
  );
}

export function Search({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </Icon>
  );
}

export function LogOut({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M9 21H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5" />
      <path d="M15 17l6-5-6-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function Upload({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 20V10" />
      <path d="M8 14l4-4 4 4" />
      <path d="M4 4h16" />
    </Icon>
  );
}

export function DollarSign({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 2v20" />
      <path d="M17 6a4 4 0 0 0-4-2H10a4 4 0 0 0 0 8h4a4 4 0 0 1 0 8H7" />
    </Icon>
  );
}

export function BarChart3({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-6" />
      <path d="M22 20H2" />
    </Icon>
  );
}

export function TrendingUp({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 8h6v6" />
    </Icon>
  );
}

export function Receipt({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </Icon>
  );
}

export function Tag({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M20 12l-8 8-10-10V2h8l10 10z" />
      <circle cx="7" cy="7" r="1.5" />
    </Icon>
  );
}


export function Archive({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="3" y="3" width="18" height="6" />
      <path d="M5 9v11h14V9" />
      <path d="M10 13h4" />
    </Icon>
  );
}

export function Key({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="7" cy="17" r="3" />
      <path d="M10 17h11l-2-2 2-2h-3" />
    </Icon>
  );
}

export function UserCheck({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="9" cy="7" r="4" />
      <path d="M17 11l2 2 4-4" />
      <path d="M3 21a6 6 0 0 1 12 0" />
    </Icon>
  );
}

export function Users({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="9" cy="7" r="4" />
      <circle cx="17" cy="11" r="3" />
      <path d="M3 21a6 6 0 0 1 12 0" />
      <path d="M14 21a5 5 0 0 1 7 0" />
    </Icon>
  );
}

export function AlertCircle({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <circle cx="12" cy="16" r="1" />
    </Icon>
  );
}

export function AlertTriangle({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 3L2 19h20L12 3z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="17" r="1" />
    </Icon>
  );
}

export function RefreshCw({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </Icon>
  );
}

export function Wrench({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M14 7l3-3 3 3-3 3" />
      <path d="M11 10l7 7-3 3-7-7" />
      <path d="M4 20l3-3" />
    </Icon>
  );
}

export function Sparkles({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" />
      <path d="M20 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </Icon>
  );
}

export function Package({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7l8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </Icon>
  );
}

export function MessageSquare({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" />
    </Icon>
  );
}

export function BellRing({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M20 17H4C4 17 5.5 14.5 5.5 10.5C5.5 6.5 8 4 12 4C16 4 18.5 6.5 18.5 10.5C18.5 14.5 20 17 20 17Z" />
      <path d="M9 4C9 2.8 10.2 2 12 2C13.8 2 15 2.8 15 4" />
      <circle cx="12" cy="20" r="2" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function Bell({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M20 17H4C4 17 5.5 14.5 5.5 10.5C5.5 6.5 8 4 12 4C16 4 18.5 6.5 18.5 10.5C18.5 14.5 20 17 20 17Z" />
      <path d="M9 4C9 2.8 10.2 2 12 2C13.8 2 15 2.8 15 4" />
      <circle cx="12" cy="20" r="2" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function Mail({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Icon>
  );
}

export function FileText({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6M9 9h2" />
    </Icon>
  );
}

export function CreditCard({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h2M10 15h4" />
    </Icon>
  );
}

export function Calendar({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Icon>
  );
}

export function Calculator({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <rect x="8" y="6" width="8" height="3" rx="1" />
      <path d="M8 12h2M14 12h2M8 16h2M14 16h2" />
    </Icon>
  );
}

export function User({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="7" r="5" />
      <path d="M3 21C3 16.58 6.58 14 12 14C17.42 14 21 16.58 21 21" />
    </Icon>
  );
}

export function Filter({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </Icon>
  );
}

export function Shield({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
      <path d="M9.5 12l1.8 1.8L14.5 10.5" />
    </Icon>
  );
}

export function ShieldAlert({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
      <path d="M12 8v4" />
      <circle cx="12" cy="16" r="1" />
    </Icon>
  );
}

export function ShieldCheck({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
      <path d="M9.5 12l1.8 1.8L14.5 10.5" />
    </Icon>
  );
}

export function X({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </Icon>
  );
}

export function XCircle({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6" />
      <path d="M9 9l6 6" />
    </Icon>
  );
}

export function Phone({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </Icon>
  );
}

export function Newspaper({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18H4z" />
      <path d="M8 6h8M8 10h8M8 14h4" />
    </Icon>
  );
}

export function ClipboardList({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 2v2h6V2" />
      <path d="M9 10h6M9 14h6M9 18h4" />
    </Icon>
  );
}

export function Copy({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Icon>
  );
}

export function Video({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M22 8l-6 4 6 4V8z" />
    </Icon>
  );
}

export function MessageCircle({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </Icon>
  );
}

export function Heart({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.3l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </Icon>
  );
}

export function Lightbulb({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </Icon>
  );
}

export function Info({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <circle cx="12" cy="8" r="1" />
    </Icon>
  );
}

export function FileUp({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 17v-6" />
      <path d="M9 14l3-3 3 3" />
    </Icon>
  );
}

export function Circle({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
    </Icon>
  );
}

export function Menu({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Icon>
  );
}

export function Instagram({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <circle cx="17.5" cy="6.5" r="1.5" />
    </Icon>
  );
}

export function Sun({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </Icon>
  );
}

export function Moon({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Icon>
  );
}

export function Monitor({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </Icon>
  );
}

export function TreePine({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M17 22v-2" />
      <path d="M7 22v-2" />
      <path d="M12 2L7 7h3L6 12h3l-4 5h14l-4-5h3l-4-5h3z" />
      <path d="M12 22v-3" />
    </Icon>
  );
}

export function MoreHorizontal({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </Icon>
  );
}

export function Dot({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="2" />
    </Icon>
  );
}

export function PanelLeftIcon({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </Icon>
  );
}

export function Percent({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </Icon>
  );
}

export function RotateCcw({ className, ...props }: IconProps) {
  return (
    <Icon className={className} {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </Icon>
  );
}

