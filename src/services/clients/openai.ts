'use client';

/**
 * Helpers compartidos para llamar a la API de OpenAI desde el navegador (BYOK)
 */

import OpenAI from 'openai';
import { PROVIDERS } from '@/lib/providers';

export const OPENAI_MODEL = 'gpt-6-astra';

/**
 * La key es del propio usuario y se guarda en su navegador (BYOK), por eso se
 * permite el acceso directo desde el navegador.
 */
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

/** Devuelve el texto final, tras comprobar que no fue rechazado */
export function collectOpenAIText(response: OpenAI.Responses.Response): string {
  const refused = response.output.some(
    (item) => item.type === 'message' && item.content.some((part) => part.type === 'refusal'),
  );
  if (refused) {
    throw new Error('El modelo rechazo la solicitud.');
  }
  if (!response.output_text) {
    throw new Error('No se recibio respuesta del modelo');
  }
  return response.output_text;
}

/** Traduce los errores del SDK a mensajes para el usuario */
export function toOpenAIError(error: unknown): unknown {
  if (error instanceof OpenAI.AuthenticationError) {
    return new Error('API Key invalida. Verifica tu configuracion.');
  }
  if (error instanceof OpenAI.RateLimitError) {
    return new Error('Demasiadas solicitudes. Espera un momento.');
  }
  if (error instanceof OpenAI.APIError) {
    return new Error(`Error de la API de ${PROVIDERS.openai.name}: ${error.status}`);
  }
  return error;
}
