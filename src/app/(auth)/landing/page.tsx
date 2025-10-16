
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/providers/language-provider';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { SessionData } from '@/lib/session';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LandingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, isLoading } = useSWR<SessionData>('/api/auth/session', fetcher);


  useEffect(() => {
    // If user is loaded and logged in, redirect to dashboard
    if (!isLoading && session?.isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [session, isLoading, router]);

  // While loading or if logged in, show a blank page to prevent flash of content
  if (isLoading || session?.isLoggedIn) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            {/* Loading or redirecting... */}
        </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
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
            className="text-4xl md:text-5xl font-bold font-headline text-foreground"
            animateBy="words"
        />

        <p className="mt-4 max-w-lg md:max-w-xl text-base md:text-lg text-muted-foreground">
          {t('landing.tagline')}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Button asChild className="w-full sm:w-1/2 h-12 text-base transition-all active:scale-95 rounded-full" size="lg">
            <Link href="/signin">{t('landing.login')}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-1/2 h-12 text-base transition-all active:scale-95 rounded-full" size="lg">
            <Link href="/signup">{t('landing.register')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
