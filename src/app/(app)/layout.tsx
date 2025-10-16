
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import type { User, UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/bottom-nav";
import { TaskDataProvider } from "@/hooks/use-task-data";
import { useSpotlightEffect } from "@/hooks/use-spotlight";
import { useSession } from "next-auth/react";
import type { Session } from 'next-auth';

// 1. Create the context for the user
interface AppUser extends User {
  role: UserRole;
}

const UserContext = createContext<{ currentUser: AppUser | null; isLoading: boolean;}>({
  currentUser: null,
  isLoading: true,
});


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  useSpotlightEffect();
  
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  
  useEffect(() => {
    // If not loading and not authenticated, redirect to landing
    if (!isLoading && !isAuthenticated) {
      router.replace('/landing');
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Cast the session user to our AppUser type
  const currentUser: AppUser | null = useMemo(() => {
    if (session?.user) {
        return {
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
            avatarUrl: session.user.image || '',
            role: session.user.role || 'Unassigned',
        } as AppUser;
    }
    return null;
  }, [session]);


  if (isLoading || !currentUser) {
    return (
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
    )
  }

  return (
      <UserContext.Provider value={{ currentUser, isLoading }}>
        <div className={cn("min-h-screen w-full bg-background")}>
          <div className="flex min-h-screen w-full">
            {!isMobile && currentUser && <AppSidebar user={currentUser} />}
            <div className="flex flex-1 flex-col bg-transparent">
              {currentUser && <Header />}
              <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-6">
                {children}
              </main>
            </div>
          </div>
          {isMobile && currentUser && <BottomNav />}
        </div>
      </UserContext.Provider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname.startsWith('/landing') || pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }
  
  // Main app layout with all data providers
  return (
    <LanguageProvider>
      <TaskDataProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </TaskDataProvider>
    </LanguageProvider>
  );
}

// 2. Create a custom hook to use the context
export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a AppLayout');
  }
  return context;
};
