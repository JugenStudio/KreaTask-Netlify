'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useLanguage } from '@/providers/language-provider';
import { signIn } from 'next-auth/react';

const signupSchema = z.object({
    name: z.string().min(1, "Nama lengkap diperlukan"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ name, email, password, confirmPassword });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
       const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Pendaftaran Gagal');
      }

      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Selamat datang di KreaTask!",
      });

      router.push('/dashboard');
      router.refresh();

    } catch (err: any) {
      let errorMessage = err.message || 'Gagal mendaftar. Silakan coba lagi.';
      if (err.message.includes('unique constraint')) {
        errorMessage = 'Email ini sudah digunakan oleh akun lain.';
      }
      setErrors({ form: errorMessage });
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signIn('google', { callbackUrl: '/dashboard', prompt: 'select_account' });
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center pt-8">
        <div className={cn("w-full rounded-2xl bg-card/60 backdrop-blur-lg shadow-2xl border border-white/10 overflow-hidden")}>
             <div className="p-8 space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="flex items-center justify-center bg-secondary/80 rounded-full p-1 max-w-fit mx-auto">
                         <Button variant="secondary" asChild className="rounded-full px-6 bg-primary text-primary-foreground shadow-md">
                            <Link href="/signup">{t('signup.signup_button')}</Link>
                        </Button>
                        <Button variant="ghost" asChild className="rounded-full px-6 text-muted-foreground">
                            <Link href="/signin">{t('signup.signin_button')}</Link>
                        </Button>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-bold font-headline">{t('signup.title')}</h1>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type="text"
                            placeholder={t('signup.name_placeholder')}
                            className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading || isGoogleLoading}
                            />
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type="email"
                            placeholder={t('signup.email_placeholder')}
                            className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading || isGoogleLoading}
                            />
                            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('signup.password_placeholder')}
                            className="pl-10 pr-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading || isGoogleLoading}
                            />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                        </div>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('signup.confirm_password_placeholder')}
                            className="pl-10 pr-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading || isGoogleLoading}
                            />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                        </div>

                         {errors.form && <p className="text-sm text-center text-destructive">{errors.form}</p>}
                        
                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-base"
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('signup.submit_button')}
                        </Button>
                    </div>
                </form>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        {t('signup.separator')}
                        </span>
                    </div>
                </div>
                
                <div className="px-8 pb-8">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 bg-background/50 border-white/20 hover:bg-background/80"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Image src="/google.svg" width={24} height={24} alt="Google logo" className="mr-2" />
                    )}
                    {t('signup.google_button')}
                </Button>
                      <p className="text-center text-xs text-muted-foreground mt-8">
                          {t('signup.terms')}
                      </p>
                </div>
            </div>
        </div>
    </div>
  );
}
