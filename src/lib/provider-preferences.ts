/**
 * Persists which provider the user selected for each feature.
 */

import {
  DEFAULT_FEATURE_PROVIDER,
  isProviderId,
  providersForFeature,
  type FeatureId,
  type ProviderId,
} from '@/lib/providers';

function storageKey(feature: FeatureId): string {
  return `projectia_provider_${feature}`;
}

/**
 * Returns the stored provider for a feature, or the default when missing/invalid.
 */
export function getFeatureProvider(feature: FeatureId): ProviderId {
  return getStoredFeatureProvider(feature) ?? DEFAULT_FEATURE_PROVIDER[feature];
}

/**
 * Returns the provider the user explicitly chose for a feature, or null.
 */
export function getStoredFeatureProvider(feature: FeatureId): ProviderId | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(storageKey(feature));
    if (isProviderId(stored) && providersForFeature(feature).includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.error(`Error reading provider for ${feature}:`, error);
  }
  return null;
}

/**
 * Provider to use for a feature: the explicit choice if any; otherwise the
 * default when its key is configured, else the first configured provider.
 */
export function resolveFeatureProvider(
  feature: FeatureId,
  hasKey: (provider: ProviderId) => boolean,
): ProviderId {
  const stored = getStoredFeatureProvider(feature);
  if (stored) return stored;

  const fallback = DEFAULT_FEATURE_PROVIDER[feature];
  if (hasKey(fallback)) return fallback;

  return providersForFeature(feature).find((id) => hasKey(id)) ?? fallback;
}

export function saveFeatureProvider(feature: FeatureId, provider: ProviderId): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(storageKey(feature), provider);
  } catch (error) {
    console.error(`Error saving provider for ${feature}:`, error);
  }
}
