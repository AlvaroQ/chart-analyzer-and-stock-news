/**
 * Tipos para el sistema BYOK (Bring Your Own Key)
 */

import type { FeatureId, ProviderId } from '@/lib/providers';

export type { FeatureId, ProviderId } from '@/lib/providers';

/** Alias kept for existing components */
export type ApiKeyType = ProviderId;

export type ApiKeys = Record<ProviderId, string | null>;

export interface ApiKeysContextValue {
  apiKeys: ApiKeys;
  setApiKey: (provider: ProviderId, key: string | null) => void;
  hasKey: (provider: ProviderId) => boolean;
  clearAllKeys: () => void;
  /** Selected provider for each feature */
  featureProviders: Record<FeatureId, ProviderId>;
  setFeatureProvider: (feature: FeatureId, provider: ProviderId) => void;
  isLoading: boolean;
}

export interface ApiKeyConfig {
  pattern: RegExp;
  helpUrl: string;
  name: string;
  placeholder: string;
}
