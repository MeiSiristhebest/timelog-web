"use client";

import React from "react";

import { usePathname } from "next/navigation";
import { 
  Bell, 
  Menu,
  ShieldCheck,
  User,
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/hooks/use-translation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandMenu } from "./command-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppHeader({
  isConfigured,
}: {
  isConfigured: boolean;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    
    // Always start with Admin
    breadcrumbs.push({ label: t("Common.admin"), href: routes.overview });

    if (pathname === routes.overview) {
      return breadcrumbs;
    }

    if (pathname === routes.stories) breadcrumbs.push({ label: t("Dashboard.stories"), href: routes.stories });
    else if (pathname === routes.interactions) breadcrumbs.push({ label: t("Dashboard.interactions"), href: routes.interactions });
    else if (pathname === routes.family) breadcrumbs.push({ label: t("Dashboard.family"), href: routes.family });
    else if (pathname === routes.devices) breadcrumbs.push({ label: t("Dashboard.devices"), href: routes.devices });
    else if (pathname === routes.audit) breadcrumbs.push({ label: t("Dashboard.audit"), href: routes.audit });
    else if (pathname === routes.settings) breadcrumbs.push({ label: t("Dashboard.settings"), href: routes.settings });
    else if (pathname.includes("/stories/")) {
      breadcrumbs.push({ label: t("Dashboard.stories"), href: routes.stories });
      breadcrumbs.push({ label: t("Dashboard.storyDetail"), isCurrent: true });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[var(--header)] backdrop-blur-md border-b border-[var(--line)] px-6 flex items-center justify-between">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={bc.label}>
                <BreadcrumbItem>
                  {bc.isCurrent || i === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="font-black text-ink">{bc.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={bc.href || "#"} className="font-bold text-muted transition-colors hover:text-ink">
                        {bc.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <button className="md:hidden p-2 -ml-2 text-muted hover:text-ink transition-colors">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Middle: Command Palette Search */}
      <CommandMenu />

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
          isConfigured 
            ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" 
            : "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        )}>
           <span className={cn(
             "h-1.5 w-1.5 rounded-full",
             isConfigured ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
           )} />
           {isConfigured ? t("Dashboard.syncOnline") : t("Dashboard.previewMode")}
        </div>

        <div className="h-6 w-px bg-line-strong/20 mx-1" />

        <ThemeToggle />

        <button className="relative p-2 rounded-full hover:bg-canvas-depth transition-colors text-muted hover:text-ink">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-danger rounded-full border-2 border-canvas" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 pl-3 rounded-full bg-canvas-depth border border-line ml-2 group hover:border-accent/40 transition-all outline-none">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t("Dashboard.live")}</span>
                <Avatar className="h-6 w-6 border border-white/10">
                  <AvatarFallback className="bg-accent text-[10px] text-accent-foreground font-black">
                    AD
                  </AvatarFallback>
                </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>{t("Dashboard.sessionActions")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`${routes.settings}#profile`} className="flex items-center w-full">
                <User className="mr-2 h-4 w-4" />
                <span>{t("Dashboard.profile")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={routes.settings} className="flex items-center w-full">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>{t("Dashboard.settings")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger focus:text-danger focus:bg-danger/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("Dashboard.leave")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
