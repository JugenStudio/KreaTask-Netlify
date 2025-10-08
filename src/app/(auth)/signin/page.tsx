'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-card/60 backdrop-blur-lg shadow-2xl border border-white/10 overflow-hidden">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-center bg-secondary/80 rounded-full p-1 max-w-fit mx-auto">
          <Button variant="ghost" asChild className="rounded-full px-6 text-muted-foreground">
            <Link href="/signup">Sign up</Link>
          </Button>
          <Button variant="secondary" asChild className="rounded-full px-6 bg-background shadow-md">
            <Link href="/signin">Sign in</Link>
          </Button>
        </div>

        <div className="text-left space-y-2">
          <h1 className="text-2xl font-bold font-headline">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" required className="bg-secondary/50 border-none pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required className="bg-secondary/50 border-none" />
          </div>
          <Button type="submit" className="w-full !mt-6 h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
            Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or sign in with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full h-12 text-md font-semibold bg-secondary/50 hover:bg-secondary border-none flex items-center justify-center gap-3 rounded-lg">
          <GoogleIcon />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground !mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create one
            </Link>
        </p>
      </div>
    </div>
  );
}
