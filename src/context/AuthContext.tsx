'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { saveUserProfile } from '@/lib/firestore';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginAsDemo: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || (fbUser.isAnonymous ? 'demo@sin2.cz' : ''),
          displayName: fbUser.displayName || (fbUser.isAnonymous ? 'Demo Uživatel' : 'Uživatel')
        };
        setUser(profile);
        try {
          await saveUserProfile(profile);
        } catch (e) {
          console.error('Could not sync user profile to firestore:', e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await saveUserProfile({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName
      });
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: name
      };
      setUser(profile);
      await saveUserProfile(profile);
    }
  };

  const loginAsDemo = async () => {
    // Try demo login via demo email/pass, or create if not exists
    const demoEmail = 'demo@example.com';
    const demoPass = 'demo123456';
    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          await updateProfile(cred.user, { displayName: 'Jan Novák (Demo)' });
          await saveUserProfile({
            uid: cred.user.uid,
            email: demoEmail,
            displayName: 'Jan Novák (Demo)'
          });
        } catch (innerErr) {
          // If email signup blocked, fallback to anonymous
          const cred = await signInAnonymously(auth);
          await updateProfile(cred.user, { displayName: 'Jan Novák (Demo)' });
          await saveUserProfile({
            uid: cred.user.uid,
            email: 'demo@example.com',
            displayName: 'Jan Novák (Demo)'
          });
        }
      } else {
        throw err;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
