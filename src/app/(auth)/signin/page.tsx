
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1682-1.8409H9v3.4818h4.8436c-.2082 1.125-.84 2.0782-1.7955 2.7218v2.2582h2.9082c1.7018-1.5664 2.6836-3.8736 2.6836-6.621z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-1.04 5.96-2.82l-2.91-2.26c-.8.54-1.82.86-2.94.86-2.26 0-4.2-1.52-4.88-3.54H1.07v2.33C2.5 16.58 5.51 18 9 18z" />
      <path fill="#FBBC05" d="M4.12 10.8c-.2-.6-.2-1.23 0-1.83V6.64H1.07A8.99 8.99 0 0 0 0 9.09c0 .98.16 1.92.44 2.82l3.68-2.11z" />
      <path fill="#EA4335" d="M9 3.54c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.69 11.43 0 9 0 5.51 0 2.5 2.42 1.07 5.36l3.05 2.33C4.8 5.06 6.74 3.54 9 3.54z" />
    </svg>
  );
}

export default function SignInPage() {
  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-lg">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Back to Home
      </Link>
      
      <div className="text-left">
        <h1 className="text-2xl font-bold font-headline">Welcome back</h1>
        <p className="text-muted-foreground">Login to your account</p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Username or email</Label>
          <Input id="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
            </div>
            <Link href="#" className="text-sm text-primary hover:underline">
                Forgot Password?
            </Link>
        </div>
        <Button type="submit" className="w-full !mt-6">
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full flex items-center gap-2">
        <GoogleIcon />
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
