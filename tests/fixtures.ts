import type { TechnicalAnalysisOutput } from '@/services';

export const IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgo=';

export const ANALYSIS: TechnicalAnalysisOutput = {
  analysis: { generalTrend: 'Alcista', patterns: 'Martillo', signals: 'Compra', conclusion: 'Sesgo alcista' },
  summary: {
    trends: { shortTerm: 'Alcista', mediumTerm: 'Lateral', longTerm: 'Alcista' },
    supports: [{ level: '100', reason: 'Minimo previo' }],
    resistances: [{ level: '120', reason: 'Maximo previo' }],
  },
  indicators: {
    rsi: { value: 0, status: 'No visible', isVisible: false },
    macd: { status: 'No visible', comment: '', isVisible: false },
  },
};

export const NEWS_JSON = JSON.stringify([
  {
    title: 'Apple supera previsiones',
    summary: 'Resultados trimestrales por encima del consenso.',
    date: '2026-10-30',
    source: 'Reuters',
    url: 'https://reuters.com/a',
    impact_level: 'HIGH',
    tags: ['earnings', 3],
  },
  { title: 'Sin impacto valido', summary: 'Resumen', impact_level: 'HUGE' },
  { title: 'Falta resumen' },
]);
