
"use client";

import { useCallback } from 'react';
import { useCurrentUser } from '@/app/(app)/layout';
import { useTaskData } from './use-task-data';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize firebase for storage operations
// We keep this isolated as we only need it for file uploads, not auth/db.
const app = initializeApp(firebaseConfig);

// This hook now uses custom API endpoints instead of Firebase Auth SDK directly for most actions.
// Password changes still need Firebase SDK on the client, or a custom backend flow (e.g., email link).
export function useAuthActions() {
  const { updateUserInFirestore } = useTaskData();
  const { currentUser, mutateUser } = useCurrentUser();

  const updateUserProfile = useCallback(async (userId: string, data: { name?: string; email?: string; avatarUrl?: string }) => {
    // We don't update the email via this function anymore.
    // That should be a separate, more secure process.
    await updateUserInFirestore(userId, data);
    await mutateUser(); // Re-fetch session data

  }, [updateUserInFirestore, mutateUser]);
  

  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    // This is a placeholder. A real implementation would require an API endpoint.
    // For now, we'll throw an error indicating it's not implemented.
    throw new Error("Password change functionality needs a custom backend implementation.");

  }, []);

  const uploadProfilePicture = useCallback(async (file: File) => {
    if (!currentUser) throw new Error("Pengguna tidak terautentikasi.");

    const storage = getStorage(app);
    const storageRef = ref(storage, `avatars/${currentUser.id}/${file.name}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user profile in the database
    await updateUserProfile(currentUser.id, { avatarUrl: downloadURL });

    return downloadURL;
  }, [currentUser, updateUserProfile]);


  return {
    updateUserProfile,
    updateUserEmail: () => Promise.reject("Not implemented"), // Email update needs secure backend flow
    changeUserPassword,
    uploadProfilePicture,
  };
}
