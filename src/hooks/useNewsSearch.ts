"use client";

import { useState, useCallback } from "react";
import type { NewsItem, SearchResponse } from "@/types";

/**
 * Estado del hook de busqueda de noticias
 */
interface UseNewsSearchState {
  /** Lista de noticias encontradas */
  news: NewsItem[];
  /** Ticker buscado (normalizado) */
  ticker: string | null;
  /** Indica si hay una busqueda en progreso */
  isLoading: boolean;
  /** Mensaje de error si la busqueda fallo */
  error: string | null;
  /** Indica si se ha realizado alguna busqueda */
  hasSearched: boolean;
}

/**
 * Retorno del hook de busqueda de noticias
 */
interface UseNewsSearchReturn extends UseNewsSearchState {
  /** Ejecuta una busqueda con el ticker dado */
  search: (ticker: string) => Promise<void>;
  /** Resetea el estado del hook */
  reset: () => void;
}

/**
 * Hook personalizado para busqueda de noticias financieras
 *
 * Encapsula toda la logica de:
 * - Llamada a la API
 * - Manejo de estados (loading, error, success)
 * - Validacion basica de input
 *
 * @example
 * ```tsx
 * function SearchPage() {
 *   const { news, isLoading, error, search, reset } = useNewsSearch();
 *
 *   const handleSearch = (ticker: string) => {
 *     search(ticker);
 *   };
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *   return <NewsList news={news} />;
 * }
 * ```
 */
export function useNewsSearch(): UseNewsSearchReturn {
  const [state, setState] = useState<UseNewsSearchState>({
    news: [],
    ticker: null,
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  /**
   * Ejecuta una busqueda de noticias
   */
  const search = useCallback(async (tickerInput: string) => {
    const trimmedTicker = tickerInput.trim();

    if (!trimmedTicker) {
      setState((prev) => ({
        ...prev,
        error: "Por favor, introduce un ticker para buscar",
      }));
      return;
    }

    // Iniciar busqueda
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      hasSearched: true,
    }));

    try {
      const response = await fetch("/api/busqueda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker: trimmedTicker }),
      });

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      // Busqueda exitosa
      setState((prev) => ({
        ...prev,
        news: data.news,
        ticker: data.ticker,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      // Error en la busqueda
      setState((prev) => ({
        ...prev,
        news: [],
        isLoading: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      }));
    }
  }, []);

  /**
   * Resetea el estado del hook
   */
  const reset = useCallback(() => {
    setState({
      news: [],
      ticker: null,
      isLoading: false,
      error: null,
      hasSearched: false,
    });
  }, []);

  return {
    ...state,
    search,
    reset,
  };
}
