
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    // Outer container to center the mock phone UI
    <div className="flex justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-800 p-4">
      {/* Main Container styled like a mobile phone */}
      <div className="relative w-full max-w-sm h-[800px] flex flex-col bg-white dark:bg-slate-900 rounded-[30px] shadow-2xl overflow-hidden">

        {/* Background Image Section */}
        <div className="absolute top-0 left-0 right-0 h-1/2 z-0">
            <Image
              src="https://picsum.photos/seed/101/400/400"
              alt="Abstract background"
              layout="fill"
              objectFit="cover"
              className="opacity-20"
              data-ai-hint="abstract background"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent"></div>
        </div>

        {/* Top Section with small logo and name */}
        <div className="text-center p-8 relative z-10">
            <Image 
                src="/sounds/logo2.png" 
                alt="KreaTask Logo Small" 
                width={40} 
                height={40} 
                className="mx-auto filter dark:invert" 
            />
            <h1 className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">KreaTask</h1>
        </div>

        {/* Main Content with big logo */}
        <div className="flex-grow flex justify-center items-center relative z-10">
            <Image 
                src="/sounds/logo2.png" 
                alt="KreaTask Logo Main" 
                width={150} 
                height={150} 
                className="dark:invert"
            />
        </div>

        {/* Bottom Section with tagline and buttons */}
        <div className="bg-slate-800 dark:bg-slate-950 text-white p-8 rounded-t-[30px] text-center relative z-10 -mt-[30px]">
            <h2 className="text-3xl font-bold mb-8">
                Let Your Ideas Come True
            </h2>
            <div className="space-y-4">
              <Button asChild className="w-full rounded-full bg-white text-slate-900 hover:bg-slate-200" size="lg">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-full border-white/50 text-white hover:bg-white hover:text-slate-900" size="lg">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
