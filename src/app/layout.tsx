
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { LanguageProvider, useLanguage } from '@/providers/language-provider';
import { useEffect } from 'react';

export const metadata: Metadata = {
  title: 'KreaTask',
  description: 'Creative Task Management',
};

// This is a new Client Component to handle client-side logic like setting the 'lang' attribute.
function AppBody({ children }: { children: React.ReactNode }) {
  "use client";
  
  const { locale } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  
  return (
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
        )}
      >
        {children}
        <Toaster />
      </body>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
      </head>
      <LanguageProvider>
        <AppBody>{children}</AppBody>
      </LanguageProvider>
    </html>
  );
}
