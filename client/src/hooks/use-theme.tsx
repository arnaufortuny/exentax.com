import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "forest" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | "forest";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "system",
  storageKey = "ui-theme" 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored === "light" || stored === "dark" || stored === "forest" || stored === "system") {
        return stored;
      }
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark" | "forest">("light");

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (t: "light" | "dark" | "forest") => {
      root.classList.remove("light", "dark", "forest");
      if (t === "forest") {
        root.classList.add("dark", "forest");
      } else {
        root.classList.add(t);
      }
      setResolvedTheme(t);
      const themeColors: Record<string, string> = { light: "#ffffff", dark: "#050505", forest: "#0A1F17" };
      const metaTags = document.querySelectorAll('meta[name="theme-color"]');
      metaTags.forEach(meta => meta.remove());
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = themeColors[t];
      document.head.appendChild(meta);
    };

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      applyTheme(systemTheme);

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
