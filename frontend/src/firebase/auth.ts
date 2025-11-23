// import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// import { app } from "./firebaseConfig";

// export const auth = getAuth(app);
// export const googleProvider = new GoogleAuthProvider();

// export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
// export const logoutUser = () => signOut(auth);


import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { app } from "./firebaseConfig";

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Login
export const loginWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

// Email Login
export const loginWithEmailAndPassword = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Email Signup (fixed - now correct 3 params)
export const signUpWithEmailPassword = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

// Logout
export const logoutUser = () => signOut(auth);
