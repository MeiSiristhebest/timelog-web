"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? routes.overview);

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      error:
        "Supabase is not configured in this environment yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        return {
          error: "Invalid email or password. Please check your credentials and ensure your email is verified. If you haven't verified your email yet, please check your inbox for the verification link."
        };
      }
      return { error: error.message };
    }

    // Check if we got a session
    if (!data.session) {
      return {
        error: "Login successful but no session created. This might be due to email verification requirements."
      };
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message?.includes('fetch failed')) {
      return { error: "Network connection reset. If you are using a proxy or VPN, please check your settings." };
    }
    return { error: "An unexpected connection error occurred. Please try again." };
  }

  redirect(next.startsWith("/") ? (next as Route) : routes.overview);
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase?.auth.signOut();
  redirect(routes.login);
}
