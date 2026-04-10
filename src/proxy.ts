import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Handle Locale Detection (Manual cookie management for flat structure)
  let locale = request.cookies.get("NEXT_LOCALE")?.value;
  if (!locale) {
    // Detect from Accept-Language header or default to 'zh'
    const acceptLanguage = request.headers.get("accept-language") || "";
    locale = acceptLanguage.startsWith("en") ? "en" : "zh";
    response.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 });
  }

  // 2. Supabase Session Check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.has(pathname) || pathname === "/";

  if (!session && !isPublicPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isPublicPath && pathname !== "/overview") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/overview";
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
