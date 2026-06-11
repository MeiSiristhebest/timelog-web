"use client";

import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  userRole: UserRole;
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    console.log('AuthContext - Initializing auth subscription');

    if (!supabase) {
      console.log('AuthContext - No Supabase client, setting guest');
      const timer = setTimeout(() => {
        setUserRole('guest');
        setUser(null);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const client = supabase;

    // Helper function to resolve profile and update state
    async function handleUserSession(session: { user: User } | null) {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);

        try {
          console.log('AuthContext - Looking up profile for user:', session.user.id);
          
          // 1. Try fetching profile by id
          const { data: profile, error } = await client
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          let resolvedProfile = profile;

          // 2. Try fetching profile by user_id if not found by id
          if (error || !profile) {
            console.log('AuthContext - Profile not found by id, trying user_id...');
            const { data: profileByUid, error: uidError } = await client
              .from('profiles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();

            if (!uidError && profileByUid) {
              resolvedProfile = profileByUid;
            }
          }

          console.log('AuthContext - Profile resolved:', resolvedProfile);

          if (isMounted) {
            if (resolvedProfile?.role) {
              const validRoles: UserRole[] = ['family_owner', 'family_member', 'guest'];
              if (validRoles.includes(resolvedProfile.role as UserRole)) {
                const timer = setTimeout(() => {
                  setUserRole(resolvedProfile.role as UserRole);
                }, 0);
                return () => clearTimeout(timer);
              } else {
                const timer = setTimeout(() => {
                  setUserRole('family_member');
                }, 0);
                return () => clearTimeout(timer);
              }
            } else {
              // Default fallback for storytellers (who have role: null) or missing profiles
              const timer = setTimeout(() => {
                setUserRole('family_member');
              }, 0);
              return () => clearTimeout(timer);
            }
          }
        } catch (profileError) {
          console.error('AuthContext - Error resolving profile:', profileError);
          if (isMounted) {
            const timer = setTimeout(() => {
              setUserRole('family_member');
            }, 0);
            return () => clearTimeout(timer);
          }
        }
      } else {
        setUser(null);
        const timer = setTimeout(() => {
          setUserRole('guest');
        }, 0);
        return () => clearTimeout(timer);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    // 1. Get initial session manually to ensure isLoading becomes false quickly
    client.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext - Initial session fetched:', session?.user?.id);
      handleUserSession(session);
    }).catch((err: unknown) => {
      console.error('AuthContext - Error fetching initial session:', err);
      if (isMounted) {
        setIsLoading(false);
      }
    });

    // 2. Listen for subsequent auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext - Auth event:', event, 'user:', session?.user?.id);
        handleUserSession(session);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // isAuthenticated = user session exists (independent of role loading)
  // This prevents sidebar flicker where user has a valid session but role is still loading
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ userRole, isLoading, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}