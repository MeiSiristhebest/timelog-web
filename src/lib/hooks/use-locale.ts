"use client";

import { useEffect, useState } from "react";

export function useLocale(): "en" | "zh" {
  const [locale, setLocale] = useState<"en" | "zh">("en");

  useEffect(() => {
    // Read locale from cookie on client side
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    const cookieLocale = match?.[1] as "en" | "zh" | undefined;
    if (cookieLocale && (cookieLocale === "en" || cookieLocale === "zh")) {
      const timer = setTimeout(() => {
        setLocale(cookieLocale);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  return locale;
}