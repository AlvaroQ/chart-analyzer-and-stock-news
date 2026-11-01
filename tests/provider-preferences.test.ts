import { beforeEach, describe, expect, it } from 'vitest';
import { installLocalStorage } from './setup-local-storage';
import {
  getFeatureProvider,
  resolveFeatureProvider,
  saveFeatureProvider,
} from '@/lib/provider-preferences';
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

describe('resolveFeatureProvider', () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = installLocalStorage();
  });

  const keys = (...ids: string[]) => (id: string) => ids.includes(id);

  it('uses a configured provider when the user never chose one', () => {
    expect(resolveFeatureProvider('chart', keys('anthropic'))).toBe('anthropic');
    expect(resolveFeatureProvider('news', keys('openai'))).toBe('openai');
  });

  it('prefers the default provider when its key is configured', () => {
    expect(resolveFeatureProvider('chart', keys('gemini', 'anthropic'))).toBe('gemini');
  });

  it('keeps the default when no provider has a key', () => {
    expect(resolveFeatureProvider('chart', keys())).toBe('gemini');
    expect(resolveFeatureProvider('news', keys())).toBe('perplexity');
  });

  it('respects an explicit choice even without a key', () => {
    store.set('projectia_provider_chart', 'openai');
    expect(resolveFeatureProvider('chart', keys('anthropic'))).toBe('openai');
  });

  it('ignores keys of providers that cannot serve the feature', () => {
    expect(resolveFeatureProvider('chart', keys('perplexity'))).toBe('gemini');
  });
});
