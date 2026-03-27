import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem, hoverLift } from "@/lib/motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  stagger?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, stagger = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("glass-card p-6", className)}
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
