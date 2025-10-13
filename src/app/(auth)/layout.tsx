
import { ReactNode } from 'react';
import { LanguageProvider } from '@/providers/language-provider';
import Aurora from '@/components/Aurora';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <LanguageProvider>
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Aurora
              colorStops={["#172554", "#166534", "#172554"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="relative z-10 w-full">
              {children}
          </div>
        </div>
      </LanguageProvider>
    </FirebaseClientProvider>
  );
}
