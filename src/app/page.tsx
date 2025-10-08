
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-slate-900">
      {/* Top Section with Background Image */}
      <div className="relative h-[60vh] flex flex-col items-center justify-center pt-12">
        {/* Background Image */}
        <Image
          src="https://picsum.photos/seed/101/1200/800"
          alt="Abstract background"
          layout="fill"
          objectFit="cover"
          className="opacity-20"
          data-ai-hint="abstract background"
        />

        {/* Logo and App Name */}
        <div className="relative z-10 flex flex-col items-center text-center text-white">
          <Image src="/sounds/logo2.png" alt="KreaTask Logo" width={100} height={100} className="mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
            KreaTask
          </h1>
        </div>
      </div>
      
      {/* Curved Divider */}
      <div className="absolute top-[55vh] left-0 w-full h-20 bg-transparent overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[150px] bg-slate-900 rounded-t-[100%]"></div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-900">
        <div className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Let Your Ideas Come True
            </h2>
            <p className="text-md text-muted-foreground mb-10">
              Organize Your Ideas, Accomplish Your Goals.
            </p>

            <div className="space-y-4">
              <Button asChild className="w-full rounded-full bg-white text-slate-900 hover:bg-slate-200" size="lg">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-full border-white/50 text-white hover:bg-white/10 hover:text-white" size="lg">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
