"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  userRole: UserRole;
  isLoading: boolean;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();

      if (!supabase) {
        setUserRole('guest');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        try {
          // First try to get user role from profiles table by id
          let { data: profile, error } = await supabase
            .from('profiles')
            .select('role, id, user_id')
            .eq('id', session.user.id)
            .single();

          // If not found by id, try by user_id
          if (error || !profile) {
            const { data: profileByUserId, error: userIdError } = await supabase
              .from('profiles')
              .select('role, id, user_id')
              .eq('user_id', session.user.id)
              .single();

            if (!userIdError && profileByUserId) {
              profile = profileByUserId;
              error = null;
              console.log('AuthContext - Found profile by user_id instead of id');
            }
          }

          console.log('AuthContext - Profile lookup result:', { profile, error, userId: session.user.id });

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
            // Profile doesn't exist, create one or set default role
            console.log('AuthContext - No profile found, checking if first user...');

            try {
              const { count, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

              if (!countError && count === 0) {
                // First user automatically becomes admin
                console.log('AuthContext - First user detected, creating admin profile');
                setUserRole('family_owner');

                // Create profile record with admin role
                const { error: upsertError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: session.user.id,
                    user_id: session.user.id,
                    role: 'family_owner',
                    display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Admin',
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || 'Admin'
                  });

                if (upsertError) {
                  console.error('AuthContext - Error creating admin profile:', upsertError);
                } else {
                  console.log('AuthContext - Admin profile created successfully');
                }
              } else {
                // Not first user, create regular profile if it doesn't exist
                console.log('AuthContext - Not first user, creating member profile');

                const { error: upsertError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: session.user.id,
                    user_id: session.user.id,
                    role: 'family_member',
                    display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || 'User'
                  });

                if (upsertError) {
                  console.error('AuthContext - Error creating member profile:', upsertError);
                }

                setUserRole('family_member');
              }
            } catch (countError) {
              console.error('AuthContext - Error checking user count:', countError);
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

  return (
    <AuthContext.Provider value={{ userRole, isLoading, user }}>
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