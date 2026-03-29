import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import {
  EditorialPanel,
  type EditorialPanelTone,
} from "components/EditorialPanel";
import { staggerItem, hoverLift } from "@/lib/motion";

const MotionEditorialPanel = motion(EditorialPanel);

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  stagger?: boolean;
  tone?: EditorialPanelTone;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      hover = true,
      stagger = false,
      tone = "secondary",
      ...props
    },
    ref,
  ) => {
    return (
      <MotionEditorialPanel
        ref={ref}
        tone={tone}
        variants={stagger ? staggerItem : undefined}
        {...(hover ? hoverLift : {})}
        {...props}
      />
    );
  },
);
GlassCard.displayName = "GlassCard";
