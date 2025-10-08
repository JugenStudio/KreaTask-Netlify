
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
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { isEmployee } from "@/lib/roles";

const roles: UserRole[] = Object.values(UserRole);

interface UserTableProps {
  initialUsers: User[];
  currentUser: User;
}

export function UserTable({ initialUsers, currentUser }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();

  const canEditRoles = !isEmployee(currentUser.role);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!canEditRoles) return;

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    const user = users.find(u => u.id === userId);
    toast({
      title: "User Role Updated",
      description: `${user?.name}'s role has been changed to ${newRole}.`,
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
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
                disabled={!canEditRoles}
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
