
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { users } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/components/bottom-nav";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => {
    const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
    if (selectedRole) {
      const user = users.find(u => u.role === selectedRole);
      setCurrentUser(user || users[0]);
    } else {
      setCurrentUser(users[0]);
    }
  }, [pathname]); // Re-run on path change to keep user consistent

  // This layout is for the main app, not auth pages
  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      return <>{children}</>
  }
  
  if (!currentUser) {
    return (
      <LanguageProvider>
        <div className="flex min-h-screen w-full bg-background">
           {!isMobile && (
             <div className="w-64 flex-col border-r border-border bg-card p-4">
                <Skeleton className="h-10 w-3/4 mb-12" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
             </div>
           )}
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-lg">
                <div className="flex-1">
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <Skeleton className="h-[500px] w-full" />
            </main>
          </div>
        </div>
      </LanguageProvider>
    )
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
