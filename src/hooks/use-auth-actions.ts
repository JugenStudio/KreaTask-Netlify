
"use client";

import { useCallback } from 'react';
import { useCurrentUser } from '@/app/(app)/layout';
import { updateUserAction } from '@/app/actions';

// This hook now uses custom API endpoints instead of Firebase Auth SDK directly for most actions.
export function useAuthActions() {
  const { mutateUser } = useCurrentUser();

  const updateUserProfile = useCallback(async (userId: string, data: { name?: string; }) => {
    await updateUserAction(userId, data);
    await mutateUser(); // Re-fetch session data to reflect changes
  }, [mutateUser]);
  
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
