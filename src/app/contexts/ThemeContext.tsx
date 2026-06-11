import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export const themeTokens = {
  light: {
    colors: {
      background: '#ffffff',
      surface: '#ffffff',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      card: '#ffffff',
      primary: '#2563eb',
    },
  },
  dark: {
    colors: {
      background: '#121212',
      surface: '#1e1e1e',
      textPrimary: '#f5f5f5',
      textSecondary: '#b3b3b3',
      border: '#2f2f2f',
      card: '#1e1e1e',
      primary: '#60a5fa',
    },
  },
} as const;

export type ThemeColors = (typeof themeTokens)[ThemeMode]['colors'];

interface ThemeContextType {
  isDark: boolean;
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'settings_dark';

function readStoredTheme() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'true';
}

function syncDocumentTheme(dark: boolean) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  document.body?.classList.toggle('dark', dark);

  let metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.name = 'theme-color';
    document.head.appendChild(metaTheme);
  }
  metaTheme.content = dark ? themeTokens.dark.colors.background : themeTokens.light.colors.background;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = readStoredTheme();
    syncDocumentTheme(stored);
    return stored;
  });

  useEffect(() => {
    syncDocumentTheme(isDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    syncDocumentTheme(dark);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(dark));
    setIsDark(dark);
  };

  const toggleTheme = () => applyTheme(!isDark);
  const setTheme = (dark: boolean) => applyTheme(dark);
  const mode: ThemeMode = isDark ? 'dark' : 'light';
  const value = useMemo(
    () => ({ isDark, mode, colors: themeTokens[mode].colors, toggleTheme, setTheme }),
    [isDark, mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
