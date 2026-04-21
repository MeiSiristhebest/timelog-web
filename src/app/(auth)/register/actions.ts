"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";

export type RegisterActionState = {
  error: string | null;
  success: boolean;
};

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  // 1. Basic Validation
  if (!email || !password || !displayName) {
    return { error: "Please provide all details so we can set up your archive.", success: false };
  }

  if (password !== confirmPassword) {
    return { error: "The passwords you entered don't match. Please try again.", success: false };
  }

  if (password.length < 6) {
    return { error: "To keep memories secure, passwords must be at least 6 characters.", success: false };
  }

  // 2. Initialize Server-side Supabase
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: "Supabase configuration missing.", success: false };
  }

  // 3. Default role for new users
  // All new users start as family_member
  // Administrators can be appointed through Supabase table management
  const userRole = 'family_member';

  // 4. Execute SignUp
  // Using options.data for automatic metadata sync.
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        full_name: displayName,
        role: userRole,
      },
      emailRedirectTo: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/overview`
        : process.env.NETLIFY_URL
        ? `${process.env.NETLIFY_URL}/overview`
        : process.env.NODE_ENV === 'production'
        ? 'https://timelog-web.netlify.app/overview'
        : 'http://localhost:3000/overview'
    },
  });

  if (signUpError) {
    // If you see ECONNRESET here, it's a local network/proxy issue.
    return { error: `Connection limit: ${signUpError.message}`, success: false };
  }

  // 5. Create profile record if signup successful
  if (data.user) {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        // Create new profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            user_id: data.user.id,
            email: email,
            display_name: displayName,
            full_name: displayName,
            role: userRole,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail registration if profile creation fails
        }
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error);
      // Don't fail registration if profile creation fails
    }
  }

  // 6. Finalize
  // If no session, it means 'Confirm Email' is still ON in your Supabase Dashboard.
  if (!data.session) {
    return {
      error: null,
      success: true
    };
  }

  // If session exists (Confirm Email is OFF), go straight to overview
  redirect(routes.overview);
}
