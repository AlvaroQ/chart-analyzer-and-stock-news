"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Icono a mostrar */
  icon: LucideIcon;
  /** Titulo principal */
  title: string;
  /** Descripcion o subtitulo */
  subtitle?: string;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Color del icono (violet, cyan, emerald, amber, zinc) */
  colorTheme?: "violet" | "cyan" | "emerald" | "amber" | "zinc";
  /** Contenido adicional (botones, links, etc.) */
  children?: React.ReactNode;
}

const colorClasses = {
  violet: {
    blur: "bg-violet-500/10",
    gradient: "from-violet-800/30 to-violet-900/30",
    border: "border-violet-700/50",
    icon: "text-violet-400",
  },
  cyan: {
    blur: "bg-cyan-500/10",
    gradient: "from-cyan-800/30 to-cyan-900/30",
    border: "border-cyan-700/50",
    icon: "text-cyan-400",
  },
  emerald: {
    blur: "bg-emerald-500/10",
    gradient: "from-emerald-800/30 to-emerald-900/30",
    border: "border-emerald-700/50",
    icon: "text-emerald-400",
  },
  amber: {
    blur: "bg-amber-500/10",
    gradient: "from-amber-800/30 to-amber-900/30",
    border: "border-amber-700/50",
    icon: "text-amber-400",
  },
  zinc: {
    blur: "bg-zinc-500/10",
    gradient: "from-zinc-800/50 to-zinc-900/50",
    border: "border-zinc-700/50",
    icon: "text-zinc-500",
  },
};

/**
 * Componente de estado vacio reutilizable
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Newspaper}
 *   title="Busca noticias financieras"
 *   subtitle="Introduce un ticker para obtener las noticias mas relevantes"
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  className,
  colorTheme = "zinc",
  children,
}: EmptyStateProps) {
  const colors = colorClasses[colorTheme];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      {/* Icon container */}
      <div className="relative mb-6">
        <div className={cn("absolute inset-0 rounded-full blur-xl", colors.blur)} />
        <div
          className={cn(
            "relative p-6 rounded-full bg-gradient-to-br border",
            colors.gradient,
            colors.border
          )}
        >
          <Icon className={cn("h-12 w-12", colors.icon)} />
        </div>
      </div>

      {/* Text */}
      <p className="text-lg font-semibold text-zinc-300 mb-2">{title}</p>
      {subtitle && (
        <p className="text-sm text-zinc-500 max-w-md">{subtitle}</p>
      )}

      {/* Children (optional actions) */}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
