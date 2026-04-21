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

        // Get user role from user metadata
        const role = session.user.user_metadata?.role || 'family_member';

        // Validate role
        const validRoles: UserRole[] = ['super_admin', 'family_owner', 'family_member', 'guest'];
        if (validRoles.includes(role as UserRole)) {
          setUserRole(role as UserRole);
        } else {
          setUserRole('family_member'); // Default to member
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

            const role = session.user.user_metadata?.role || 'family_member';

            const validRoles: UserRole[] = ['super_admin', 'family_owner', 'family_member', 'guest'];
            if (validRoles.includes(role as UserRole)) {
              setUserRole(role as UserRole);
            } else {
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