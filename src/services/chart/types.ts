/**
 * Contrato del analisis tecnico, independiente del proveedor
 */

export interface TechnicalAnalysisOutput {
  analysis: {
    generalTrend: string;
    patterns: string;
    signals: string;
    conclusion: string;
  };
  summary: {
    trends: {
      shortTerm: string;
      mediumTerm: string;
      longTerm: string;
    };
    supports: Array<{
      level: string;
      reason: string;
    }>;
    resistances: Array<{
      level: string;
      reason: string;
    }>;
  };
  indicators: {
    rsi: {
      value: number;
      status: string;
      isVisible: boolean;
    };
    macd: {
      status: string;
      comment: string;
      isVisible: boolean;
    };
  };
}

/** Imagen ya validada y separada en sus partes */
export interface ChartImage {
  dataUri: string;
  mimeType: string;
  data: string;
}

export interface ChartAnalysisOptions {
  apiKey: string;
  imageDataUri: string;
}

/** Un adaptador envia la imagen al proveedor y devuelve el texto JSON crudo */
export type ChartAdapter = (apiKey: string, image: ChartImage) => Promise<string>;

/**
 * JSON Schema del resultado, para proveedores con salida estructurada
 */
export const TECHNICAL_ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['analysis', 'summary', 'indicators'],
  properties: {
    analysis: {
      type: 'object',
      additionalProperties: false,
      required: ['generalTrend', 'patterns', 'signals', 'conclusion'],
      properties: {
        generalTrend: { type: 'string' },
        patterns: { type: 'string' },
        signals: { type: 'string' },
        conclusion: { type: 'string' },
      },
    },
    summary: {
      type: 'object',
      additionalProperties: false,
      required: ['trends', 'supports', 'resistances'],
      properties: {
        trends: {
          type: 'object',
          additionalProperties: false,
          required: ['shortTerm', 'mediumTerm', 'longTerm'],
          properties: {
            shortTerm: { type: 'string' },
            mediumTerm: { type: 'string' },
            longTerm: { type: 'string' },
          },
        },
        supports: { $ref: '#/$defs/levels' },
        resistances: { $ref: '#/$defs/levels' },
      },
    },
    indicators: {
      type: 'object',
      additionalProperties: false,
      required: ['rsi', 'macd'],
      properties: {
        rsi: {
          type: 'object',
          additionalProperties: false,
          required: ['value', 'status', 'isVisible'],
          properties: {
            value: { type: 'number' },
            status: { type: 'string' },
            isVisible: { type: 'boolean' },
          },
        },
        macd: {
          type: 'object',
          additionalProperties: false,
          required: ['status', 'comment', 'isVisible'],
          properties: {
            status: { type: 'string' },
            comment: { type: 'string' },
            isVisible: { type: 'boolean' },
          },
        },
      },
    },
  },
  $defs: {
    levels: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['level', 'reason'],
        properties: {
          level: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
  },
} as const;
