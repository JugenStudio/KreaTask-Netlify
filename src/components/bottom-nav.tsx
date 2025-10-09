
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, PenSquare, Trophy, FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // We can't use isEmployee here as user is not passed. 
  // Let's just use a generic icon for now.
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { href: "/tasks", icon: ListTodo, label: t('sidebar.all_tasks') },
    { href: "/submit", icon: PenSquare, label: "Submit" }, // Shortened label
    { href: "/leaderboard", icon: Trophy, label: t('sidebar.leaderboard') },
    { href: "/performance-report", icon: FileText, label: t('sidebar.performance_report') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 p-2 backdrop-blur-lg md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center p-1 rounded-lg text-muted-foreground",
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
