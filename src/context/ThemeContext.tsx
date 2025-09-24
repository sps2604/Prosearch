import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPrefersDark(): boolean {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("ps-theme");
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return "system";
  });

  const resolvedTheme = useMemo(() => {
    if (theme === "system") return getSystemPrefersDark() ? "dark" : "light";
    return theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("ps-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    // Ensure we always start from a known state
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    if (resolvedTheme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    const listener = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        if (e.matches) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [resolvedTheme, theme]);

  const toggleDarkMode = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, toggleDarkMode }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}


