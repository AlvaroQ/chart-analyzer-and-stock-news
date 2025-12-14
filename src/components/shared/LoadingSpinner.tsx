"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /** Icono a mostrar en el centro */
  icon: LucideIcon;
  /** Titulo principal del loading */
  title: string;
  /** Subtitulo descriptivo */
  subtitle?: string;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Color del icono y efectos (violet, cyan, emerald, etc.) */
  colorTheme?: "violet" | "cyan" | "emerald" | "amber";
}

const colorClasses = {
  violet: {
    blur: "bg-violet-500/20",
    gradient: "from-violet-600/20 to-fuchsia-600/20",
    border: "border-violet-500/30",
    icon: "text-violet-400",
    dots: "bg-violet-500",
  },
  cyan: {
    blur: "bg-cyan-500/20",
    gradient: "from-cyan-600/20 to-blue-600/20",
    border: "border-cyan-500/30",
    icon: "text-cyan-400",
    dots: "bg-cyan-500",
  },
  emerald: {
    blur: "bg-emerald-500/20",
    gradient: "from-emerald-600/20 to-green-600/20",
    border: "border-emerald-500/30",
    icon: "text-emerald-400",
    dots: "bg-emerald-500",
  },
  amber: {
    blur: "bg-amber-500/20",
    gradient: "from-amber-600/20 to-orange-600/20",
    border: "border-amber-500/30",
    icon: "text-amber-400",
    dots: "bg-amber-500",
  },
};

/**
 * Componente de loading reutilizable con animaciones premium
 *
 * @example
 * ```tsx
 * <LoadingSpinner
 *   icon={Search}
 *   title="Buscando noticias..."
 *   subtitle="Analizando fuentes financieras con IA"
 * />
 * ```
 */
export function LoadingSpinner({
  icon: Icon,
  title,
  subtitle,
  className,
  colorTheme = "violet",
}: LoadingSpinnerProps) {
  const colors = colorClasses[colorTheme];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 gap-6",
        className
      )}
    >
      {/* Icon container with glow effect */}
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl animate-pulse",
            colors.blur
          )}
        />
        <div
          className={cn(
            "relative p-6 rounded-full bg-gradient-to-br border",
            colors.gradient,
            colors.border
          )}
        >
          <Icon className={cn("h-12 w-12 animate-pulse", colors.icon)} />
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-white">{title}</p>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
      </div>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn("w-2 h-2 rounded-full animate-bounce", colors.dots)}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
