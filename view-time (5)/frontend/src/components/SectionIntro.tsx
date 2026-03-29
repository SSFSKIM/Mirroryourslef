import * as React from "react";

import { cn } from "utils/cn";

interface SectionIntroProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  deck?: React.ReactNode;
  action?: React.ReactNode;
  titleClassName?: string;
  deckClassName?: string;
}

export const SectionIntro = React.forwardRef<HTMLDivElement, SectionIntroProps>(
  (
    {
      action,
      className,
      deck,
      deckClassName,
      eyebrow,
      title,
      titleClassName,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="max-w-3xl space-y-3">
        {eyebrow ? (
          <div className="section-eyebrow">
            {typeof eyebrow === "string" ? <span>{eyebrow}</span> : eyebrow}
          </div>
        ) : null}
        <div className="space-y-2">
          <h2
            className={cn(
              "font-display text-2xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-3xl",
              titleClassName,
            )}
          >
            {title}
          </h2>
          {deck ? (
            <div
              className={cn(
                "max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base",
                deckClassName,
              )}
            >
              {deck}
            </div>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0 sm:pl-6">{action}</div> : null}
    </div>
  ),
);

SectionIntro.displayName = "SectionIntro";
