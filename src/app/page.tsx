
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
      <main className="relative z-10 flex flex-col items-center justify-center text-center p-8">
        
        <Image
          src="/sounds/logo2.png"
          alt="KreaTask Logo"
          width={120}
          height={120}
          className="mb-8"
        />
        
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-4">
          Selamat Datang di KreaTask
        </h1>
        
        <p className="text-md md:text-lg text-muted-foreground max-w-xl mb-12">
          Platform Kolaborasi untuk Mengubah Ide menjadi Karya Nyata.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Button
            onClick={() => router.push('/auth/signin')}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            Masuk
          </Button>
          <Button
            onClick={() => router.push('/auth/signup')}
            variant="outline"
            className="w-full h-12 text-lg font-semibold bg-transparent border-foreground/50 hover:bg-foreground/10 hover:text-foreground rounded-full"
          >
            Daftar
          </Button>
        </div>
      </main>
    </div>
  );
}
