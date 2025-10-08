
import { ReactNode } from 'react';
import { LanguageProvider } from '@/providers/language-provider';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
        {children}
      </div>
    </LanguageProvider>
  );
}
