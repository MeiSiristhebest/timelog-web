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
          // Get user role from profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (!error && profile?.role) {
            // Validate role
            const validRoles: UserRole[] = ['super_admin', 'family_owner', 'family_member', 'guest'];
            if (validRoles.includes(profile.role as UserRole)) {
              console.log('AuthContext - Setting user role from profile:', profile.role);
              setUserRole(profile.role as UserRole);
            } else {
              console.log('AuthContext - Invalid role from profile, defaulting to member');
              setUserRole('family_member'); // Default to member
            }
          } else {
            // Profile doesn't exist or has no role, default to member
            console.log('AuthContext - No profile role found, defaulting to member');
            setUserRole('family_member');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
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
                const validRoles: UserRole[] = ['super_admin', 'family_owner', 'family_member', 'guest'];
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