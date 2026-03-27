import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

export function LoadingSpinner({ className, size = "lg", label = "Loading" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} role="status" aria-label={label}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function CardSkeleton({ className, rows = 1 }: { className?: string; rows?: number }) {
  return (
    <div className={cn("animate-pulse space-y-3", className)} role="status" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-muted" />
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  );
}
