import { cn } from "@/lib/utils";

interface AtmosphereProps {
  variant?: "primary" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-[300px] h-[200px]",
  md: "w-[500px] h-[400px]",
  lg: "w-[700px] h-[500px]",
};

export function Atmosphere({ variant = "primary", size = "md", className }: AtmosphereProps) {
  return (
    <div
      className={cn(
        "atmosphere",
        variant === "primary" ? "atmosphere-primary" : "atmosphere-accent",
        sizes[size],
        className,
      )}
      aria-hidden="true"
    />
  );
}
