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
  const fallback = DEFAULT_FEATURE_PROVIDER[feature];
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = localStorage.getItem(storageKey(feature));
    if (isProviderId(stored) && providersForFeature(feature).includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.error(`Error reading provider for ${feature}:`, error);
  }
  return fallback;
}

export function saveFeatureProvider(feature: FeatureId, provider: ProviderId): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(storageKey(feature), provider);
  } catch (error) {
    console.error(`Error saving provider for ${feature}:`, error);
  }
}
