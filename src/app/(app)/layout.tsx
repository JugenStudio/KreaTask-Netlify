
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
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
    }
    return null;
  });
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => {
    let userToSet: User | null = null;
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
        userToSet = JSON.parse(storedUser);
    } else {
        const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
        if (selectedRole) {
            userToSet = users.find(u => u.role === selectedRole) || users[0];
        } else {
            userToSet = users[0];
        }
    }

    if (userToSet) {
        setCurrentUser(userToSet);
        sessionStorage.setItem('currentUser', JSON.stringify(userToSet));
    }
  }, [pathname]);

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
    </LanguageProvider>
  );
}
