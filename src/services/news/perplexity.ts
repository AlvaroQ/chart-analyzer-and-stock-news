'use client';

/**
 * Adaptador de Perplexity para la busqueda de noticias
 */

import { API_CONFIG } from '@/lib/constants';
import type { PerplexityMessage, PerplexityResponse } from '@/types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import type { NewsAdapter } from './types';

export const searchWithPerplexity: NewsAdapter = async (apiKey, ticker) => {
  const messages: PerplexityMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(ticker) },
  ];

  // Llamar a la API
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    API_CONFIG.PERPLEXITY.TIMEOUT_MS
  );

  let response: Response;
  try {
    response = await fetch(API_CONFIG.PERPLEXITY.URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: API_CONFIG.PERPLEXITY.MODEL,
        messages,
        temperature: API_CONFIG.PERPLEXITY.TEMPERATURE,
        max_tokens: API_CONFIG.PERPLEXITY.MAX_TOKENS,
        top_p: API_CONFIG.PERPLEXITY.TOP_P,
        search_recency_filter: API_CONFIG.PERPLEXITY.SEARCH_RECENCY,
        web_search_options: {
          search_context_size: API_CONFIG.PERPLEXITY.SEARCH_CONTEXT_SIZE,
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La solicitud tardo demasiado. Intente nuevamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  // Manejar errores de la API
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('API Key invalida. Verifica tu configuracion.');
    }
    if (response.status === 429) {
      throw new Error('Demasiadas solicitudes. Espera un momento.');
    }
    throw new Error(`Error de la API de Perplexity: ${response.status}`);
  }

  // Parsear respuesta
  const data: PerplexityResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No se recibio respuesta de la API');
  }

  return content;
};
