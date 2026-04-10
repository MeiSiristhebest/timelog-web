import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent/10 text-accent-strong hover:bg-accent/20",
        secondary:
          "border-transparent bg-muted/10 text-muted hover:bg-muted/20",
        destructive:
          "border-transparent bg-danger/10 text-danger hover:bg-danger/20",
        outline: "text-ink border-line",
        success: "border-success/30 bg-success/10 text-success hover:bg-success/20",
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
