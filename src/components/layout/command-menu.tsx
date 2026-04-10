"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  BookAudio,
  Calendar,
  Contact,
  CreditCard,
  FileAudio,
  House,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { routes } from "@/lib/routes"
import { useTranslation } from "@/lib/hooks/use-translation"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative w-full group"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-hover:text-accent transition-colors" />
        <div className="w-full bg-canvas-elevated border border-line-strong rounded-full py-2 pl-10 pr-4 text-sm text-left text-muted font-bold group-hover:border-accent/40 transition-all">
          {t("Dashboard.searchPlaceholder")}
          <CommandShortcut className="absolute right-4 top-1/2 -translate-y-1/2 bg-canvas px-1.5 py-0.5 rounded border border-line text-[10px] opacity-60">
            ⌘K
          </CommandShortcut>
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("Dashboard.searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("Common.noResultsFound") || "No results found."}</CommandEmpty>
          <CommandGroup heading={t("Dashboard.navigation") || "Navigation"}>
            <CommandItem onSelect={() => runCommand(() => router.push(routes.overview))}>
              <House className="mr-2 h-4 w-4" />
              <span>{t("Dashboard.overview")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push(routes.stories))}>
              <BookAudio className="mr-2 h-4 w-4" />
              <span>{t("Dashboard.stories")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push(routes.family))}>
              <Users className="mr-2 h-4 w-4" />
              <span>{t("Dashboard.family")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push(routes.devices))}>
              <RadioTower className="mr-2 h-4 w-4" />
              <span>{t("Dashboard.devices")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push(routes.audit))}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>{t("Dashboard.audit")}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("Dashboard.settings") || "Settings"}>
            <CommandItem onSelect={() => runCommand(() => router.push(routes.settings))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t("Dashboard.settings")}</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push(`${routes.settings}#profile`))}>
              <User className="mr-2 h-4 w-4" />
              <span>{t("Dashboard.profile")}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
