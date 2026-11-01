'use client';

/**
 * Adaptador de OpenAI para la busqueda de noticias (con busqueda web)
 */

import {
  OPENAI_MODEL,
  collectOpenAIText,
  createOpenAIClient,
  toOpenAIError,
} from '@/services/clients/openai';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import type { NewsAdapter } from './types';

export const searchWithOpenAI: NewsAdapter = async (apiKey, ticker) => {
  const client = createOpenAIClient(apiKey);

  try {
    const response = await client.responses.create({
      model: OPENAI_MODEL,
      instructions: SYSTEM_PROMPT,
      input: buildUserPrompt(ticker),
      tools: [{ type: 'web_search' }],
    });
    return collectOpenAIText(response);
  } catch (error) {
    throw toOpenAIError(error);
  }
};
