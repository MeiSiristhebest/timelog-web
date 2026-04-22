"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  userRole: UserRole;
  isLoading: boolean;
  user: any;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      console.log('AuthContext - Initializing auth check');

      const supabase = createClient();
      console.log('AuthContext - Supabase client created:', !!supabase);

      if (!supabase) {
        console.log('AuthContext - No Supabase client, setting guest');
        setUserRole('guest');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get current session
      console.log('AuthContext - Getting session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('AuthContext - Session result:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError
      });

      if (session?.user) {
        console.log('AuthContext - User authenticated:', session.user.email, session.user.id);
        setUser(session.user);

        try {
          // Get user role from profiles table
          console.log('AuthContext - Looking up profile for user:', session.user.id);
          let profileResult = await supabase
            .from('profiles')
            .select('role, id, user_id')
            .eq('id', session.user.id)
            .single();

          console.log('AuthContext - Profile lookup by id:', profileResult);

          // If not found by id, try by user_id
          if (profileResult.error || !profileResult.data) {
            console.log('AuthContext - Profile not found by id, trying user_id');
            const userIdResult = await supabase
              .from('profiles')
              .select('role, id, user_id')
              .eq('user_id', session.user.id)
              .single();

            console.log('AuthContext - Profile lookup by user_id:', userIdResult);

            if (!userIdResult.error && userIdResult.data) {
              profileResult = userIdResult;
              console.log('AuthContext - Found profile by user_id instead of id');
            }
          }

          const { data: profile, error } = profileResult;
          console.log('AuthContext - Final profile lookup result:', {
            hasProfile: !!profile,
            role: profile?.role,
            profileId: profile?.id,
            profileUserId: profile?.user_id,
            error: error?.message || error,
            sessionUserId: session.user.id
          });

          if (!error && profile?.role) {
            // Validate role
            const validRoles: UserRole[] = ['family_owner', 'family_member', 'guest'];
            if (validRoles.includes(profile.role as UserRole)) {
              console.log('AuthContext - Setting user role from profile:', profile.role);
              setUserRole(profile.role as UserRole);
            } else {
              console.log('AuthContext - Invalid role from profile, defaulting to member');
              setUserRole('family_member'); // Default to member
            }
          } else {
            // Profile doesn't exist or has no role
            console.log('AuthContext - No profile role found, using fallback logic');

            // TEMPORARY: Force admin role for testing
            // Check if this is the known admin user
            if (session.user.id === '69dad30e-c5df-419b-ac09-efc5fbc8babe') {
              console.log('AuthContext - TEMP: Setting known admin user to family_owner');
              setUserRole('family_owner');
            } else {
              setUserRole('family_member');
            }
          }
        } catch (error) {
          console.error('AuthContext - Error in profile lookup:', error);
          setUserRole('family_member'); // Default fallback
        }
      } else {
        setUserRole('guest');
        setUser(null);
      }

      setIsLoading(false);
    };

    getUser();

    // Listen for auth changes
    const supabase = createClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user);

            try {
              // Get user role from profiles table
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

              if (!error && profile?.role) {
                const validRoles: UserRole[] = ['family_owner', 'family_member', 'guest'];
                if (validRoles.includes(profile.role as UserRole)) {
                  setUserRole(profile.role as UserRole);
                } else {
                  setUserRole('family_member');
                }
              } else {
                setUserRole('family_member');
              }
            } catch (error) {
              console.error('Error fetching user role:', error);
              setUserRole('family_member');
            }
          } else {
            setUserRole('guest');
            setUser(null);
          }
          setIsLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const isAuthenticated = !!user && userRole !== 'guest';

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