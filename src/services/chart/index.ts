/**
 * Analisis tecnico de graficos con el proveedor elegido
 */

import { PROVIDERS, type ProviderId } from '@/lib/providers';
import { analyzeWithGemini } from './gemini';
import { parseImageDataUri, parseTechnicalAnalysis } from './prompt';
import type { ChartAdapter, ChartAnalysisOptions, TechnicalAnalysisOutput } from './types';

export type { ChartAnalysisOptions, TechnicalAnalysisOutput } from './types';

const CHART_ADAPTERS: Partial<Record<ProviderId, ChartAdapter>> = {
  gemini: analyzeWithGemini,
};

export async function analyzeChart(
  provider: ProviderId,
  { apiKey, imageDataUri }: ChartAnalysisOptions,
): Promise<TechnicalAnalysisOutput> {
  const adapter = CHART_ADAPTERS[provider];
  if (!adapter) {
    throw new Error(`${PROVIDERS[provider].name} no soporta esta funcionalidad`);
  }

  const image = parseImageDataUri(imageDataUri);
  const text = await adapter(apiKey, image);
  return parseTechnicalAnalysis(text);
}
