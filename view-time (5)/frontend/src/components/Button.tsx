import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-[0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-primary text-primary-foreground shadow-[0_14px_28px_hsl(var(--primary)/0.18)] hover:bg-primary/92 hover:shadow-[0_18px_32px_hsl(var(--primary)/0.22)]",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground shadow-[0_12px_24px_hsl(var(--destructive)/0.16)] hover:bg-destructive/92",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary/30 hover:bg-secondary",
        secondary:
          "border border-border bg-card text-foreground shadow-[0_10px_24px_hsl(var(--ink)/0.06)] hover:border-primary/30 hover:bg-background",
        ghost: "text-foreground hover:bg-secondary hover:text-foreground",
        link: "rounded-none px-0 text-primary shadow-none hover:text-primary/80 hover:underline underline-offset-4",
        accent:
          "border border-accent bg-accent text-accent-foreground shadow-[0_12px_24px_hsl(var(--accent)/0.18)] hover:bg-accent/92",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        xl: "h-12 px-8 text-base"
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
