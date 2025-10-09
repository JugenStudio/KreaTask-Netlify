
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { users } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/components/bottom-nav";
import { usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

// 1. Create the context
const UserContext = createContext<{ currentUser: User | null }>({
  currentUser: null,
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => {
    let userToSet: User | null = null;
    // We check for the explicit currentUser object first.
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
        userToSet = JSON.parse(storedUser);
    } else {
        // If no user object, we fall back to selectedRole.
        // This is the main path for a new login simulation.
        const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
        if (selectedRole) {
            userToSet = users.find(u => u.role === selectedRole) || null;
            if (!userToSet) {
              // Handle case where role exists but no user matches, default to first user
              userToSet = users[0];
            }
        } else {
            // Default user if nothing is set (e.g., first visit)
            userToSet = users[0]; 
        }

        // IMPORTANT: Only set the 'currentUser' in storage if it wasn't already there.
        // This prevents overwriting the user on subsequent page loads.
        if (userToSet) {
          sessionStorage.setItem('currentUser', JSON.stringify(userToSet));
        }
    }

    if (userToSet) {
        setCurrentUser(userToSet);
    }
    setIsLoading(false);
  }, []);

  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      return <>{children}</>
  }
  
  if (isLoading) {
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
      <UserContext.Provider value={{ currentUser }}>
        <div className={cn("min-h-screen w-full bg-background")}>
          <div className="flex min-h-screen w-full">
            {!isMobile && currentUser && <AppSidebar user={currentUser} />}
            <div className="flex flex-1 flex-col bg-transparent">
              <Header />
              <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-6 lg:pb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
          {isMobile && <BottomNav />}
        </div>
      </UserContext.Provider>
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
