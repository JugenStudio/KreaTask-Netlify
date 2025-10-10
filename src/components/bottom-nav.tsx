
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTodo, PenSquare, Trophy, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/tasks", icon: ListTodo, label: t('sidebar.all_tasks') },
    { href: "/submit", icon: PenSquare, label: t('sidebar.submit_task') },
    { href: "/dashboard", icon: Home, label: t('sidebar.home') },
    { href: "/leaderboard", icon: Trophy, label: t('sidebar.leaderboard') },
    { href: "/performance-report", icon: History, label: t('sidebar.performance_report') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 p-2 backdrop-blur-lg md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/" || pathname.startsWith(item.href)
            : pathname.startsWith(item.href);
          
          if (item.href === "/dashboard") {
            return (
               <Link
                key={item.href}
                href={item.href}
                prefetch
                className="group flex flex-col items-center justify-center p-1 rounded-lg text-muted-foreground transition-all active:scale-95"
              >
                <div className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform -translate-y-4 shadow-lg",
                  isActive ? "bg-primary text-primary-foreground" : "bg-card border-4 border-background text-foreground group-hover:bg-muted"
                )}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  "text-xs font-medium -mt-3 w-full text-center truncate",
                  isActive ? "text-primary font-bold" : "text-muted-foreground"
                )}>{item.label}</span>
              </Link>
            )
          }
            
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "group flex flex-col items-center justify-center p-1 rounded-lg text-muted-foreground transition-all active:scale-95",
              )}
            >
              <div className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-8 rounded-full transition-colors",
                 isActive ? "bg-primary text-primary-foreground" : "group-hover:bg-muted"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-xs font-medium mt-1 w-full text-center truncate", // Added truncate and width
                isActive ? "text-primary font-bold" : "text-muted-foreground"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
