
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/providers/language-provider';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import BlurText from '@/components/ui/blur-text';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { t } = useLanguage();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is loaded and exists, redirect to dashboard
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // While loading, we can show a blank page or a spinner
  if (isUserLoading || user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            {/* Loading or redirecting... */}
        </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">

      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0" 
        style={{ backgroundImage: "url('/sounds/bg-auth.png')" }}
      >
          <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center p-4">
        <Image
          src="/sounds/logo2.png"
          alt="KreaTask Logo"
          width={80}
          height={80}
          className="mb-4"
        />
        <BlurText 
            text={t('landing.welcome')}
            delay={100}
            className="text-4xl md:text-5xl font-bold font-headline text-white drop-shadow-lg"
            animateBy="words"
        />

        <p className="mt-4 max-w-lg md:max-w-xl text-base md:text-lg text-neutral-200 drop-shadow-md">
          {t('landing.tagline')}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Button asChild className="w-full sm:w-1/2 h-12 text-base transition-all active:scale-95" size="lg">
            <Link href="/signin">{t('landing.login')}</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-1/2 h-12 text-base transition-all active:scale-95" size="lg">
            <Link href="/signup">{t('landing.register')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
