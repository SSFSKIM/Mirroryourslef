import * as React from "react";
import { SectionIntro } from "components/SectionIntro";

interface DashboardMastheadProps {
  children?: React.ReactNode; // identity strip slot
}

export function DashboardMasthead({ children }: DashboardMastheadProps) {
  return (
    <div className="mb-10">
      <SectionIntro
        title="Your Latest Edition"
        deck="Your YouTube habits, measured and reflected."
        titleClassName="text-3xl sm:text-4xl"
      />
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
