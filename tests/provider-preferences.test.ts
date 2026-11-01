import { beforeEach, describe, expect, it } from 'vitest';
import { installLocalStorage } from './setup-local-storage';
import { getFeatureProvider, saveFeatureProvider } from '@/lib/provider-preferences';
import { providersForFeature } from '@/lib/providers';

describe('feature provider preferences', () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = installLocalStorage();
  });

  it('defaults to the original providers', () => {
    expect(getFeatureProvider('chart')).toBe('gemini');
    expect(getFeatureProvider('news')).toBe('perplexity');
  });

  it('persists the selected provider per feature', () => {
    saveFeatureProvider('chart', 'anthropic');
    saveFeatureProvider('news', 'openai');
    expect(getFeatureProvider('chart')).toBe('anthropic');
    expect(getFeatureProvider('news')).toBe('openai');
    expect(store.get('projectia_provider_chart')).toBe('anthropic');
  });

  it('falls back to the default when the stored provider cannot serve the feature', () => {
    store.set('projectia_provider_chart', 'perplexity');
    store.set('projectia_provider_news', 'not-a-provider');
    expect(getFeatureProvider('chart')).toBe('gemini');
    expect(getFeatureProvider('news')).toBe('perplexity');
  });

  it('lists the providers available for each feature', () => {
    expect(providersForFeature('chart')).toEqual(['gemini', 'anthropic', 'openai']);
    expect(providersForFeature('news')).toEqual(['perplexity', 'anthropic', 'openai']);
  });
});
