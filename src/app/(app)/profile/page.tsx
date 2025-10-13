
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/providers/language-provider";
import { Camera, KeyRound, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/app/(app)/layout";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { useRef, useState } from "react";

const profileFormSchema = z.object({
  name: z.string().min(1, "Nama lengkap diperlukan."),
  email: z.string().email("Format email tidak valid."),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, "Password saat ini minimal 6 karakter."),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter."),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter."),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru tidak cocok.",
    path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function ProfilePage() {
  const { currentUser } = useCurrentUser();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { updateUserProfile, updateUserEmail, changeUserPassword, uploadProfilePicture } = useAuthActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleProfileSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!currentUser) return;

    try {
      // Update name in Firestore
      if (data.name !== currentUser.name) {
        await updateUserProfile(currentUser.id, { name: data.name });
      }

      // Update email in Auth and Firestore
      if (data.email !== currentUser.email) {
        await updateUserEmail(data.email);
        await updateUserProfile(currentUser.id, { email: data.email });
      }

      toast({
        title: "Profil Diperbarui",
        description: "Informasi profil Anda telah berhasil disimpan.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui Profil",
        description: error.message || "Terjadi kesalahan yang tidak diketahui.",
      });
    }
  };

  const handlePasswordSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    try {
      await changeUserPassword(data.currentPassword, data.newPassword);
      toast({
        title: "Password Berhasil Diubah",
        description: "Silakan gunakan password baru Anda saat login berikutnya.",
      });
      passwordForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Mengubah Password",
        description: error.message || "Pastikan password Anda saat ini benar.",
      });
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    
    setIsUploading(true);

    try {
        await uploadProfilePicture(file);
        toast({
            title: "Foto Profil Diperbarui",
            description: "Foto profil Anda telah berhasil diganti.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Gagal Mengunggah Foto",
            description: error.message || "Terjadi kesalahan saat mengunggah.",
        });
    } finally {
        setIsUploading(false);
    }
  };


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
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Profil Saya</h1>
        <p className="text-muted-foreground text-sm md:text-base">Kelola informasi pribadi dan pengaturan akun Anda.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl md:text-2xl">Foto Profil</CardTitle>
          <CardDescription>Ini adalah avatar publik Anda.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 md:gap-6">
           <div className="relative">
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg"
            />
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7 md:h-8 md:w-8 transition-all active:scale-95" onClick={handleAvatarClick} disabled={isUploading}>
              <Camera className="h-3 w-3 md:h-4 md:w-4" />
              <span className="sr-only">Ubah Foto</span>
            </Button>
          </div>
          <div>
            <p className="font-medium text-base md:text-lg">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <p className="text-sm text-muted-foreground">{t(`roles.${currentUser.role}` as any)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <Card>
                <CardHeader>
                <CardTitle className="font-headline text-xl md:text-2xl">Detail Pribadi</CardTitle>
                <CardDescription>Perbarui informasi Anda di sini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Lengkap</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alamat Email</FormLabel>
                                <FormControl><Input type="email" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Peran</Label>
                    <Input id="role" defaultValue={t(`roles.${currentUser.role}` as any)} disabled />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" className="transition-all active:scale-95" disabled={profileForm.formState.isSubmitting}>Simpan Perubahan</Button>
                </div>
                </CardContent>
            </Card>
        </form>
       </Form>

       <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline text-xl md:text-2xl flex items-center gap-2"><KeyRound/> Akun & Keamanan</CardTitle>
                    <CardDescription>Ubah password Anda secara berkala untuk menjaga keamanan akun.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password Saat Ini</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password Baru</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="flex justify-end">
                        <Button type="submit" className="transition-all active:scale-95" disabled={passwordForm.formState.isSubmitting}>Ubah Password</Button>
                    </div>
                </CardContent>
            </Card>
        </form>
       </Form>

    </div>
  );
}
