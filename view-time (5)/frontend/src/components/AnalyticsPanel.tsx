import * as React from "react";

import { EditorialPanel } from "components/EditorialPanel";
import { SectionIntro } from "components/SectionIntro";
import { cn } from "utils/cn";

interface AnalyticsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  caption?: React.ReactNode;
}

export const AnalyticsPanel = React.forwardRef<HTMLDivElement, AnalyticsPanelProps>(
  ({ caption, children, className, eyebrow, title, ...props }, ref) => (
    <EditorialPanel
      ref={ref}
      className={cn("flex h-full flex-col gap-5", className)}
      tone="secondary"
      {...props}
    >
      <SectionIntro
        eyebrow={eyebrow}
        title={title}
        deck={caption}
        deckClassName="chart-caption max-w-2xl text-sm leading-6"
        titleClassName="text-xl sm:text-2xl"
      />
      <div className="flex-1 border-t border-border/70 pt-5">{children}</div>
    </EditorialPanel>
  ),
);

AnalyticsPanel.displayName = "AnalyticsPanel";
