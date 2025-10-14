
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Aurora from "@/components/Aurora";
import MetallicPaint, { parseLogoImage } from "@/components/MetallicPaint";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isLoadingLogo, setIsLoadingLogo] = useState(true);

  useEffect(() => {
    async function loadLogo() {
      setIsLoadingLogo(true);
      try {
        const response = await fetch('/logo-kreatask.svg');
        const blob = await response.blob();
        const file = new File([blob], "logo.svg", { type: blob.type });

        const parsedData = await parseLogoImage(file);
        setImageData(parsedData?.imageData ?? null);
      } catch (err) {
        console.error("Error loading logo:", err);
      } finally {
        setIsLoadingLogo(false);
      }
    }

    loadLogo();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Aurora
            colorStops={["#172554", "#166534", "#172554"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      
      <main className="relative z-10 flex flex-col items-center justify-center text-center p-8">
        <div className="mb-8 w-24 h-24">
          {isLoadingLogo ? (
            <div className="w-24 h-24 bg-muted/20 rounded-full animate-pulse"></div>
          ) : imageData ? (
             <MetallicPaint 
                imageData={imageData} 
                params={{ edge: 2, patternBlur: 0.005, patternScale: 2, refraction: 0.015, speed: 0.3, liquid: 0.07 }} 
              />
          ) : (
            <Image
                src="/sounds/logo2.png"
                alt="KreaTask Logo"
                width={80}
                height={80}
                className="mx-auto"
            />
          )}
        </div>
        
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
