/**
 * Funciones para manejar API keys en localStorage
 * Sistema BYOK (Bring Your Own Key)
 */

import type { ApiKeyType } from '@/types';
import { PROVIDER_IDS, PROVIDERS } from '@/lib/providers';

/**
 * Guarda una API key en localStorage
 */
export function saveApiKey(type: ApiKeyType, key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PROVIDERS[type].storageKey, key.trim());
  } catch (error) {
    console.error(`Error saving ${type} API key:`, error);
  }
}

/**
 * Obtiene una API key de localStorage
 */
export function getApiKey(type: ApiKeyType): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = localStorage.getItem(PROVIDERS[type].storageKey);
    return key || null;
  } catch (error) {
    console.error(`Error getting ${type} API key:`, error);
    return null;
  }
}

/**
 * Elimina una API key de localStorage
 */
export function removeApiKey(type: ApiKeyType): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PROVIDERS[type].storageKey);
  } catch (error) {
    console.error(`Error removing ${type} API key:`, error);
  }
}

/**
 * Elimina todas las API keys de localStorage
 */
export function clearAllApiKeys(): void {
  if (typeof window === 'undefined') return;

  try {
    for (const id of PROVIDER_IDS) {
      localStorage.removeItem(PROVIDERS[id].storageKey);
    }
  } catch (error) {
    console.error('Error clearing API keys:', error);
  }
}

/**
 * Verifica si hay una API key guardada
 */
export function hasApiKey(type: ApiKeyType): boolean {
  const key = getApiKey(type);
  return key !== null && key.length > 0;
}
