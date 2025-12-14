"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Loader2,
  Search,
  ArrowLeft,
  Sparkles,
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Calendar,
  Building2,
  Tag,
  AlertCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  impact_level: "HIGH" | "MEDIUM" | "LOW";
  tags: string[];
}

interface SearchResponse {
  ticker: string;
  news: NewsItem[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

const ImpactBadge = ({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) => {
  const config = {
    HIGH: {
      icon: TrendingUp,
      label: "Alto Impacto",
      className: "bg-red-500/20 text-red-400 border-red-500/30",
      glow: "shadow-red-500/20",
    },
    MEDIUM: {
      icon: Minus,
      label: "Impacto Medio",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      glow: "shadow-amber-500/20",
    },
    LOW: {
      icon: TrendingDown,
      label: "Bajo Impacto",
      className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      glow: "shadow-emerald-500/20",
    },
  };

  const { icon: Icon, label, className, glow } = config[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-lg",
        className,
        glow
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const NewsCard = ({ news, index }: { news: NewsItem; index: number }) => {
  return (
    <div
      className="group relative glass rounded-2xl border border-zinc-800/50 overflow-hidden transition-all duration-500 hover:border-violet-500/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <ImpactBadge level={news.impact_level} />
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            {news.date}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white leading-tight group-hover:text-violet-200 transition-colors duration-300">
          {news.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-zinc-400 leading-relaxed">{news.summary}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {news.tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/50 text-zinc-400 text-xs border border-zinc-700/50"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Building2 className="h-4 w-4" />
            <span>{news.source}</span>
          </div>
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-400 text-sm font-medium border border-violet-500/30 hover:bg-violet-600/30 hover:text-violet-300 transition-all duration-300"
          >
            Ver noticia
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default function BusquedaAvanzadaPage() {
  const [ticker, setTicker] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchResult, setSearchResult] = React.useState<SearchResponse | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticker.trim()) {
      toast.error("Por favor, introduce un ticker para buscar");
      return;
    }

    setIsLoading(true);
    setSearchResult(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/busqueda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker: ticker.trim() }),
      });

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en la busqueda");
      }

      setSearchResult(data);
      toast.success(`Se encontraron ${data.news.length} noticias para ${data.ticker}`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Error al realizar la busqueda");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch(e);
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
              <Search className="h-12 w-12 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Buscando noticias...</p>
            <p className="text-sm text-zinc-400">
              Analizando fuentes financieras con IA
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-zinc-500/10 blur-xl" />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50">
              <Newspaper className="h-12 w-12 text-zinc-500" />
            </div>
          </div>
          <p className="text-lg font-semibold text-zinc-300 mb-2">
            Busca noticias financieras
          </p>
          <p className="text-sm text-zinc-500 max-w-md">
            Introduce un ticker (ej: AAPL, TSLA, NVDA) para obtener las noticias mas relevantes de los ultimos dias
          </p>
        </div>
      );
    }

    if (!searchResult || searchResult.news.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl" />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-amber-800/30 to-amber-900/30 border border-amber-700/50">
              <AlertCircle className="h-12 w-12 text-amber-400" />
            </div>
          </div>
          <p className="text-lg font-semibold text-zinc-300 mb-2">
            No se encontraron noticias
          </p>
          <p className="text-sm text-zinc-500 max-w-md">
            No hay noticias relevantes para este ticker en los ultimos dias. Intenta con otro simbolo.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Results header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-violet-600/20 text-violet-400 text-sm font-bold border border-violet-500/30">
              {searchResult.ticker}
            </span>
            <span className="text-sm text-zinc-500">
              {searchResult.news.length} noticia{searchResult.news.length !== 1 ? "s" : ""} encontrada{searchResult.news.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* News cards */}
        <div className="grid gap-4">
          {searchResult.news.map((news, index) => (
            <NewsCard key={index} news={news} index={index} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-mesh absolute inset-0 opacity-60" />
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] animate-blob"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] animate-blob"
          style={{ animationDelay: "-2s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[100px] animate-blob"
          style={{ animationDelay: "-4s" }}
        />
      </div>

      {/* Header Premium */}
      <header className="relative z-10 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 group-hover:bg-zinc-700/50 group-hover:border-zinc-600/50 transition-all duration-300">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline">Volver</span>
            </Link>
            <div className="h-6 w-px bg-zinc-800" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
                <Search className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                  Busqueda Avanzada
                </h1>
                <p className="text-xs text-zinc-500 hidden sm:block">
                  Noticias financieras con Perplexity AI
                </p>
              </div>
            </div>
          </div>

          {/* Badge AI */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-300">IA Activa</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Card */}
          <Card className="glass border-zinc-800/50 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-sm font-bold">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">
                    Buscar Noticias por Ticker
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">
                    Introduce el simbolo de una accion para obtener noticias relevantes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker" className="text-zinc-300 text-sm">
                    Ticker / Simbolo
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        id="ticker"
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyDown}
                        placeholder="Ej: AAPL, TSLA, NVDA..."
                        className="h-12 bg-zinc-900/50 border-zinc-700/50 text-white placeholder:text-zinc-500 text-lg font-medium tracking-wider uppercase focus:border-violet-500/50 focus:ring-violet-500/20 transition-all duration-300"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">
                        <Search className="h-5 w-5" />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !ticker.trim()}
                      size="lg"
                      className={cn(
                        "relative overflow-hidden h-12 px-8 text-base font-semibold rounded-xl",
                        "bg-gradient-to-r from-violet-600 to-fuchsia-600",
                        "hover:from-violet-500 hover:to-fuchsia-500",
                        "disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500",
                        "transition-all duration-300",
                        "shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40",
                        "shimmer-effect"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Buscando
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-5 w-5" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Tips */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                  <AlertCircle className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-violet-200/80">
                    La busqueda extrae las 5 noticias financieras mas relevantes del ultimo mes, priorizando fuentes como Reuters, Bloomberg y Financial Times.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="glass border-zinc-800/50 overflow-hidden">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-sm font-bold">
                  <Newspaper className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">
                    Resultados
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">
                    Noticias financieras ordenadas por relevancia e impacto
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderResults()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
