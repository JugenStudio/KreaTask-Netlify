"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ListTodo, 
  PenSquare, 
  Settings,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { href: "/tasks", icon: ListTodo, label: t('sidebar.all_tasks') },
    { href: "/submit", icon: PenSquare, label: t('sidebar.submit_task') },
    { href: "/settings", icon: Settings, label: t('sidebar.settings') },
  ];

  return (
    <aside className="w-64 flex-col border-r border-border bg-background p-4 hidden md:flex">
      <div className="flex items-center gap-2 px-2 py-4">
        <Flame className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold">KreaTask</h1>
      </div>
      <nav className="mt-8 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive && "bg-secondary text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
