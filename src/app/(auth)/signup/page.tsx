'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User } from 'lucide-react';

export default function SignUpPage() {
    const router = useRouter();

    const handleSignUp = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
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
                    <Button variant="secondary" asChild className="rounded-full px-6 bg-background shadow-md">
                        <Link href="/signup">Sign up</Link>
                    </Button>
                    <Button variant="ghost" asChild className="rounded-full px-6 text-muted-foreground">
                        <Link href="/signin">Sign in</Link>
                    </Button>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold font-headline">Create an account</h1>
                    <p className="text-muted-foreground">Let's get you started!</p>
                </div>

                <form className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                        type="text"
                        placeholder="Your Name"
                        className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                        type="password"
                        placeholder="Password"
                        className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                        />
                    </div>
                    <Button
                        onClick={handleSignUp}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
                    >
                        Create Account
                    </Button>
                </form>
                
                <p className="text-center text-xs text-muted-foreground !mt-8">
                    By creating an account, you agree to our Terms & Service
                </p>
            </div>
        </div>
    </div>
  );
}
