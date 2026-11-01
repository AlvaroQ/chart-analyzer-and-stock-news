'use client';

/**
 * Context para manejar API keys del usuario y el proveedor elegido por funcionalidad
 * Sistema BYOK (Bring Your Own Key)
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  getApiKey,
  saveApiKey,
  removeApiKey,
  clearAllApiKeys,
} from '@/lib/api-keys-storage';
import { getFeatureProvider, saveFeatureProvider } from '@/lib/provider-preferences';
import {
  DEFAULT_FEATURE_PROVIDER,
  FEATURE_IDS,
  PROVIDER_IDS,
  type FeatureId,
  type ProviderId,
} from '@/lib/providers';
import type { ApiKeys, ApiKeysContextValue } from '@/types';

const ApiKeysContext = createContext<ApiKeysContextValue | null>(null);

function emptyKeys(): ApiKeys {
  return Object.fromEntries(PROVIDER_IDS.map((id) => [id, null])) as ApiKeys;
}

interface ApiKeysProviderProps {
  children: ReactNode;
}

export function ApiKeysProvider({ children }: ApiKeysProviderProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(emptyKeys);
  const [featureProviders, setFeatureProviders] =
    useState<Record<FeatureId, ProviderId>>(DEFAULT_FEATURE_PROVIDER);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar keys y preferencias de localStorage al montar
  useEffect(() => {
    setApiKeys(
      Object.fromEntries(PROVIDER_IDS.map((id) => [id, getApiKey(id)])) as ApiKeys,
    );
    setFeatureProviders(
      Object.fromEntries(
        FEATURE_IDS.map((feature) => [feature, getFeatureProvider(feature)]),
      ) as Record<FeatureId, ProviderId>,
    );
    setIsLoading(false);
  }, []);

  const setApiKey = useCallback((provider: ProviderId, key: string | null) => {
    if (key) {
      saveApiKey(provider, key);
    } else {
      removeApiKey(provider);
    }
    setApiKeys((prev) => ({ ...prev, [provider]: key || null }));
  }, []);

  const hasKey = useCallback(
    (provider: ProviderId) => {
      const key = apiKeys[provider];
      return key !== null && key.length > 0;
    },
    [apiKeys],
  );

  const handleClearAllKeys = useCallback(() => {
    clearAllApiKeys();
    setApiKeys(emptyKeys());
  }, []);

  const setFeatureProvider = useCallback((feature: FeatureId, provider: ProviderId) => {
    saveFeatureProvider(feature, provider);
    setFeatureProviders((prev) => ({ ...prev, [feature]: provider }));
  }, []);

  const value = useMemo<ApiKeysContextValue>(
    () => ({
      apiKeys,
      setApiKey,
      hasKey,
      clearAllKeys: handleClearAllKeys,
      featureProviders,
      setFeatureProvider,
      isLoading,
    }),
    [apiKeys, setApiKey, hasKey, handleClearAllKeys, featureProviders, setFeatureProvider, isLoading],
  );

  return (
    <ApiKeysContext.Provider value={value}>
      {children}
    </ApiKeysContext.Provider>
  );
}

export function useApiKeys(): ApiKeysContextValue {
  const context = useContext(ApiKeysContext);
  if (!context) {
    throw new Error('useApiKeys must be used within ApiKeysProvider');
  }
  return context;
}
