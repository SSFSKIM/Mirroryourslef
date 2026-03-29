import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";
import { dataMaterialize } from "@/lib/motion";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, subtitle, icon: Icon, className }: StatCardProps) {
  return (
    <GlassCard stagger className={cn("stat-block flex h-full flex-col gap-4 p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />}
      </div>
      <motion.div variants={dataMaterialize}>
        <p
          className="font-data text-4xl font-semibold leading-none tracking-[-0.08em] text-foreground sm:text-[2.5rem]"
          data-slot="stat"
        >
          {value}
        </p>
      </motion.div>
      {subtitle && (
        <p className="max-w-[28ch] text-sm leading-6 text-muted-foreground">{subtitle}</p>
      )}
    </GlassCard>
  );
}
