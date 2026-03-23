import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth } from "../firebase";

// Redirect-based authentication as fallback for popup blocking
export const signInWithGoogleRedirect = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  return signInWithRedirect(auth, provider);
};

// Handle redirect result after authentication
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    throw error;
  }
};

// Check if we're returning from a redirect
export const isRedirectResult = () => {
  return window.location.search.includes('access_token') || 
         window.location.search.includes('code=');
};
