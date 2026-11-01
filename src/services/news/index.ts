/**
 * Busqueda de noticias financieras con el proveedor elegido
 */

import { PROVIDERS, type ProviderId } from '@/lib/providers';
import { searchWithPerplexity } from './perplexity';
import { parseNewsResponse, validateTicker } from './prompt';
import type { NewsAdapter, NewsSearchOptions, NewsSearchResult } from './types';

export type { NewsSearchOptions, NewsSearchResult } from './types';

const NEWS_ADAPTERS: Partial<Record<ProviderId, NewsAdapter>> = {
  perplexity: searchWithPerplexity,
};

export async function searchNews(
  provider: ProviderId,
  { apiKey, ticker }: NewsSearchOptions,
): Promise<NewsSearchResult> {
  const adapter = NEWS_ADAPTERS[provider];
  if (!adapter) {
    throw new Error(`${PROVIDERS[provider].name} no soporta esta funcionalidad`);
  }

  const tickerValidation = validateTicker(ticker);
  if (!tickerValidation.valid) {
    throw new Error(tickerValidation.error);
  }
  const normalizedTicker = tickerValidation.normalized!;

  const content = await adapter(apiKey, normalizedTicker);
  return { ticker: normalizedTicker, news: parseNewsResponse(content) };
}
