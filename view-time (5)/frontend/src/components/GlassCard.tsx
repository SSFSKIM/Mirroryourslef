import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { type EditorialPanelTone } from "components/EditorialPanel";
import { cn } from "@/lib/utils";
import { staggerItem, hoverLift } from "@/lib/motion";

const glassCardToneClasses: Record<EditorialPanelTone, string> = {
  primary:
    "editorial-panel rounded-[calc(var(--radius)+0.25rem)] border border-primary/20 bg-[linear-gradient(180deg,hsl(var(--signal-soft))_0%,hsl(var(--background))_100%)] p-6 shadow-[0_20px_44px_hsl(var(--primary)/0.08)] transition-[border-color,box-shadow,background-color,transform] duration-200 sm:p-7",
  secondary:
    "editorial-panel rounded-[calc(var(--radius)+0.25rem)] border border-border/90 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background))_100%)] p-6 shadow-[0_18px_40px_hsl(var(--ink)/0.05)] transition-[border-color,box-shadow,background-color,transform] duration-200 sm:p-7",
  quiet:
    "editorial-panel rounded-[calc(var(--radius)+0.25rem)] border border-border/70 bg-[hsl(var(--paper-elevated)/0.82)] p-6 shadow-none transition-[border-color,box-shadow,background-color,transform] duration-200 sm:p-7",
};

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  stagger?: boolean;
  tone?: EditorialPanelTone;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      hover = true,
      stagger = false,
      tone = "secondary",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(glassCardToneClasses[tone], className)}
        variants={stagger ? staggerItem : undefined}
        {...(hover ? hoverLift : {})}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
GlassCard.displayName = "GlassCard";
