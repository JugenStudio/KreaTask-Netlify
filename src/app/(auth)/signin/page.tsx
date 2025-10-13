
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear session-level user data on page load
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('selectedRole');
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Layanan autentikasi tidak tersedia.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // After successful sign-in, the onAuthStateChanged listener in the
      // provider will handle user state, and the layout will redirect to dashboard.
      router.push('/dashboard');
    } catch (firebaseError: any) {
      let errorMessage = "Terjadi kesalahan saat login. Silakan coba lagi.";
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Email atau password yang Anda masukkan salah.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid.';
          break;
        default:
          console.error("Firebase sign-in error:", firebaseError);
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="flex items-center gap-3 mb-6">
        <Image
          src="/sounds/logo2.png"
          alt="KreaTask Logo"
          width={40}
          height={40}
        />
        <h1 className="text-3xl font-headline font-bold text-foreground">
          KreaTask
        </h1>
      </div>
      
      <div className={cn("w-full rounded-2xl bg-card/60 backdrop-blur-lg shadow-2xl border border-white/10 overflow-hidden card-spotlight hover:border-primary/50 transition-colors")}>
        <form onSubmit={handleSignIn}>
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-headline">Selamat Datang</h2>
              <p className="text-sm text-muted-foreground">
                Masukkan email dan password Anda untuk masuk.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  />
              </div>

              <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  />
              </div>
              
              {error && <p className="text-sm text-center text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Masuk'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
