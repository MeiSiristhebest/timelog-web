/**
 * Next.js Edge Middleware
 *
 * Delegates all logic to src/proxy.ts which handles:
 * 1. Supabase session refresh on every request (prevents "Invalid Refresh Token" errors)
 * 2. Auth-guarded route protection (redirects unauthenticated users to /login)
 * 3. Locale cookie management (NEXT_LOCALE detection)
 *
 * NOTE: Next.js requires `config` to be a static literal here — it cannot be re-exported.
 */
export { proxy as middleware } from "./src/proxy";

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
