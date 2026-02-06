import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  key: string;
  met: boolean;
}

function getPasswordRequirements(password: string): { score: number; requirements: PasswordRequirement[] } {
  const requirements: PasswordRequirement[] = [
    { key: "minLength", met: password.length >= 8 },
    { key: "hasUppercase", met: /[A-Z]/.test(password) },
    { key: "hasLowercase", met: /[a-z]/.test(password) },
    { key: "hasNumber", met: /[0-9]/.test(password) },
    { key: "hasSymbol", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const score = metCount;
  
  return { score, requirements };
}

export function PasswordStrength({ password, className = "" }: PasswordStrengthProps) {
  const { t } = useTranslation();
  
  const { score, requirements } = useMemo(() => getPasswordRequirements(password), [password]);
  
  const strengthLabel = useMemo(() => {
    if (password.length === 0) return "";
    if (score <= 1) return t("auth.passwordStrength.veryWeak");
    if (score === 2) return t("auth.passwordStrength.weak");
    if (score === 3) return t("auth.passwordStrength.fair");
    if (score === 4) return t("auth.passwordStrength.good");
    return t("auth.passwordStrength.strong");
  }, [score, password.length, t]);

  const strengthColor = useMemo(() => {
    if (password.length === 0) return "bg-gray-200 dark:bg-gray-700";
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-orange-500";
    if (score === 3) return "bg-yellow-500";
    if (score === 4) return "bg-lime-500";
    return "bg-green-500";
  }, [score, password.length]);

  const textColor = useMemo(() => {
    if (password.length === 0) return "text-muted-foreground";
    if (score <= 1) return "text-red-600 dark:text-red-400";
    if (score === 2) return "text-orange-600 dark:text-orange-400";
    if (score === 3) return "text-yellow-600 dark:text-yellow-400";
    if (score === 4) return "text-lime-600 dark:text-lime-400";
    return "text-green-600 dark:text-green-400";
  }, [score, password.length]);

  const requirementLabels: Record<string, string> = {
    minLength: t("auth.passwordStrength.minLength"),
    hasUppercase: t("auth.passwordStrength.hasUppercase"),
    hasLowercase: t("auth.passwordStrength.hasLowercase"),
    hasNumber: t("auth.passwordStrength.hasNumber"),
    hasSymbol: t("auth.passwordStrength.hasSymbol"),
  };

  if (password.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`} data-testid="password-strength-container">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out rounded-full ${strengthColor}`}
            style={{ width: `${(score / 5) * 100}%` }}
            data-testid="password-strength-bar"
          />
        </div>
        <span className={`text-xs font-semibold min-w-[60px] text-right ${textColor}`} data-testid="password-strength-label">
          {strengthLabel}
        </span>
      </div>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-3 gap-y-0.5">
        {requirements.map((req) => (
          <div 
            key={req.key} 
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              req.met 
                ? "text-green-600 dark:text-green-400" 
                : "text-muted-foreground"
            }`}
            data-testid={`password-requirement-${req.key}`}
          >
            {req.met ? (
              <Check className="w-3 h-3 flex-shrink-0" />
            ) : (
              <X className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="truncate">{requirementLabels[req.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
