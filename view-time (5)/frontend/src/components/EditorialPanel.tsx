import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "utils/cn";

const editorialPanelVariants = cva(
  "editorial-panel rounded-[calc(var(--radius)+0.25rem)] p-6 sm:p-7 transition-[border-color,box-shadow,background-color,transform] duration-200",
  {
    variants: {
      tone: {
        primary:
          "border-primary/20 bg-[linear-gradient(180deg,hsl(var(--signal-soft))_0%,hsl(var(--background))_100%)] shadow-[0_20px_44px_hsl(var(--primary)/0.08)]",
        secondary:
          "border-border/90 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background))_100%)] shadow-[0_18px_40px_hsl(var(--ink)/0.05)]",
        quiet:
          "border-border/70 bg-[hsl(var(--paper-elevated)/0.82)] shadow-none",
      },
    },
    defaultVariants: {
      tone: "secondary",
    },
  },
);

export type EditorialPanelTone = NonNullable<
  VariantProps<typeof editorialPanelVariants>["tone"]
>;

export interface EditorialPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof editorialPanelVariants> {}

export const EditorialPanel = React.forwardRef<HTMLDivElement, EditorialPanelProps>(
  ({ className, tone, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(editorialPanelVariants({ tone }), className)}
      {...props}
    />
  ),
);

EditorialPanel.displayName = "EditorialPanel";
