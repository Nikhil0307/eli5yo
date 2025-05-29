// app/layout.tsx
// REMOVE 'use client' from here if ThemeProvider and its logic are moved out.
// RootLayout can often be a Server Component if all client logic is in providers/children.
// However, if ThemeProvider needs to be a direct child of body for some reason and
// you need access to theme early, it might need to stay client.
// For now, let's assume RootLayout can be a Server Component.

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './contexts/ThemeContext'; // Import from the new location

const inter = Inter({ subsets: ["latin"], display: 'swap' });

// If RootLayout is a Server Component, you can define static metadata here
export const metadata = {
  title: "ELI5YO - AI Explainer",
  description: "Simplify complex topics with AI, explained like you're five.",
  // Add viewport if Next.js isn't adding it, or to customize
  // viewport: 'width=device-width, initial-scale=1',
};

// app/layout.tsx
// ... (imports and ThemeProvider definition as before) ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* NO WHITESPACE OR NEWLINES HERE that could become text nodes */}
      <head>
        {/*
          Next.js automatically handles injecting essential <head> elements.
          You can add custom <meta>, <link>, etc. tags here if needed.
          For example:
          <meta name="custom-tag" content="value" />
          <link rel="icon" href="/favicon.ico" />
        */}
        {/* title and description are better handled by `export const metadata` object */}
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
