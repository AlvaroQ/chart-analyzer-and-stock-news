import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ANALYSIS, IMAGE_DATA_URI, NEWS_JSON } from './fixtures';

const create = vi.fn();
const clientOptions: unknown[] = [];

vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {
    status: number | undefined;
    constructor(status: number | undefined, message = 'api error') {
      super(message);
      this.status = status;
    }
  }
  class AuthenticationError extends APIError {}
  class RateLimitError extends APIError {}
  class Anthropic {
    static APIError = APIError;
    static AuthenticationError = AuthenticationError;
    static RateLimitError = RateLimitError;
    beta = { messages: { create } };
    constructor(options: unknown) {
      clientOptions.push(options);
    }
  }
  return { default: Anthropic };
});

const Anthropic = (await import('@anthropic-ai/sdk')).default as unknown as {
  AuthenticationError: new (status: number) => Error;
  RateLimitError: new (status: number) => Error;
  APIError: new (status: number) => Error;
};
const { analyzeChart, searchNews } = await import('@/services');

function message(text: string, stop_reason = 'end_turn') {
  return { stop_reason, content: [{ type: 'text', text }] };
}

beforeEach(() => {
  create.mockReset();
  clientOptions.length = 0;
});

describe('Claude chart analysis', () => {
  it('sends the image with a JSON schema and parses the result', async () => {
    create.mockResolvedValue(message(JSON.stringify(ANALYSIS)));
    const result = await analyzeChart('anthropic', { apiKey: 'sk-ant-x', imageDataUri: IMAGE_DATA_URI });

    expect(result).toEqual(ANALYSIS);
    expect(clientOptions[0]).toEqual({ apiKey: 'sk-ant-x', dangerouslyAllowBrowser: true });
    const params = create.mock.calls[0][0];
    expect(params.model).toBe('claude-opus-5-5');
    expect(params.betas).toEqual(['server-side-fallback-2026-07-01']);
    expect(params.fallbacks).toBe('default');
    expect(params.thinking).toEqual({ type: 'adaptive' });
    expect(params.output_config.format.type).toBe('json_schema');
    expect(params.output_config.format.schema.required).toEqual(['analysis', 'summary', 'indicators']);
    expect(params.messages[0].content[0]).toEqual({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: 'iVBORw0KGgo=' },
    });
    expect(params.messages[0].content[1].type).toBe('text');
  });

  it('reports refusals instead of parsing empty output', async () => {
    create.mockResolvedValue({ stop_reason: 'refusal', content: [] });
    await expect(
      analyzeChart('anthropic', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('El modelo rechazo la solicitud.');
  });

  it('maps authentication and rate limit errors', async () => {
    create.mockRejectedValueOnce(new Anthropic.AuthenticationError(401));
    await expect(
      analyzeChart('anthropic', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('API Key invalida. Verifica tu configuracion.');

    create.mockRejectedValueOnce(new Anthropic.RateLimitError(429));
    await expect(
      analyzeChart('anthropic', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('Demasiadas solicitudes. Espera un momento.');

    create.mockRejectedValueOnce(new Anthropic.APIError(500));
    await expect(
      analyzeChart('anthropic', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('Error de la API de Anthropic Claude: 500');
  });
});

describe('Claude news search', () => {
  it('uses web search and continues paused turns', async () => {
    const half = Math.floor(NEWS_JSON.length / 2);
    create
      .mockResolvedValueOnce({ stop_reason: 'pause_turn', content: [{ type: 'server_tool_use', id: 's1' }] })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [
          { type: 'web_search_tool_result', content: [] },
          { type: 'text', text: NEWS_JSON.slice(0, half) },
          { type: 'text', text: NEWS_JSON.slice(half) },
        ],
      });

    const result = await searchNews('anthropic', { apiKey: 'k', ticker: 'aapl' });

    expect(result.ticker).toBe('AAPL');
    expect(result.news).toHaveLength(2);
    expect(create).toHaveBeenCalledTimes(2);
    const first = create.mock.calls[0][0];
    expect(first.tools).toEqual([{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }]);
    expect(first.system).toContain('noticias financieras');
    expect(first.messages[0].content).toContain('AAPL');
    const second = create.mock.calls[1][0];
    expect(second.messages).toHaveLength(2);
    expect(second.messages[1]).toEqual({
      role: 'assistant',
      content: [{ type: 'server_tool_use', id: 's1' }],
    });
  });

  it('stops after too many paused turns', async () => {
    create.mockResolvedValue({ stop_reason: 'pause_turn', content: [] });
    await expect(searchNews('anthropic', { apiKey: 'k', ticker: 'MSFT' })).rejects.toThrow(
      'La busqueda tardo demasiado. Intente nuevamente.',
    );
    expect(create).toHaveBeenCalledTimes(4);
  });
});
