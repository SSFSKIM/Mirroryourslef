import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
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
    <GlassCard stagger className={className}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-primary/60" aria-hidden="true" />}
      </div>
      <motion.div variants={dataMaterialize}>
        <p className="font-data text-3xl font-bold tracking-tight glow-primary-sm" data-slot="stat">
          {value}
        </p>
      </motion.div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </GlassCard>
  );
}
