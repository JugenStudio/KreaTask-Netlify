
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { isEmployee, isDirector } from "@/lib/roles";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

const roles: UserRole[] = Object.values(UserRole);

interface UserTableProps {
  initialUsers: User[];
  currentUser: User;
}

export function UserTable({ initialUsers, currentUser }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    const user = users.find((u) => u.id === userId);
    toast({
      title: t("settings.user_management.toast.role_updated_title"),
      description: t("settings.user_management.toast.role_updated_desc", {
        name: user?.name || "",
        role: newRole,
      }),
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== userToDelete.id)
    );
    toast({
      title: t("settings.user_management.toast.user_deleted_title"),
      description: t("settings.user_management.toast.user_deleted_desc", { name: userToDelete.name }),
    });
    setUserToDelete(null);
  };

  const canEditRole = (targetUser: User): boolean => {
    if (currentUser.id === targetUser.id) return false;
    if (currentUser.role === UserRole.DIREKTUR_UTAMA) return true;
    if (isDirector(currentUser.role) && isEmployee(targetUser.role)) return true;
    return false;
  };

  const canDeleteUser = (targetUser: User): boolean => {
     if (currentUser.id === targetUser.id) return false;
     if (currentUser.role === UserRole.DIREKTUR_UTAMA) return true;
     if (isDirector(currentUser.role) && isEmployee(targetUser.role)) return true;
     return false;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("settings.user_management.table.user")}</TableHead>
            <TableHead>{t("settings.user_management.table.email")}</TableHead>
            <TableHead>{t("settings.user_management.table.role")}</TableHead>
            <TableHead className="text-right">{t("settings.user_management.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{user.name}</div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value: UserRole) =>
                    handleRoleChange(user.id, value)
                  }
                  disabled={!canEditRole(user)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                {canDeleteUser(user) && (
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('settings.user_management.delete_dialog.title', { name: userToDelete.name })}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('settings.user_management.delete_dialog.description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('settings.user_management.delete_dialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                        {t('settings.user_management.delete_dialog.confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
