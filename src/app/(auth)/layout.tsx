'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageProvider } from '@/providers/language-provider';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showBackButton = pathname !== '/landing';

  return (
    <LanguageProvider>
      <div className="min-h-screen w-full flex flex-col bg-background p-4">
        
        {/* Area Header untuk Tombol Back */}
        <header className="w-full h-16 flex items-center">
          {showBackButton && (
            <div className="z-20">
              <Button variant="outline" size="icon" asChild className="rounded-full">
                  <Link href="/landing">
                      <ArrowLeft className="h-5 w-5" />
                      <span className="sr-only">Kembali ke Landing Page</span>
                  </Link>
              </Button>
            </div>
          )}
        </header>

        {/* Area Konten Utama */}
        <main className="w-full flex-grow flex items-center justify-center -mt-16">
            {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
