'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, WandSparkles, Trophy, ListChecks } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Carousel from '@/components/ui/Carousel';
import type { CarouselItem } from '@/components/ui/Carousel';

const featureItems: CarouselItem[] = [
  {
    id: 1,
    title: "AI-Powered Task Generation",
    description: "Describe your goals and let our AI generate actionable tasks for you instantly.",
    icon: <WandSparkles className="carousel-icon" />,
  },
  {
    id: 2,
    title: "Performance Leaderboard",
    description: "Track team performance with a gamified leaderboard to boost motivation and productivity.",
    icon: <Trophy className="carousel-icon" />,
  },
  {
    id: 3,
    title: "Interactive Checklists",
    description: "Break down complex tasks into manageable sub-tasks with our interactive checklists.",
    icon: <ListChecks className="carousel-icon" />,
  },
];


export default function SignInPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(UserRole.DIREKTUR_UTAMA);

  useEffect(() => {
    // Clear only session-level user data, keep persistent data in localStorage
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('selectedRole');
  }, []);

  const handleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Store the newly selected role in session storage to be picked up by the layout
    sessionStorage.setItem('selectedRole', role);
    router.push('/dashboard');
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
       <div className='mb-8'>
         <Carousel
          items={featureItems}
          baseWidth={280}
          loop={true}
          autoplay={true}
          autoplayDelay={4000}
        />
      </div>
      <div className="w-full rounded-2xl bg-card/60 backdrop-blur-lg shadow-2xl border border-white/10 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-headline">Simulasi Login</h2>
            <p className="text-sm text-muted-foreground">
              Pilih peran untuk melihat dasbor yang sesuai.
            </p>
          </div>

          <div className="space-y-4">
            {/* Role Selector for Simulation */}
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                    <SelectTrigger className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground">
                        <SelectValue placeholder="Pilih peran untuk simulasi" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={UserRole.JURNALIS}>Level 1: Jurnalis (Karyawan)</SelectItem>
                        <SelectItem value={UserRole.DIREKTUR_OPERASIONAL}>Level 2: Direktur Operasional</SelectItem>
                        <SelectItem value={UserRole.DIREKTUR_UTAMA}>Level 3: Direktur Utama (Super User)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button
              onClick={handleSignIn}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
            >
              Masuk
            </Button>
          </div>

           <Card className="bg-secondary/50 border-none mt-6">
            <CardHeader className='p-4'>
              <CardTitle className="text-sm text-center">Informasi Akun Simulasi</CardTitle>
            </CardHeader>
            <CardContent className='p-4 pt-0 text-xs text-muted-foreground space-y-2'>
                <p><span className='font-bold'>Level 3 (Super User):</span> Direktur Utama</p>
                <p><span className='font-bold'>Email:</span> naufal@kreatask.com</p>
                <p><span className='font-bold'>Level 2 (Direktur):</span> Direktur Operasional</p>
                 <p><span className='font-bold'>Email:</span> deva@kreatask.com</p>
                <p><span className='font-bold'>Level 1 (Karyawan):</span> Jurnalis</p>
                <p><span className='font-bold'>Email:</span> agus@kreatask.com</p>
                <p className='pt-2'>*Gunakan dropdown di atas untuk memilih peran. Email & password tidak diperlukan untuk simulasi ini.</p>
            </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
}
