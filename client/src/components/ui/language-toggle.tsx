import { Check } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { SpainFlag, USAFlag, CatalanFlag, FranceFlag, GermanyFlag, ItalyFlag, PortugalFlag } from "@/components/ui/flags";

const SpainFlagSmall = () => <SpainFlag className="w-5 h-5" />;
const USAFlagSmall = () => <USAFlag className="w-5 h-5" />;
const CatalanFlagSmall = () => <CatalanFlag className="w-5 h-5" />;
const FranceFlagSmall = () => <FranceFlag className="w-5 h-5" />;
const GermanyFlagSmall = () => <GermanyFlag className="w-5 h-5" />;
const ItalyFlagSmall = () => <ItalyFlag className="w-5 h-5" />;
const PortugalFlagSmall = () => <PortugalFlag className="w-5 h-5" />;

const languages = [
  { code: "es", label: "Español", Flag: SpainFlagSmall },
  { code: "en", label: "English", Flag: USAFlagSmall },
  { code: "ca", label: "Català", Flag: CatalanFlagSmall },
  { code: "fr", label: "Français", Flag: FranceFlagSmall },
  { code: "de", label: "Deutsch", Flag: GermanyFlagSmall },
  { code: "it", label: "Italiano", Flag: ItalyFlagSmall },
  { code: "pt", label: "Português", Flag: PortugalFlagSmall }
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
          className="relative bg-card dark:bg-card border-border rounded-full overflow-hidden"
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
