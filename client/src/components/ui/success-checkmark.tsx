interface SuccessCheckmarkProps {
  size?: number;
  className?: string;
}

export function SuccessCheckmark({ size = 120, className = "" }: SuccessCheckmarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-success-svg ${className}`}
    >
      <circle
        cx="60"
        cy="60"
        r="52"
        stroke="#22C55E"
        strokeWidth="2"
        opacity="0.25"
        className="animate-success-circle-outer"
      />
      <circle
        cx="60"
        cy="60"
        r="40"
        stroke="#22C55E"
        strokeWidth="3"
        fill="none"
        className="animate-success-circle-inner"
      />
      <path
        d="M42 60 L55 72 L80 47"
        stroke="#22C55E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-success-check"
      />
    </svg>
  );
}
