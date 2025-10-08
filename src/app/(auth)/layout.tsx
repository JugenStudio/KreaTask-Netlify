
import { ReactNode } from 'react';
import { LanguageProvider } from '@/providers/language-provider';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-transparent"></div>
        <div className="relative z-10 w-full">
            {children}
        </div>
      </div>
    </LanguageProvider>
  );
}
