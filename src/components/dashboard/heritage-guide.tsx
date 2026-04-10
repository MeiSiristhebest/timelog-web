"use client";

import React from "react";
import { Sparkles, Info, Heart, Shield, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

type GuideType = "info" | "success" | "warmth" | "security" | "hardware";

interface HeritageGuideProps {
  title: string;
  description: string;
  type?: GuideType;
  className?: string;
}

const config = {
  info: {
    icon: Info,
    bg: "bg-canvas-depth",
    border: "border-line",
    text: "text-accent-strong",
    iconBg: "bg-accent/10",
  },
  success: {
    icon: Sparkles,
    bg: "bg-accent/5",
    border: "border-accent/10",
    text: "text-accent-strong",
    iconBg: "bg-accent/10",
  },
  warmth: {
    icon: Heart,
    bg: "bg-accent/5",
    border: "border-accent/10",
    text: "text-accent-strong",
    iconBg: "bg-accent/10",
  },
  security: {
    icon: Shield,
    bg: "bg-canvas-depth",
    border: "border-line",
    text: "text-muted",
    iconBg: "bg-line/50",
  },
  hardware: {
    icon: Cpu,
    bg: "bg-canvas-depth",
    border: "border-line",
    text: "text-accent-strong",
    iconBg: "bg-accent/10",
  },
};

export function HeritageGuide({
  title,
  description,
  type = "warmth",
  className,
}: HeritageGuideProps) {
  const { icon: Icon, bg, border, text, iconBg } = config[type];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border p-6 transition-all animate-in fade-in slide-in-from-top-4 duration-700",
        bg,
        border,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm", iconBg)}>
          <Icon className={cn("h-5 w-5", text)} />
        </div>
        <div className="space-y-1">
          <p className={cn("eyebrow leading-none", text)}>{title}</p>
          <p className="text-sm leading-relaxed text-ink/70">
            {description}
          </p>
        </div>
      </div>
      
      {/* Decorative subtle background shapes */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}
