import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
}

const THEME_COLORS: Record<Exclude<Theme, 'system'>, ThemeColors> = {
  light: {
    background: '#ffffff',
    text: '#1a1a1a',
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#fbbf24',
  },
};

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Get the actual theme (accounting for system preference)
  const actualTheme = theme === 'system' ? systemTheme : theme;

  // Update theme in DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme);
    const colors = THEME_COLORS[actualTheme];
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [actualTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  }, [setTheme]);

  return {
    theme,
    systemTheme,
    actualTheme,
    setTheme,
    toggleTheme,
    colors: THEME_COLORS[actualTheme],
  };
}

// Example usage:
/*
const {
  theme,
  actualTheme,
  setTheme,
  toggleTheme,
  colors
} = useTheme();

// Set specific theme
setTheme('dark');

// Toggle through themes (light -> dark -> system -> light)
toggleTheme();

// Use theme colors
<div style={{ backgroundColor: colors.background, color: colors.text }}>
  Themed content
</div>
*/ 