'use client';

/**
 * Adaptador de OpenAI para el analisis tecnico
 */

import {
  OPENAI_MODEL,
  collectOpenAIText,
  createOpenAIClient,
  toOpenAIError,
} from '@/services/clients/openai';
import { TECHNICAL_ANALYSIS_PROMPT } from './prompt';
import { TECHNICAL_ANALYSIS_JSON_SCHEMA, type ChartAdapter } from './types';

export const analyzeWithOpenAI: ChartAdapter = async (apiKey, image) => {
  const client = createOpenAIClient(apiKey);

  try {
    const response = await client.responses.create({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: TECHNICAL_ANALYSIS_PROMPT },
            { type: 'input_image', image_url: image.dataUri, detail: 'auto' },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'technical_analysis',
          strict: true,
          schema: TECHNICAL_ANALYSIS_JSON_SCHEMA,
        },
      },
    });
    return collectOpenAIText(response);
  } catch (error) {
    throw toOpenAIError(error);
  }
};
