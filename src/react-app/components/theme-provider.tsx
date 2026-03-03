import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  effectiveTheme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  effectiveTheme: "system",
  setTheme: () => null,
}

const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => localStorage.getItem(storageKey) as Theme || defaultTheme
  );
  const [effectiveTheme, setEffectiveTheme] = useState<Theme>(theme === "system" ? getSystemTheme() : theme);

  useEffect(() => {
    const updateSystemTheme = () => {
      const newSystemTheme = getSystemTheme();
      if (theme === "system") {
        setEffectiveTheme(newSystemTheme);
      }
    };

    // Listen for changes in the system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener('change', updateSystemTheme);

    // Call this function so the state gets updated with the initial system theme
    updateSystemTheme();

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme);
    };
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  const value = {
    theme,
    effectiveTheme, // provide effectiveTheme in the context
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
      if (newTheme === "system") {
        setEffectiveTheme(getSystemTheme());
      } else {
        setEffectiveTheme(newTheme);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}