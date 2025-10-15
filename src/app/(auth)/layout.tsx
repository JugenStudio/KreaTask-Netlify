
import { ReactNode } from 'react';
import Link from 'next/link';
import { LanguageProvider } from '@/providers/language-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <LanguageProvider>
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative">
          
          <div className="absolute top-4 left-4 z-20">
            <Button variant="outline" size="icon" asChild className="rounded-full">
                <Link href="/landing">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Kembali ke Landing Page</span>
                </Link>
            </Button>
          </div>

          <div className="relative z-10 w-full">
              {children}
          </div>
        </div>
      </LanguageProvider>
    </FirebaseClientProvider>
  );
}
