"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** URL para el boton de volver */
  backHref?: string;
  /** Texto del boton de volver */
  backLabel?: string;
  /** Icono principal del header */
  icon: LucideIcon;
  /** Titulo de la pagina */
  title: string;
  /** Subtitulo descriptivo */
  subtitle?: string;
  /** Mostrar badge de IA activa */
  showAiBadge?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Header de pagina reutilizable con estilo premium
 *
 * @example
 * ```tsx
 * <PageHeader
 *   backHref="/"
 *   icon={Search}
 *   title="Busqueda Avanzada"
 *   subtitle="Noticias financieras con Perplexity AI"
 *   showAiBadge
 * />
 * ```
 */
export function PageHeader({
  backHref = "/",
  backLabel = "Volver",
  icon: Icon,
  title,
  subtitle,
  showAiBadge = true,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative z-10 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left side - Back button and title */}
        <div className="flex items-center gap-4">
          {/* Back button */}
          <Link
            href={backHref}
            className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 group-hover:bg-zinc-700/50 group-hover:border-zinc-600/50 transition-all duration-300">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-zinc-800" />

          {/* Title section */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
              <Icon className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-zinc-500 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right side - AI Badge */}
        {showAiBadge && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-300">IA Activa</span>
          </div>
        )}
      </div>
    </header>
  );
}
