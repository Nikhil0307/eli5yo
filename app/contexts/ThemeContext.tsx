// app/contexts/ThemeContext.tsx
'use client'; // This whole module is client-side

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light'); // Default to light

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let initialTheme: Theme = 'light';
    if (storedTheme) {
      initialTheme = storedTheme;
    } else if (systemPrefersDark) {
      initialTheme = 'dark';
    }
    setTheme(initialTheme);
    // Set attribute on mount after determining initial theme
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []); // Run only on mount to determine initial theme

  useEffect(() => {
    // This effect runs when `theme` state changes *after initial mount*,
    // to update attribute and localStorage
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder or nothing to avoid hydration mismatch on initial server render
    return <div style={{ width: '2.5rem', height: '2.5rem' }} aria-hidden="true" />;
  }

  return (
    <button
      key={theme} // Helps ensure re-render on theme change if styles depend on it
      onClick={toggleTheme}
      style={{
        background: 'transparent',
        color: 'var(--text-secondary)',
        border: 'none',
        padding: '0.5rem',
        borderRadius: 'var(--border-radius-md)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.5rem',
        height: '2.5rem',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
    </button>
  );
}
