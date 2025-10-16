
"use client";

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { updateUserAction } from '@/app/actions';

export function useAuthActions() {
  const { data: session, update } = useSession();

  const updateUserProfile = useCallback(async (userId: string, data: { name?: string; }) => {
    // 1. Update the database via Server Action
    await updateUserAction(userId, data);
    
    // 2. Trigger a session update in NextAuth
    // This will re-fetch the session and JWT, running the `session` and `jwt` callbacks again.
    await update({ ...session, user: { ...session?.user, ...data }});

  }, [session, update]);
  
  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    // This is a placeholder. A real implementation would require an API endpoint
    // to securely verify the current password and update the hash in the database.
    // For now, we'll throw an error indicating it's not implemented.
    throw new Error("Password change functionality needs a custom backend implementation and is not available yet.");
  }, []);

  const updateUserEmail = useCallback(async (newEmail: string) => {
    // In a real app, this should be a secure API endpoint
    // that sends a verification email to the new address before changing.
    throw new Error("Changing email requires a secure backend implementation which is not yet built.");
  }, []);

  return {
    updateUserProfile,
    updateUserEmail,
    changeUserPassword,
  };
}
