/** Shared tooltip style object for Recharts charts — ensures consistent theming */
export const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--card) / 0.8)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid hsl(var(--border) / 0.5)",
  borderRadius: "8px",
  color: "hsl(var(--card-foreground))",
  fontSize: "12px",
  boxShadow: "0 0 20px hsl(var(--glow-primary) / 0.08)",
};

import React from "react";

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => [string, string];
}

/** Reusable custom tooltip component for Recharts */
export function ChartTooltipContent({ active, payload, label, formatter }: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-card-foreground">{label}</p>}
      {payload.map((entry, i) => {
        const [formattedValue, formattedName] = formatter
          ? formatter(entry.value, entry.name)
          : [String(entry.value), entry.name];
        return (
          <p key={i} className="text-muted-foreground">
            <span className="text-card-foreground font-medium">{formattedValue}</span>
            {formattedName && <span className="ml-1">{formattedName}</span>}
          </p>
        );
      })}
    </div>
  );
}
