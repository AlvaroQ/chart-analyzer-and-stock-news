"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-mesh absolute inset-0 opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-lg">
          {/* 404 Number */}
          <div className="relative">
            <span className="text-[150px] font-bold text-zinc-900 font-[family-name:var(--font-outfit)] leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent font-[family-name:var(--font-outfit)]">
                404
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)]">
              Pagina no encontrada
            </h1>
            <p className="text-zinc-400 text-lg">
              Lo sentimos, la pagina que buscas no existe o ha sido movida.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 w-full sm:w-auto"
              >
                <Home className="h-4 w-4" />
                Ir al inicio
              </Button>
            </Link>
            <Link href="/busqueda-avanzada">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white w-full sm:w-auto"
              >
                <Search className="h-4 w-4" />
                Buscar noticias
              </Button>
            </Link>
          </div>

          {/* Back link */}
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la pagina anterior
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
