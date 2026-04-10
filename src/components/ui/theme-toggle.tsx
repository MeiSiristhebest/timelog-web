"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "relative p-2 rounded-full transition-all duration-300",
        "bg-canvas-depth hover:bg-line text-muted hover:text-ink",
        "dark:bg-white/5 dark:hover:bg-white/10 dark:text-accent"
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5">
        <Sun className={cn(
          "h-5 w-5 transition-all duration-500 absolute inset-0",
          "rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
        )} />
        <Moon className={cn(
          "h-5 w-5 transition-all duration-500 absolute inset-0",
          "rotate-90 scale-0 dark:rotate-0 dark:scale-100"
        )} />
      </div>
    </button>
  );
}
