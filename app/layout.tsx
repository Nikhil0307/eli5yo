// app/layout.tsx
// NO 'use client' directive here, making it a Server Component by default

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './contexts/ThemeContext'; // Import from your context file

const inter = Inter({ subsets: ["latin"], display: 'swap' });

// Static metadata CAN be defined here because RootLayout is a Server Component
export const metadata = {
  title: "ELI5YO - AI Explainer",
  description: "Simplify complex topics with AI, explained like you're five.",
  // viewport: 'width=device-width, initial-scale=1', // Next.js usually adds a default
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // data-theme will be set on <html> by the ThemeProvider client component's effect
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider> {/* ThemeProvider is a Client Component wrapping children */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
