import * as React from "react";

interface DashboardMastheadProps {
  children?: React.ReactNode; // identity strip slot
}

export function DashboardMasthead({ children }: DashboardMastheadProps) {
  return (
    <div className="mb-10 space-y-3">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-[-0.04em] text-foreground">
        Your Latest Edition
      </h1>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
        Your YouTube habits, measured and reflected.
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
