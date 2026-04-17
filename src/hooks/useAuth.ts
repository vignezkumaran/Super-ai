import { useEffect, useMemo, useState } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  onAuthUserChanged,
  signInWithEmail,
  signInWithGoogle,
  signOutAuth,
  signUpWithEmail,
} from '../services/AuthService';

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged(nextUser => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  return useMemo(
    () => ({
      user,
      authLoading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOutAuth,
    }),
    [authLoading, user],
  );
};
