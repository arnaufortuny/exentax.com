import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "es", label: "Español", abbr: "ES" },
  { code: "en", label: "English", abbr: "EN" }
];

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          data-testid="button-language-toggle"
          className="relative bg-white dark:bg-zinc-900 border-border"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            data-testid={`menu-lang-${lang.code}`}
            className={i18n.language === lang.code ? "bg-accent/20" : ""}
          >
            <span className="mr-2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{lang.abbr}</span>
            {lang.label}
            {i18n.language === lang.code && <Check className="ml-auto h-4 w-4 text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
