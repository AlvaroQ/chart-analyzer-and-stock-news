"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log del error para monitoreo
    logger.exception("Error no manejado en la aplicacion", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-mesh absolute inset-0 opacity-40" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-md">
          {/* Icon */}
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-outfit)]">
              Algo salio mal
            </h1>
            <p className="text-zinc-400 text-lg">
              Ha ocurrido un error inesperado. No te preocupes, puedes intentar
              de nuevo o volver al inicio.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={reset}
              size="lg"
              className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white w-full"
              >
                <Home className="h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>

          {/* Error digest (solo en desarrollo) */}
          {process.env.NODE_ENV === "development" && error.digest && (
            <p className="text-xs text-zinc-600 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
