
"use client";

import { useCallback } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { 
  updateProfile, 
  updateEmail, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updatePassword 
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTaskData } from './use-task-data';

export function useAuthActions() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { updateUserInFirestore } = useTaskData();

  const updateUserProfile = useCallback(async (userId: string, data: { name?: string; email?: string; avatarUrl?: string }) => {
    if (!auth.currentUser) throw new Error("Pengguna tidak terautentikasi.");
    
    // Update Firebase Auth Profile
    await updateProfile(auth.currentUser, {
      displayName: data.name,
      photoURL: data.avatarUrl,
    });

    // Update Firestore document
    await updateUserInFirestore(userId, data);

  }, [auth, updateUserInFirestore]);

  const updateUserEmail = useCallback(async (newEmail: string) => {
    if (!auth.currentUser) throw new Error("Pengguna tidak terautentikasi.");
    
    // This is a sensitive operation and may require re-authentication in a real app
    await updateEmail(auth.currentUser, newEmail);
  }, [auth]);

  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error("Pengguna tidak terautentikasi atau tidak memiliki email.");
    
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    
    // Re-authenticate the user
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    // Now change the password
    await updatePassword(auth.currentUser, newPassword);

  }, [auth]);

  const uploadProfilePicture = useCallback(async (file: File) => {
    if (!auth.currentUser) throw new Error("Pengguna tidak terautentikasi.");

    const storage = getStorage();
    const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${file.name}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user profile
    await updateUserProfile(auth.currentUser.uid, { avatarUrl: downloadURL });

    return downloadURL;
  }, [auth, updateUserProfile]);


  return {
    updateUserProfile,
    updateUserEmail,
    changeUserPassword,
    uploadProfilePicture,
  };
}
