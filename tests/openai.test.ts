import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ANALYSIS, IMAGE_DATA_URI, NEWS_JSON } from './fixtures';

const create = vi.fn();
const clientOptions: unknown[] = [];

vi.mock('openai', () => {
  class APIError extends Error {
    status: number | undefined;
    constructor(status: number | undefined, message = 'api error') {
      super(message);
      this.status = status;
    }
  }
  class AuthenticationError extends APIError {}
  class RateLimitError extends APIError {}
  class OpenAI {
    static APIError = APIError;
    static AuthenticationError = AuthenticationError;
    static RateLimitError = RateLimitError;
    responses = { create };
    constructor(options: unknown) {
      clientOptions.push(options);
    }
  }
  return { default: OpenAI };
});

const OpenAI = (await import('openai')).default as unknown as {
  AuthenticationError: new (status: number) => Error;
  RateLimitError: new (status: number) => Error;
  APIError: new (status: number) => Error;
};
const { analyzeChart, searchNews } = await import('@/services');

function response(output_text: string) {
  return {
    output_text,
    output: [{ type: 'message', content: [{ type: 'output_text', text: output_text }] }],
  };
}

beforeEach(() => {
  create.mockReset();
  clientOptions.length = 0;
});

describe('OpenAI chart analysis', () => {
  it('sends the image with a strict JSON schema and parses the result', async () => {
    create.mockResolvedValue(response(JSON.stringify(ANALYSIS)));
    const result = await analyzeChart('openai', { apiKey: 'sk-proj-x', imageDataUri: IMAGE_DATA_URI });

    expect(result).toEqual(ANALYSIS);
    expect(clientOptions[0]).toEqual({ apiKey: 'sk-proj-x', dangerouslyAllowBrowser: true });
    const params = create.mock.calls[0][0];
    expect(params.model).toBe('gpt-6-astra');
    expect(params.text.format).toMatchObject({
      type: 'json_schema',
      name: 'technical_analysis',
      strict: true,
    });
    expect(params.text.format.schema.required).toEqual(['analysis', 'summary', 'indicators']);
    expect(params.input[0].content).toEqual([
      { type: 'input_text', text: expect.stringContaining('Analista Técnico') },
      { type: 'input_image', image_url: IMAGE_DATA_URI, detail: 'auto' },
    ]);
  });

  it('reports refusals', async () => {
    create.mockResolvedValue({
      output_text: '',
      output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'no' }] }],
    });
    await expect(
      analyzeChart('openai', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('El modelo rechazo la solicitud.');
  });

  it('maps authentication and rate limit errors', async () => {
    create.mockRejectedValueOnce(new OpenAI.AuthenticationError(401));
    await expect(
      analyzeChart('openai', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('API Key invalida. Verifica tu configuracion.');

    create.mockRejectedValueOnce(new OpenAI.RateLimitError(429));
    await expect(
      analyzeChart('openai', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('Demasiadas solicitudes. Espera un momento.');

    create.mockRejectedValueOnce(new OpenAI.APIError(500));
    await expect(
      analyzeChart('openai', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('Error de la API de OpenAI: 500');
  });
});

describe('OpenAI news search', () => {
  it('uses the web search tool and parses the news array', async () => {
    create.mockResolvedValue(response(NEWS_JSON));
    const result = await searchNews('openai', { apiKey: 'k', ticker: 'nvda' });

    expect(result.ticker).toBe('NVDA');
    expect(result.news).toHaveLength(2);
    const params = create.mock.calls[0][0];
    expect(params.model).toBe('gpt-6-astra');
    expect(params.tools).toEqual([{ type: 'web_search' }]);
    expect(params.instructions).toContain('noticias financieras');
    expect(params.input).toContain('NVDA');
  });

  it('fails when the model returns no text', async () => {
    create.mockResolvedValue(response(''));
    await expect(searchNews('openai', { apiKey: 'k', ticker: 'NVDA' })).rejects.toThrow(
      'No se recibio respuesta del modelo',
    );
  });
});
