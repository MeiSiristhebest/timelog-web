import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. Prioritize the locale passed by next-intl (from URL/Middleware)
  let locale = await requestLocale;

  // 2. Fallback to cookie if requestLocale is not provided (flat structure)
  if (!locale) {
    try {
      const cookieStore = await cookies();
      locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh';
    } catch {
      // Safe fallback for static generation / error routes
      locale = 'zh';
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Shanghai'
  };
});
