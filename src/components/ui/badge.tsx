import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-1 focus:ring-accent/30 uppercase tracking-[0.18em] select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent/10 text-accent-strong hover:bg-accent/20",
        secondary:
          "border-transparent bg-badge-yellow-bg text-badge-yellow-fg hover:opacity-90",
        destructive:
          "border-transparent bg-badge-red-bg text-badge-red-fg hover:opacity-90",
        outline: "text-ink border-line bg-transparent hover:bg-canvas-depth",
        success: "border-transparent bg-badge-green-bg text-badge-green-fg hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
