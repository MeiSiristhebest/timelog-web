"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  AudioLines, 
  BellRing, 
  BookAudio, 
  ChevronLeft,
  ChevronRight,
  House, 
  Languages, 
  LogOut,
  RadioTower, 
  Settings, 
  ShieldCheck, 
  Users 
} from "lucide-react";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/hooks/use-translation";
import { logoutAction } from "@/app/(auth)/login/actions";
import { useUiStore } from "@/lib/store/ui-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermissions } from "@/hooks/use-permissions";

function getNavItems(hasPermission: (permission: string) => boolean) {
  const baseItems = [
    { href: routes.overview, labelKey: "overview", icon: House, permission: null },
    { href: routes.stories, labelKey: "stories", icon: BookAudio, permission: 'canViewStories' },
    { href: routes.interactions, labelKey: "interactions", icon: BellRing, permission: 'canViewInteractions' },
    { href: routes.family, labelKey: "family", icon: Users, permission: 'canViewFamily' },
  ];

  const adminItems = [
    { href: routes.devices, labelKey: "devices", icon: RadioTower, permission: 'canManageDevices' },
    { href: routes.audit, labelKey: "audit", icon: ShieldCheck, permission: 'canViewAudit' },
    { href: routes.settings, labelKey: "settings", icon: Settings, permission: 'canAccessSettings' },
  ];

  return [
    ...baseItems.filter(item => !item.permission || hasPermission(item.permission)),
    ...adminItems.filter(item => !item.permission || hasPermission(item.permission)),
  ];
}

export function AppSidebar({
  userEmail,
  userDisplayName,
}: {
  userEmail: string | null;
  userDisplayName?: string | null;
}) {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();
  const { hasPermission, userRole, isLoading } = usePermissions();

  // Debug logging - 管理员检查
  console.log('AppSidebar Debug:');
  console.log('- userRole:', userRole);
  console.log('- isLoading:', isLoading);
  console.log('- isAuthenticated:', !!userEmail);
  console.log('- is family_owner:', userRole === 'family_owner');
  console.log('- canViewStories:', hasPermission('canViewStories'));
  console.log('- canViewAudit:', hasPermission('canViewAudit'));
  console.log('- canManageDevices:', hasPermission('canManageDevices'));

  const navItems = getNavItems(hasPermission);
  const { t, locale, toggleLocale } = useTranslation();
  const initials = (userDisplayName || userEmail || "A")[0].toUpperCase();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        style={{
          backgroundColor: "#0f172a",  /* Slate 900: always dark */
          color: "#e2e8f0",            /* Slate 200: base text on this dark bg, 13.9:1 contrast — AAA */
        }}
        className={cn(
          "fixed left-0 top-0 bottom-0 border-r border-white/8 flex flex-col z-50 overflow-hidden transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-20" : "w-60"
        )}
      >
        {/* ambient top gradient accent strip */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #e2b86d55, transparent)" }}
        />

        {/* ── Logo ── */}
        <div className={cn(
          "px-5 pt-6 pb-4 flex items-center gap-3 shrink-0 transition-all duration-300",
          isSidebarCollapsed ? "px-5" : "px-5"
        )}>
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg, #d4a042, #9a6e1e)" }}
          >
            <AudioLines className="h-5 w-5" style={{ color: "#fff8ed" }} />
          </div>
          {!isSidebarCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <p
                className="text-[9px] font-black tracking-[0.28em] leading-none mb-1"
                style={{ color: "#e2b86d" }}
              >
                {t("Branding.heritage")}
              </p>
              <h2 className="text-[17px] font-black leading-none" style={{ color: "#f1f5f9" }}>
                {t("Branding.timeLog")}
              </h2>
            </div>
          )}
        </div>

        <div className="mx-4 mb-4 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* ── Toggle Button ── */}
        <button
          onClick={toggleSidebar}
          className="absolute right-0 top-12 translate-x-1/2 h-6 w-6 rounded-full border border-white/10 bg-[#1e293b] flex items-center justify-center text-white/60 hover:text-white hover:bg-[#334155] transition-all z-10"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const label = t(`Dashboard.${item.labelKey}`);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    style={isActive ? {
                      backgroundColor: "#1e3a5f",
                      color: "#e2b86d",
                    } : {
                      color: "#cbd5e1",
                    }}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150",
                      isActive ? "shadow-md" : "hover:bg-white/8 hover:text-white",
                      isSidebarCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
                    )}
                  >
                    <Icon
                      className={cn("h-[18px] w-[18px] shrink-0", isSidebarCollapsed ? "" : "")}
                      style={{ opacity: isActive ? 1 : 0.7 }}
                    />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="truncate flex-1 animate-in fade-in slide-in-from-left-1 duration-300">{label}</span>
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        )}
                      </>
                    )}
                  </Link>
                </TooltipTrigger>
                {isSidebarCollapsed && (
                  <TooltipContent side="right" className="bg-slate-900 border-white/10 text-white font-bold">
                    {label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div
          className="shrink-0 mt-auto"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Language toggle */}
          <div className="px-3 pt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleLocale}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors hover:bg-white/8",
                    isSidebarCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
                  )}
                  style={{ color: "#94a3b8" }}
                >
                  <Languages className="h-4 w-4 shrink-0" style={{ color: "#34d399" }} />
                  {!isSidebarCollapsed && <span style={{ color: "#cbd5e1" }} className="animate-in fade-in duration-300">{locale === "en" ? t("Dashboard.langEn") : t("Dashboard.langZh")}</span>}
                </button>
              </TooltipTrigger>
              {isSidebarCollapsed && (
                <TooltipContent side="right" className="bg-slate-900 border-white/10 text-white font-bold">
                  {locale === "en" ? t("Dashboard.switchToZh") : t("Dashboard.switchToEn")}
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* User card / Logout */}
          <div className="p-3">
            <div
              className={cn(
                "rounded-xl p-3 flex flex-col gap-3 transition-all duration-300",
                isSidebarCollapsed ? "p-1 items-center bg-transparent border-0" : "bg-white/5 border border-white/8"
              )}
            >
              {/* User info row */}
              <div className="flex items-center gap-2.5 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black transition-all duration-300"
                      style={{ background: "rgba(226,184,109,0.2)", color: "#e2b86d", border: "1px solid rgba(226,184,109,0.3)" }}
                    >
                      {initials}
                    </div>
                  </TooltipTrigger>
                  {isSidebarCollapsed && (
                    <TooltipContent side="right" className="bg-slate-900 border-white/10 text-white font-bold">
                      {userDisplayName || userEmail || "Admin"}
                    </TooltipContent>
                  )}
                </Tooltip>
                
                {!isSidebarCollapsed && (
                  <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                    <p
                      className="text-[12px] font-bold truncate leading-tight"
                      style={{ color: "#f1f5f9" }}
                    >
                      {userDisplayName || t("Branding.archiveAdmin")}
                    </p>
                    <p
                      className="text-[10px] truncate leading-tight mt-0.5"
                      style={{ color: "#64748b" }}
                    >
                      {userEmail || t("Branding.cloudSyncEnabled")}
                    </p>
                  </div>
                )}
              </div>

              {/* Sign out */}
              <form action={logoutAction} className="w-full">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      className={cn(
                        "flex w-full items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors hover:bg-red-500/15 hover:text-red-400",
                        isSidebarCollapsed ? "px-0 h-10 w-10" : "border border-white/6"
                      )}
                      style={{ color: "#64748b" }}
                    >
                      <LogOut className="h-3 w-3 shrink-0" />
                      {!isSidebarCollapsed && <span className="animate-in fade-in duration-300">{t("Dashboard.leave")}</span>}
                    </button>
                  </TooltipTrigger>
                  {isSidebarCollapsed && (
                    <TooltipContent side="right" className="bg-red-900 border-red-500/20 text-white font-bold">
                      {t("Dashboard.leave")}
                    </TooltipContent>
                  )}
                </Tooltip>
              </form>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
