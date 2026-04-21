import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import { getLocale, getMessages } from "next-intl/server";
import { LocalesProvider } from "./_locales";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "TimeLog Family Web",
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "TimeLog Family Web",
    template: "%s | TimeLog Family Web",
  },
  description:
    "Protected family listening and archive management for TimeLog stories.",
  referrer: "strict-origin-when-cross-origin",
  keywords: [
    "TimeLog",
    "family archive",
    "story playback",
    "elder storytelling",
    "Supabase",
  ],
  authors: [{ name: "TimeLog" }],
  creator: "TimeLog",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "TimeLog Family Web",
    description:
      "Protected family listening and archive management for TimeLog stories.",
    siteName: "TimeLog Family Web",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TimeLog Family Web",
    description:
      "Protected family listening and archive management for TimeLog stories.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} h-full`}
    >
      <body className="min-h-full bg-canvas text-ink antialiased font-sans" suppressHydrationWarning>
        <Suspense fallback={<div className="min-h-full bg-canvas" />}>
          <LocaleShell>{children}</LocaleShell>
        </Suspense>
      </body>
    </html>
  );
}

async function LocaleShell({ children }: { children: React.ReactNode }) {
  let locale = 'zh';
  let messages;
  try {
    locale = await getLocale();
    messages = await getMessages();
  } catch {
    // Fallback for static generation / error paths
  }

  return (
    <div lang={locale} className="h-full">
      <LocalesProvider locale={locale} messages={messages}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </LocalesProvider>
    </div>
  );
}
