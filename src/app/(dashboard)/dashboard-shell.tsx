"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { LocaleProvider } from "@/lib/hooks/use-translation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store/ui-store";

interface DashboardShellProps {
  children: ReactNode;
  isConfigured: boolean;
  userEmail: string | null;
  userDisplayName?: string | null;
}


function DashboardShellInner({
  children,
  isConfigured,
  userEmail,
  userDisplayName,
}: DashboardShellProps) {
  const { isSidebarCollapsed } = useUiStore();

  return (
    <div className="flex min-h-screen bg-[var(--canvas)]">
      {/* Sidebar - Position handled internally by aside class */}
      <AppSidebar 
        userEmail={userEmail} 
        userDisplayName={userDisplayName} 
      />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "pl-20" : "pl-60"
        )}
      >
        <AppHeader isConfigured={isConfigured} />
        
        <main className="flex-1 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  isConfigured,
  userEmail,
  userDisplayName,
}: DashboardShellProps) {
  return (
    <LocaleProvider>
      <DashboardShellInner
        isConfigured={isConfigured}
        userEmail={userEmail}
        userDisplayName={userDisplayName}
      >
        {children}
      </DashboardShellInner>
    </LocaleProvider>
  );
}
