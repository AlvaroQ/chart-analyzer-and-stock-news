'use client';

/**
 * Adaptador de Claude para el analisis tecnico
 */

import type Anthropic from '@anthropic-ai/sdk';
import {
  CLAUDE_FALLBACK,
  CLAUDE_MODEL,
  collectClaudeText,
  createClaudeClient,
  toClaudeError,
} from '@/services/clients/anthropic';
import { TECHNICAL_ANALYSIS_PROMPT } from './prompt';
import { TECHNICAL_ANALYSIS_JSON_SCHEMA, type ChartAdapter } from './types';

type ImageMediaType = Anthropic.Beta.BetaBase64ImageSource['media_type'];

export const analyzeWithClaude: ChartAdapter = async (apiKey, image) => {
  const client = createClaudeClient(apiKey);

  try {
    const message = await client.beta.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      ...CLAUDE_FALLBACK,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: TECHNICAL_ANALYSIS_JSON_SCHEMA },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: image.mimeType as ImageMediaType,
                data: image.data,
              },
            },
            { type: 'text', text: TECHNICAL_ANALYSIS_PROMPT },
          ],
        },
      ],
    });
    return collectClaudeText(message);
  } catch (error) {
    throw toClaudeError(error);
  }
};
