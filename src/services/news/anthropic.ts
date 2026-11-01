'use client';

/**
 * Adaptador de Claude para la busqueda de noticias (con busqueda web)
 */

import type Anthropic from '@anthropic-ai/sdk';
import {
  CLAUDE_FALLBACK,
  CLAUDE_MODEL,
  collectClaudeText,
  createClaudeClient,
  toClaudeError,
} from '@/services/clients/anthropic';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import type { NewsAdapter } from './types';

/** Continuaciones permitidas cuando la busqueda web pausa el turno */
const MAX_CONTINUATIONS = 3;

export const searchWithClaude: NewsAdapter = async (apiKey, ticker) => {
  const client = createClaudeClient(apiKey);
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: 'user', content: buildUserPrompt(ticker) },
  ];

  try {
    for (let attempt = 0; attempt <= MAX_CONTINUATIONS; attempt++) {
      const message = await client.beta.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        ...CLAUDE_FALLBACK,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'medium' },
        system: SYSTEM_PROMPT,
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
        messages,
      });

      if (message.stop_reason !== 'pause_turn') {
        return collectClaudeText(message);
      }
      // La busqueda web pauso el turno: reenviar para que el servidor continue
      messages.push({ role: 'assistant', content: message.content });
    }
  } catch (error) {
    throw toClaudeError(error);
  }

  throw new Error('La busqueda tardo demasiado. Intente nuevamente.');
};
