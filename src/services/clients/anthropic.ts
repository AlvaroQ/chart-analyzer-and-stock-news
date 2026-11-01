'use client';

/**
 * Helpers compartidos para llamar a la API de Claude desde el navegador (BYOK)
 */

import Anthropic from '@anthropic-ai/sdk';
import { PROVIDERS } from '@/lib/providers';

export const CLAUDE_MODEL = 'claude-opus-5-5';

/** Re-ejecuta en el servidor las solicitudes rechazadas con el modelo de respaldo recomendado */
export const CLAUDE_FALLBACK: {
  betas: Anthropic.Beta.AnthropicBeta[];
  fallbacks: Anthropic.Beta.BetaFallbacksParam;
} = {
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default',
};

/**
 * La key es del propio usuario y se guarda en su navegador (BYOK), por eso se
 * permite el acceso directo desde el navegador.
 */
export function createClaudeClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

/** Une los bloques de texto de la respuesta, tras comprobar que no fue rechazada */
export function collectClaudeText(message: Anthropic.Beta.BetaMessage): string {
  if (message.stop_reason === 'refusal') {
    throw new Error('El modelo rechazo la solicitud.');
  }
  const text = message.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
  if (!text) {
    throw new Error('No se recibio respuesta del modelo');
  }
  return text;
}

/** Traduce los errores del SDK a mensajes para el usuario */
export function toClaudeError(error: unknown): unknown {
  if (error instanceof Anthropic.AuthenticationError) {
    return new Error('API Key invalida. Verifica tu configuracion.');
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new Error('Demasiadas solicitudes. Espera un momento.');
  }
  if (error instanceof Anthropic.APIError) {
    return new Error(`Error de la API de ${PROVIDERS.anthropic.name}: ${error.status}`);
  }
  return error;
}
