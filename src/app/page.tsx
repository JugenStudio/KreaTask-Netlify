
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Image src="/sounds/logo2.png" alt="KreaTask Logo" width={150} height={150} className="mx-auto dark:invert" />
        <h1 className="text-4xl font-bold font-headline">Welcome to KreaTask</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Your creative task management solution. Let your ideas come true.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
