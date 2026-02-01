import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

const SpainFlag = () => (
  <svg viewBox="0 0 36 36" className="w-5 h-5">
    <defs>
      <clipPath id="spainCircle">
        <circle cx="18" cy="18" r="18"/>
      </clipPath>
    </defs>
    <g clipPath="url(#spainCircle)">
      <rect fill="#C60A1D" width="36" height="36"/>
      <rect fill="#FFC400" y="9" width="36" height="18"/>
    </g>
  </svg>
);

const USAFlag = () => (
  <svg viewBox="0 0 36 36" className="w-5 h-5">
    <defs>
      <clipPath id="usaCircle">
        <circle cx="18" cy="18" r="18"/>
      </clipPath>
    </defs>
    <g clipPath="url(#usaCircle)">
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

const languages = [
  { code: "es", label: "Español", Flag: SpainFlag },
  { code: "en", label: "English", Flag: USAFlag }
];

export function LanguageToggle() {
  const { i18n } = useTranslation();

  // Handle language codes like "en-US" or "es-ES" by taking the first part
  const langCode = i18n.language?.split('-')[0] || 'es';
  const currentLang = languages.find(l => l.code === langCode) || languages[0];
  const CurrentFlag = currentLang.Flag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          data-testid="button-language-toggle"
          className="relative bg-white dark:bg-zinc-900 border-border rounded-full overflow-hidden"
        >
          <CurrentFlag />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            data-testid={`menu-lang-${lang.code}`}
            className={langCode === lang.code ? "bg-accent/20" : ""}
          >
            <span className="mr-2">
              <lang.Flag />
            </span>
            {lang.label}
            {langCode === lang.code && <Check className="ml-auto h-4 w-4 text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
