
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center bg-background">
        <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-8">
          {/* Background Image */}
          <Image
            src="https://picsum.photos/seed/99/1200/800"
            alt="Abstract background"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
            data-ai-hint="abstract background"
          />

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
            <div className="mb-8">
                <Image src="/sounds/logo2.png" alt="KreaTask Logo" width={80} height={80} />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-foreground">
              KreaTask
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-md mb-12">
              Organize Your Ideas, Accomplish Your Goals.
            </p>

            <div className="w-full max-w-xs space-y-4">
              <Button asChild className="w-full" size="lg">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full" size="lg">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
