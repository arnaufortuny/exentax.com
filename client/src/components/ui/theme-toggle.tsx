import { Moon, Sun, Monitor, TreePine } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          data-testid="button-theme-toggle"
          className="relative bg-card dark:bg-card border-border rounded-full"
        >
          {resolvedTheme === "forest" ? (
            <TreePine className="h-4 w-4" />
          ) : (
            <>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          data-testid="menu-theme-light"
        >
          <Sun className="mr-2 h-4 w-4" />
          {t("theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          data-testid="menu-theme-dark"
        >
          <Moon className="mr-2 h-4 w-4" />
          {t("theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("forest")}
          data-testid="menu-theme-forest"
        >
          <TreePine className="mr-2 h-4 w-4" />
          {t("theme.forest")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          data-testid="menu-theme-system"
        >
          <Monitor className="mr-2 h-4 w-4" />
          {t("theme.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
