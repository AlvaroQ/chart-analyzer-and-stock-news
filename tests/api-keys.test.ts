import { beforeEach, describe, expect, it } from 'vitest';
import { installLocalStorage } from './setup-local-storage';
import {
  PROVIDER_IDS,
  PROVIDERS,
} from '@/lib/providers';
import { getValidationError, validateApiKey } from '@/lib/api-keys-validation';
import { clearAllApiKeys, getApiKey, saveApiKey } from '@/lib/api-keys-storage';

const ANTHROPIC_KEY = 'sk-ant-api03-' + 'a'.repeat(40);
const OPENAI_KEY = 'sk-proj-' + 'b'.repeat(40);
const GEMINI_KEY = 'AIza' + 'c'.repeat(35);
const PERPLEXITY_KEY = 'pplx-' + 'd'.repeat(40);

describe('provider registry', () => {
  it('registers the four providers', () => {
    expect(PROVIDER_IDS).toEqual(['gemini', 'perplexity', 'anthropic', 'openai']);
    expect(PROVIDERS.anthropic.name).toBe('Anthropic Claude');
    expect(PROVIDERS.openai.name).toBe('OpenAI');
  });
});

describe('API key validation', () => {
  it('accepts Anthropic and OpenAI keys', () => {
    expect(validateApiKey('anthropic', ANTHROPIC_KEY)).toBe(true);
    expect(validateApiKey('openai', OPENAI_KEY)).toBe(true);
  });

  it('rejects keys from the wrong provider', () => {
    expect(validateApiKey('openai', ANTHROPIC_KEY)).toBe(false);
    expect(validateApiKey('anthropic', OPENAI_KEY)).toBe(false);
    expect(validateApiKey('anthropic', GEMINI_KEY)).toBe(false);
  });

  it('reports the expected prefix for new providers', () => {
    expect(getValidationError('anthropic', 'nope')).toBe(
      'Formato invalido. La API key de Anthropic Claude debe comenzar con "sk-ant-"',
    );
    expect(getValidationError('openai', 'nope')).toBe(
      'Formato invalido. La API key de OpenAI debe comenzar con "sk-"',
    );
  });

  it('keeps previous Gemini and Perplexity behavior', () => {
    expect(validateApiKey('gemini', GEMINI_KEY)).toBe(true);
    expect(validateApiKey('perplexity', PERPLEXITY_KEY)).toBe(true);
    expect(validateApiKey('gemini', PERPLEXITY_KEY)).toBe(false);
    expect(validateApiKey('perplexity', GEMINI_KEY)).toBe(false);
    expect(getValidationError('gemini', '  ')).toBe('La API key no puede estar vacia');
    expect(getValidationError('perplexity', 'x')).toBe(
      'Formato invalido. La API key de Perplexity debe comenzar con "pplx-"',
    );
  });
});

describe('API key storage', () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = installLocalStorage();
  });

  it('keeps the existing storage keys for Gemini and Perplexity', () => {
    saveApiKey('gemini', GEMINI_KEY);
    saveApiKey('perplexity', PERPLEXITY_KEY);
    expect(store.get('projectia_gemini_api_key')).toBe(GEMINI_KEY);
    expect(store.get('projectia_perplexity_api_key')).toBe(PERPLEXITY_KEY);
  });

  it('stores and reads Anthropic and OpenAI keys', () => {
    saveApiKey('anthropic', ` ${ANTHROPIC_KEY} `);
    saveApiKey('openai', OPENAI_KEY);
    expect(getApiKey('anthropic')).toBe(ANTHROPIC_KEY);
    expect(getApiKey('openai')).toBe(OPENAI_KEY);
  });

  it('clearAllApiKeys removes every provider key', () => {
    saveApiKey('gemini', GEMINI_KEY);
    saveApiKey('perplexity', PERPLEXITY_KEY);
    saveApiKey('anthropic', ANTHROPIC_KEY);
    saveApiKey('openai', OPENAI_KEY);
    store.set('unrelated', 'keep');
    clearAllApiKeys();
    for (const id of PROVIDER_IDS) expect(getApiKey(id)).toBeNull();
    expect(store.get('unrelated')).toBe('keep');
  });
});
