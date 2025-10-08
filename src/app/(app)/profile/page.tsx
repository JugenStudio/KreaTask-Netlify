"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { users } from "@/lib/data";
import { useLanguage } from "@/providers/language-provider";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
    if (selectedRole) {
      const user = users.find(u => u.role === selectedRole);
      setCurrentUser(user || users[0]);
    } else {
      setCurrentUser(users[0]);
    }
  }, []);

  if (!currentUser) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-24 self-end" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('profile.title')}</h1>
        <p className="text-muted-foreground">{t('profile.description')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('profile.photo.title')}</CardTitle>
          <CardDescription>{t('profile.photo.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change Photo</span>
            </Button>
          </div>
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('profile.details.title')}</CardTitle>
          <CardDescription>{t('profile.details.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.details.name')}</Label>
              <Input id="name" defaultValue={currentUser.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.details.email')}</Label>
              <Input id="email" type="email" defaultValue={currentUser.email} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t('profile.details.role')}</Label>
            <Input id="role" defaultValue={currentUser.role} disabled />
          </div>
           <div className="flex justify-end">
            <Button>{t('profile.details.save_button')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
