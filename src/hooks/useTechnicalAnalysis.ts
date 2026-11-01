'use client';

import { useState, useCallback } from 'react';
import { useApiKeys } from '@/context';
import { analyzeChart, type TechnicalAnalysisOutput } from '@/services';
import { PROVIDERS, type ProviderId } from '@/lib/providers';

/**
 * Estado del hook de analisis tecnico
 */
interface UseTechnicalAnalysisState {
  /** Resultado del analisis */
  result: TechnicalAnalysisOutput | null;
  /** Indica si hay un analisis en progreso */
  isLoading: boolean;
  /** Mensaje de error si el analisis fallo */
  error: string | null;
}

/**
 * Retorno del hook de analisis tecnico
 */
interface UseTechnicalAnalysisReturn extends UseTechnicalAnalysisState {
  /** Ejecuta un analisis con la imagen dada */
  analyze: (imageDataUri: string) => Promise<void>;
  /** Resetea el estado del hook */
  reset: () => void;
  /** Indica si la API key esta configurada */
  hasApiKey: boolean;
  /** Proveedor seleccionado para esta funcionalidad */
  provider: ProviderId;
}

/**
 * Hook personalizado para analisis tecnico de graficos
 *
 * Utiliza el sistema BYOK (Bring Your Own Key) para llamar
 * directamente a la API del proveedor elegido desde el cliente.
 *
 * @example
 * ```tsx
 * function AnalysisPage() {
 *   const { result, isLoading, error, analyze, reset, hasApiKey } = useTechnicalAnalysis();
 *
 *   if (!hasApiKey) return <ConfigureApiKey />;
 *
 *   const handleAnalyze = (imageUri: string) => {
 *     analyze(imageUri);
 *   };
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *   if (result) return <AnalysisResult data={result} />;
 * }
 * ```
 */
export function useTechnicalAnalysis(): UseTechnicalAnalysisReturn {
  const { apiKeys, hasKey, featureProviders } = useApiKeys();
  const provider = featureProviders.chart;
  const apiKey = apiKeys[provider];
  const hasProviderKey = hasKey(provider);

  const [state, setState] = useState<UseTechnicalAnalysisState>({
    result: null,
    isLoading: false,
    error: null,
  });

  /**
   * Ejecuta un analisis tecnico
   */
  const analyze = useCallback(async (imageDataUri: string) => {
    // Validar imagen
    if (!imageDataUri) {
      setState((prev) => ({
        ...prev,
        error: 'Por favor, sube una imagen primero',
      }));
      return;
    }

    // Verificar que la API key este configurada
    if (!hasProviderKey || !apiKey) {
      setState((prev) => ({
        ...prev,
        error: `API Key de ${PROVIDERS[provider].name} no configurada. Ve a Configuracion para agregarla.`,
      }));
      return;
    }

    // Iniciar analisis
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const result = await analyzeChart(provider, {
        apiKey,
        imageDataUri,
      });

      // Analisis exitoso
      setState({
        result,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      // Error en el analisis
      setState({
        result: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error desconocido al analizar',
      });
    }
  }, [apiKey, hasProviderKey, provider]);

  /**
   * Resetea el estado del hook
   */
  const reset = useCallback(() => {
    setState({
      result: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    analyze,
    reset,
    hasApiKey: hasProviderKey,
    provider,
  };
}
