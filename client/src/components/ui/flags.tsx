import { useId } from "react";

export const SpainFlag = ({ className = "w-6 h-6" }: { className?: string }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <clipPath id={`spain-${id}`}>
          <circle cx="18" cy="18" r="18"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#spain-${id})`}>
        <rect fill="#C60A1D" width="36" height="36"/>
        <rect fill="#FFC400" y="9" width="36" height="18"/>
      </g>
    </svg>
  );
};

export const USAFlag = ({ className = "w-6 h-6" }: { className?: string }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <clipPath id={`usa-${id}`}>
          <circle cx="18" cy="18" r="18"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#usa-${id})`}>
        <rect fill="#B22234" width="36" height="36"/>
        <rect fill="#FFFFFF" y="2.77" width="36" height="2.77"/>
        <rect fill="#FFFFFF" y="8.31" width="36" height="2.77"/>
        <rect fill="#FFFFFF" y="13.85" width="36" height="2.77"/>
        <rect fill="#FFFFFF" y="19.39" width="36" height="2.77"/>
        <rect fill="#FFFFFF" y="24.93" width="36" height="2.77"/>
        <rect fill="#FFFFFF" y="30.47" width="36" height="2.77"/>
        <rect fill="#3C3B6E" width="14.4" height="19.39"/>
      </g>
    </svg>
  );
};

export const CatalanFlag = ({ className = "w-6 h-6" }: { className?: string }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <clipPath id={`catalan-${id}`}>
          <circle cx="18" cy="18" r="18"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#catalan-${id})`}>
        <rect fill="#FCDD09" width="36" height="36"/>
        <rect fill="#DA121A" y="0" width="36" height="4"/>
        <rect fill="#DA121A" y="8" width="36" height="4"/>
        <rect fill="#DA121A" y="16" width="36" height="4"/>
        <rect fill="#DA121A" y="24" width="36" height="4"/>
        <rect fill="#DA121A" y="32" width="36" height="4"/>
        <polygon fill="#004B87" points="0,0 18,18 0,36"/>
        <polygon fill="#FFFFFF" points="6,18 8.47,14.2 4.1,16.1 7.9,16.1 3.53,14.2" transform="translate(0, 0)"/>
        <path fill="#FFFFFF" d="M6,10.5 L7.1,13.9 L10.5,13.9 L7.7,16.1 L8.8,19.5 L6,17.3 L3.2,19.5 L4.3,16.1 L1.5,13.9 L4.9,13.9 Z"/>
      </g>
    </svg>
  );
};
