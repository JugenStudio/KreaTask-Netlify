'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { UserRole, type User } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      setError("Layanan autentikasi atau database tidak tersedia.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Update the user's profile in Firebase Auth (displayName, photoURL)
      await updateProfile(firebaseUser, {
        displayName: name,
        photoURL: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
      });

      // 3. Create a new document for the user in the 'users' collection in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        avatarUrl: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
        role: UserRole.UNASSIGNED, // Default role for new users
        jabatan: 'Unassigned',
      };
      
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      await setDoc(userDocRef, newUser);

      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Selamat datang di KreaTask!",
      });

      // Redirect to the dashboard
      router.push('/dashboard');

    } catch (firebaseError: any) {
      let errorMessage = "Gagal mendaftar. Silakan coba lagi.";
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email ini sudah digunakan oleh akun lain.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid.';
          break;
        default:
          console.error("Firebase sign-up error:", firebaseError);
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
            <Image src="/sounds/logo2.png" alt="KreaTask Logo" width={40} height={40} />
            <h1 className="text-3xl font-headline font-bold text-foreground">KreaTask</h1>
        </div>
        <div className={cn("w-full rounded-2xl bg-card/60 backdrop-blur-lg shadow-2xl border border-white/10 overflow-hidden card-spotlight hover:border-primary/50 transition-colors")}>
             <form onSubmit={handleSignUp}>
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-center bg-secondary/80 rounded-full p-1 max-w-fit mx-auto">
                        <Button variant="secondary" asChild className="rounded-full px-6 bg-background shadow-md">
                            <Link href="/signup">Daftar</Link>
                        </Button>
                        <Button variant="ghost" asChild className="rounded-full px-6 text-muted-foreground">
                            <Link href="/signin">Masuk</Link>
                        </Button>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold font-headline">Buat Akun</h1>
                        <p className="text-muted-foreground text-sm">Mari kita mulai!</p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type="text"
                            placeholder="Nama Lengkap Anda"
                            className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type="email"
                            placeholder="anda@contoh.com"
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
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mendaftar...
                                </>
                            ) : 'Buat Akun'}
                        </Button>
                    </div>
                    
                    <p className="text-center text-xs text-muted-foreground !mt-8">
                        Dengan membuat akun, Anda setuju dengan Syarat & Layanan kami.
                    </p>
                </div>
            </form>
        </div>
    </div>
  );
}
