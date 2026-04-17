import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const GOOGLE_WEB_CLIENT_ID = 'REPLACE_WITH_FIREBASE_WEB_CLIENT_ID';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export const onAuthUserChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
) => {
  return auth().onAuthStateChanged(callback);
};

export const signInWithEmail = async (email: string, password: string) => {
  return auth().signInWithEmailAndPassword(email.trim(), password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  return auth().createUserWithEmailAndPassword(email.trim(), password);
};

export const signInWithGoogle = async () => {
  if (GOOGLE_WEB_CLIENT_ID === 'REPLACE_WITH_FIREBASE_WEB_CLIENT_ID') {
    throw new Error('Google login is not configured. Set your Firebase Web Client ID in AuthService.ts.');
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;

  if (!idToken) {
    throw new Error('Google sign-in did not return an ID token.');
  }

  const credential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(credential);
};

export const signOutAuth = async () => {
  await GoogleSignin.signOut().catch(() => undefined);
  await auth().signOut();
};
