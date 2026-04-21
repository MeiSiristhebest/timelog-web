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
                setUserRole(profile.role as UserRole);
              } else {
                setUserRole('family_member'); // Default to member
              }
            } else {
              // Check if this is the first user in the system
              const { count, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

              if (!countError && count === 0) {
                // First user automatically becomes admin
                setUserRole('family_owner');
                // Update the profile with admin role
                await supabase
                  .from('profiles')
                  .upsert({
                    id: session.user.id,
                    role: 'family_owner',
                    display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Admin',
                    email: session.user.email
                  });
              } else {
                // Fallback to user metadata or default
                const role = session.user.user_metadata?.role || 'family_member';
                const validRoles: UserRole[] = ['super_admin', 'family_owner', 'family_member', 'guest'];
                if (validRoles.includes(role as UserRole)) {
                  setUserRole(role as UserRole);
                } else {
                  setUserRole('family_member');
                }
              }
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
                const role = session.user.user_metadata?.role || 'family_member';
                const validRoles: UserRole[] = ['super_admin', 'family_owner', 'family_member', 'guest'];
                if (validRoles.includes(role as UserRole)) {
                  setUserRole(role as UserRole);
                } else {
                  setUserRole('family_member');
                }
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