
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { users } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/components/bottom-nav";
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = users[0];
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // This layout is for the main app, not auth pages
  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      return <>{children}</>
  }

  return (
    <LanguageProvider>
      <div className={cn("min-h-screen w-full bg-background")}>
        <div className="flex min-h-screen w-full">
          {!isMobile && <AppSidebar user={currentUser} />}
          <div className="flex flex-1 flex-col bg-transparent">
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
              {children}
            </main>
          </div>
        </div>
        {isMobile && <BottomNav />}
      </div>
    </LanguageProvider>
  );
}
