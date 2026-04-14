"use client";

import * as React from "react";

export type ThemeChoice = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "raytonx-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeChoice) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeChoice>("system");
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      setThemeState(storedTheme);
      applyTheme(storedTheme);
      setHydrated(true);
      return;
    }

    applyTheme("system");
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }, [hydrated, theme]);

  React.useEffect(() => {
    if (theme !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
