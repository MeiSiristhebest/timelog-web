"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useTransition } from "react";

interface LocaleContextType {
  locale: string;
  toggleLocale: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

/**
 * LocaleProvider bridges next-intl's context into our custom useTranslation()
 * hook. We use explicit props (initialLocale) to prevent "No intl context found"
 * errors during initial SSR/Hydration race conditions.
 */
export function LocaleProvider({ 
  children,
  initialLocale = "zh"
}: { 
  children: React.ReactNode;
  initialLocale?: string;
}) {
  let locale = initialLocale;
  let t_intl: any = null;

  // We wrap next-intl hooks in a try/catch to handle SSR race conditions safely.
  // If they throw, we fall back to the initialLocale and a basic identify function.
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    locale = useLocale();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    t_intl = useTranslations();
  } catch {
    // During pure server-side render pass, these hooks might throw "No intl context found"
    // even if wrapped by NextIntlClientProvider. We handle it gracefully.
  }

  const router = useRouter();
  const [, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "zh" : "en";
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  const t = (key: string, params?: Record<string, any>): string => {
    if (!t_intl) return key;
    try {
      return t_intl(key as any, params);
    } catch {
      return key;
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error(
      "useTranslation must be used within a <LocaleProvider>. " +
      "Check layout.tsx > LocaleShell > LocalesProvider."
    );
  }
  return context;
}
