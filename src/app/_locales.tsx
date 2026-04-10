"use client";

import { NextIntlClientProvider } from "next-intl";
import { LocaleProvider } from "@/lib/hooks/use-translation";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function LocalesProvider({ 
  children,
  locale = "zh",
  messages
}: { 
  children: React.ReactNode;
  locale?: string;
  messages?: any;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Asia/Shanghai"
      >
        <LocaleProvider initialLocale={locale}>
          {children}
        </LocaleProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}