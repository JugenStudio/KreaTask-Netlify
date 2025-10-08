import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { users, notifications } from "@/lib/data";
import { Separator } from "./ui/separator";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const currentUser = users[0]; // Assuming Admin Ali is logged in

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 w-full">
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tasks..."
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <LanguageSwitcher />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
             <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none font-headline">Notifications</h4>
                <p className="text-sm text-muted-foreground">You have {notifications.filter(n => !n.isRead).length} unread messages.</p>
              </div>
              <Separator />
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0">
                    <span className={`flex h-2 w-2 translate-y-1 rounded-full ${!notif.isRead ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <div className="grid gap-1">
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">{notif.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(notif.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
