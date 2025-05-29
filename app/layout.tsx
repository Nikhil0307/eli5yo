// app/layout.tsx
'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { MoonIcon, SunIcon } from 'lucide-react';

const inter = Inter({ subsets: ["latin"], display: 'swap' });

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

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light'); // Default to light

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light'); // Ensure default is set
    }
  }, []); // Run only on mount

  useEffect(() => {
    // This effect runs when `theme` state changes, to update attribute and localStorage
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The data-theme attribute is now set on <html> by the ThemeProvider's effect
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// This button component can be imported and used wherever you want the toggle
export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  // Initial render might not have theme from localStorage yet, so button might briefly show default
  // This is a common hydration issue with client-side theme switching.
  // Adding a key to the button based on theme can help force re-render once theme is determined.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) { // Don't render button until theme is resolved to prevent flash
    return <div style={{ width: '2.5rem', height: '2.5rem'}} />; // Placeholder or null
  }

  return (
    <button
      key={theme} // Force re-render when theme changes
      onClick={toggleTheme}
      style={{
        background: 'transparent', // Make it look like an icon button
        color: 'var(--text-secondary)',
        border: 'none',
        padding: '0.5rem',
        borderRadius: 'var(--border-radius-md)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.5rem', /* Fixed size for icon button */
        height: '2.5rem',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
    </button>
  );
}
