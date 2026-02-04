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
      </g>
    </svg>
  );
};

export const UKFlag = ({ className = "w-6 h-6" }: { className?: string }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <clipPath id={`uk-${id}`}>
          <circle cx="18" cy="18" r="18"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#uk-${id})`}>
        <rect fill="#012169" width="36" height="36"/>
        <path fill="#FFFFFF" d="M0,0 L36,36 M36,0 L0,36" stroke="#FFFFFF" strokeWidth="6"/>
        <path fill="#C8102E" d="M0,0 L36,36 M36,0 L0,36" stroke="#C8102E" strokeWidth="2"/>
        <path fill="#FFFFFF" d="M18,0 L18,36 M0,18 L36,18" stroke="#FFFFFF" strokeWidth="10"/>
        <path fill="#C8102E" d="M18,0 L18,36 M0,18 L36,18" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
};

export const GermanyFlag = ({ className = "w-6 h-6" }: { className?: string }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <clipPath id={`germany-${id}`}>
          <circle cx="18" cy="18" r="18"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#germany-${id})`}>
        <rect fill="#000000" width="36" height="12"/>
        <rect fill="#DD0000" y="12" width="36" height="12"/>
        <rect fill="#FFCE00" y="24" width="36" height="12"/>
      </g>
    </svg>
  );
};

export const FranceFlag = ({ className = "w-6 h-6" }: { className?: string }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <clipPath id={`france-${id}`}>
          <circle cx="18" cy="18" r="18"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#france-${id})`}>
        <rect fill="#002395" width="12" height="36"/>
        <rect fill="#FFFFFF" x="12" width="12" height="36"/>
        <rect fill="#ED2939" x="24" width="12" height="36"/>
      </g>
    </svg>
  );
};

export const BulgariaFlag = ({ className = "w-6 h-6" }: { className?: string }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <clipPath id={`bulgaria-${id}`}>
          <circle cx="18" cy="18" r="18"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#bulgaria-${id})`}>
        <rect fill="#FFFFFF" width="36" height="12"/>
        <rect fill="#00966E" y="12" width="36" height="12"/>
        <rect fill="#D62612" y="24" width="36" height="12"/>
      </g>
    </svg>
  );
};
