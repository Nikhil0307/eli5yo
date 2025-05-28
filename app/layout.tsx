// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Keep this import

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = { /* ... */ };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      {/* ADD THE CLASSES DIRECTLY HERE FOR TESTING */}
      <body className={`${inter.className} h-full flex flex-col bg-slate-900 text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}
