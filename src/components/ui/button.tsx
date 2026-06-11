import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 uppercase tracking-[0.18em] active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-canvas shadow-sm hover:bg-accent-strong hover:shadow-[0_8px_30px_rgba(140,109,62,0.15)] dark:hover:shadow-[0_8px_30px_rgba(212,175,55,0.1)]",
        destructive:
          "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
        outline:
          "border border-line bg-transparent shadow-sm hover:bg-canvas-depth hover:text-ink hover:border-line-strong",
        secondary:
          "bg-muted/10 text-muted border border-muted/20 hover:bg-muted/20",
        ghost: "hover:bg-canvas-depth hover:text-ink",
        link: "text-accent-strong underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
