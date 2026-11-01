import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ANALYSIS, IMAGE_DATA_URI, NEWS_JSON } from './fixtures';

const geminiAnalyze = vi.fn();
const perplexitySearch = vi.fn();

vi.mock('@/services/chart/gemini', () => ({ analyzeWithGemini: geminiAnalyze }));
vi.mock('@/services/news/perplexity', () => ({ searchWithPerplexity: perplexitySearch }));

const { analyzeChart, searchNews } = await import('@/services');

beforeEach(() => {
  geminiAnalyze.mockReset();
  perplexitySearch.mockReset();
});

describe('analyzeChart', () => {
  it('routes to the Gemini adapter and parses fenced JSON', async () => {
    geminiAnalyze.mockResolvedValue('```json\n' + JSON.stringify(ANALYSIS) + '\n```');
    const result = await analyzeChart('gemini', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI });
    expect(result).toEqual(ANALYSIS);
    expect(geminiAnalyze).toHaveBeenCalledWith('k', {
      dataUri: IMAGE_DATA_URI,
      mimeType: 'image/png',
      data: 'iVBORw0KGgo=',
    });
  });

  it('rejects images that are not data URIs', async () => {
    await expect(
      analyzeChart('gemini', { apiKey: 'k', imageDataUri: 'https://x/y.png' }),
    ).rejects.toThrow('Imagen invalida. Debe ser un Data URI de imagen.');
    expect(geminiAnalyze).not.toHaveBeenCalled();
  });

  it('rejects responses without the expected structure', async () => {
    geminiAnalyze.mockResolvedValue('{"analysis":{}}');
    await expect(
      analyzeChart('gemini', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('Respuesta con estructura invalida');
  });

  it('rejects providers that do not support the feature', async () => {
    await expect(
      analyzeChart('perplexity', { apiKey: 'k', imageDataUri: IMAGE_DATA_URI }),
    ).rejects.toThrow('Perplexity no soporta esta funcionalidad');
  });
});

describe('searchNews', () => {
  it('normalizes the ticker, routes to Perplexity and sanitizes items', async () => {
    perplexitySearch.mockResolvedValue('Aqui tienes:\n' + NEWS_JSON);
    const result = await searchNews('perplexity', { apiKey: 'k', ticker: ' aapl ' });
    expect(perplexitySearch).toHaveBeenCalledWith('k', 'AAPL');
    expect(result.ticker).toBe('AAPL');
    expect(result.news).toHaveLength(2);
    expect(result.news[0]).toEqual({
      title: 'Apple supera previsiones',
      summary: 'Resultados trimestrales por encima del consenso.',
      date: '2026-10-30',
      source: 'Reuters',
      url: 'https://reuters.com/a',
      impact_level: 'HIGH',
      tags: ['earnings'],
    });
    expect(result.news[1].impact_level).toBe('MEDIUM');
    expect(result.news[1].source).toBe('Fuente desconocida');
  });

  it('keeps the ticker validation messages', async () => {
    await expect(searchNews('perplexity', { apiKey: 'k', ticker: 'A$PL' })).rejects.toThrow(
      'Ticker invalido. Solo se permiten letras, numeros, puntos y guiones (1-10 caracteres)',
    );
    await expect(
      searchNews('perplexity', { apiKey: 'k', ticker: 'ABCDEFGHIJK' }),
    ).rejects.toThrow('El ticker es muy largo');
    expect(perplexitySearch).not.toHaveBeenCalled();
  });

  it('returns an empty list when the response has no JSON', async () => {
    perplexitySearch.mockResolvedValue('No hay noticias.');
    const result = await searchNews('perplexity', { apiKey: 'k', ticker: 'MSFT' });
    expect(result.news).toEqual([]);
  });

  it('rejects providers that do not support the feature', async () => {
    await expect(searchNews('gemini', { apiKey: 'k', ticker: 'MSFT' })).rejects.toThrow(
      'Google Gemini no soporta esta funcionalidad',
    );
  });
});
