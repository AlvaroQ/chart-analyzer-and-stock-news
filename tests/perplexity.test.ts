import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchWithPerplexity } from '@/services/news/perplexity';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Perplexity news search', () => {
  it('sends the integration header to the Perplexity API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '[]' } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchWithPerplexity('pplx-test', 'AAPL')).resolves.toBe('[]');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.perplexity.ai/chat/completions');
    expect(init.headers['X-Pplx-Integration']).toBe('chart-analyzer-and-stock-news');
  });
});
