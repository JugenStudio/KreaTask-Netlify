
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from "react";
import type { User, Task, LeaderboardEntry, Notification } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/providers/language-provider";
import Aurora from '@/components/Aurora';
import { BottomNav } from "@/components/bottom-nav";
import { TaskDataProvider, TaskDataContext } from "@/hooks/use-task-data.tsx";
import { useSpotlightEffect } from "@/hooks/use-spotlight";
import { FirebaseClientProvider } from "@/firebase/client-provider";

// 1. Create the context
const UserContext = createContext<{ currentUser: User | null }>({
  currentUser: null,
});

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // Data logic is now in useTaskData hook via context
  const taskDataContext = useContext(TaskDataContext);
  const { users, isLoading: isUsersLoading } = taskDataContext ?? { users: [], isLoading: true };

  const isMobile = useIsMobile();
  const pathname = usePathname();
  useSpotlightEffect();


  useEffect(() => {
    // This effect handles setting the current simulated user.
    // It should only run when the user list from Firestore is available.
    if (isUsersLoading) {
      console.log("Waiting for user data from Firestore...");
      return; // Wait until users are loaded
    }
    
    console.log("User data has loaded. Users found:", users.length);
    let userToSet: User | null = null;
    
    // sessionStorage is used for session-specific info like the currently simulated user
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
        try {
            // Validate that the user from sessionStorage still exists in our main user list
            const parsedUser: User = JSON.parse(storedUser);
            if (users.find(u => u.id === parsedUser.id)) {
                 userToSet = parsedUser;
            } else {
                 console.warn("User from session storage is invalid. Clearing.");
                 sessionStorage.removeItem('currentUser'); // Clear invalid user
            }
        } catch (e) {
            console.error("Failed to parse currentUser from sessionStorage", e);
            sessionStorage.removeItem('currentUser');
        }
    } 
    
    if (!userToSet) {
        // If no valid user from session, determine based on selected role or default
        const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
        if (selectedRole) {
            userToSet = users.find(u => u.role === selectedRole) || null;
            if (!userToSet && users.length > 0) {
              // Fallback to the first user if the role isn't found
              console.warn(`Role "${selectedRole}" not found in users. Defaulting.`);
              userToSet = users[0];
            }
        } else if (users.length > 0) {
            // Default to the first user if no role is selected (initial load)
            userToSet = users[0]; 
        }

        if (userToSet) {
          sessionStorage.setItem('currentUser', JSON.stringify(userToSet));
        }
    }

    if (userToSet) {
        setCurrentUser(userToSet);
    } else if (users.length === 0 && !isUsersLoading) {
        console.warn("No users available in Firestore. Can't set a current user.");
    }
    
    // We are done trying to load a user, so stop the loading state.
    setIsUserLoading(false);

  }, [isUsersLoading, users]);

  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      return <>{children}</>
  }
  
  // The main loading state now only depends on the user loading process
  const isLoading = isUserLoading;

  if (isLoading) {
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
      <UserContext.Provider value={{ currentUser }}>
        <div className={cn("min-h-screen w-full bg-background")}>
           <div className="fixed top-0 left-0 w-full h-full z-[-1] opacity-30">
            <Aurora
              colorStops={["#172554", "#166534", "#172554"]}
              blend={1}
              amplitude={0.2}
              speed={0.2}
            />
           </div>
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
  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }
  
  return (
    <FirebaseClientProvider>
      <LanguageProvider>
        <TaskDataProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </TaskDataProvider>
      </LanguageProvider>
    </FirebaseClientProvider>
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
