/**
 * Registry of AI providers supported by the app (BYOK).
 * Single source of truth for provider metadata, key validation and capabilities.
 */

export const PROVIDER_IDS = ['gemini', 'perplexity', 'anthropic', 'openai'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

/** App features that are backed by an AI provider */
export const FEATURE_IDS = ['chart', 'news'] as const;
export type FeatureId = (typeof FEATURE_IDS)[number];

export interface ProviderConfig {
  /** Display name */
  name: string;
  /** Short description shown in the configuration page */
  description: string;
  /** Model label shown in the UI */
  modelLabel: string;
  /** Key format validation */
  pattern: RegExp;
  /** Where users can create a key */
  helpUrl: string;
  /** Input placeholder; its prefix is used in validation messages */
  placeholder: string;
  /** localStorage key (existing values must not change) */
  storageKey: string;
  /** Features this provider can serve */
  features: readonly FeatureId[];
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Analisis tecnico con vision por IA',
    modelLabel: 'Gemini 2.0 Flash',
    pattern: /^AIza[a-zA-Z0-9_-]{35,}$/,
    helpUrl: 'https://aistudio.google.com/apikey',
    placeholder: 'AIza...',
    storageKey: 'projectia_gemini_api_key',
    features: ['chart'],
  },
  perplexity: {
    name: 'Perplexity',
    description: 'Busqueda avanzada de noticias financieras',
    modelLabel: 'Perplexity Sonar Pro',
    pattern: /^pplx-[a-zA-Z0-9]{40,}$/,
    helpUrl: 'https://www.perplexity.ai/settings/api',
    placeholder: 'pplx-...',
    storageKey: 'projectia_perplexity_api_key',
    features: ['news'],
  },
  anthropic: {
    name: 'Anthropic Claude',
    description: 'Analisis de graficos y busqueda de noticias con busqueda web',
    modelLabel: 'Claude Opus 5.5',
    pattern: /^sk-ant-[a-zA-Z0-9_-]{20,}$/,
    helpUrl: 'https://platform.claude.com/settings/keys',
    placeholder: 'sk-ant-...',
    storageKey: 'projectia_anthropic_api_key',
    features: ['chart', 'news'],
  },
  openai: {
    name: 'OpenAI',
    description: 'Analisis de graficos y busqueda de noticias con busqueda web',
    modelLabel: 'GPT-6 Astra',
    pattern: /^sk-(?!ant-)[a-zA-Z0-9_-]{20,}$/,
    helpUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
    storageKey: 'projectia_openai_api_key',
    features: ['chart', 'news'],
  },
};

/** Default provider per feature (preserves the original behavior) */
export const DEFAULT_FEATURE_PROVIDER: Record<FeatureId, ProviderId> = {
  chart: 'gemini',
  news: 'perplexity',
};

/** Providers that can serve a feature, in registry order */
export function providersForFeature(feature: FeatureId): ProviderId[] {
  return PROVIDER_IDS.filter((id) => PROVIDERS[id].features.includes(feature));
}

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === 'string' && (PROVIDER_IDS as readonly string[]).includes(value);
}
