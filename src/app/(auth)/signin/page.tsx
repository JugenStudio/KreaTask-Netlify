'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="fill-current">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();

  const handleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Later, this will trigger the Google sign-in flow.
    // For now, we'll just navigate to the dashboard.
    router.push('/dashboard');
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
            <Image src="/sounds/logo2.png" alt="KreaTask Logo" width={40} height={40} />
            <h1 className="text-3xl font-headline font-bold text-foreground">KreaTask</h1>
        </div>
        <div className="w-full rounded-2xl bg-card/60 backdrop-blur-lg shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-center bg-secondary/80 rounded-full p-1 max-w-fit mx-auto">
                <Button variant="ghost" asChild className="rounded-full px-6 text-muted-foreground">
                    <Link href="/signup">Sign up</Link>
                </Button>
                <Button variant="secondary" asChild className="rounded-full px-6 bg-background shadow-md">
                    <Link href="/signin">Sign in</Link>
                </Button>
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold font-headline">Welcome Back</h1>
                  <p className="text-muted-foreground">Sign in to continue to your account.</p>
                </div>

                <div className="!mt-8">
                  <Button variant="outline" className="w-full h-12 text-md font-semibold bg-secondary/50 hover:bg-secondary border-none flex items-center justify-center gap-3 rounded-lg" onClick={handleSignIn}>
                    <GoogleIcon />
                    Continue with Google
                  </Button>
                </div>
                

                <p className="text-center text-sm text-muted-foreground !mt-8">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Create one
                    </Link>
                </p>
            </div>
        </div>
    </div>
  );
}
