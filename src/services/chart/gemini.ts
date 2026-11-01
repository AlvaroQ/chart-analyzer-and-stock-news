'use client';

/**
 * Adaptador de Google Gemini para el analisis tecnico
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG } from '@/lib/constants';
import { TECHNICAL_ANALYSIS_PROMPT } from './prompt';
import type { ChartAdapter } from './types';

export const analyzeWithGemini: ChartAdapter = async (apiKey, image) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI.MODEL });

  try {
    const result = await model.generateContent([
      TECHNICAL_ANALYSIS_PROMPT,
      { inlineData: { mimeType: image.mimeType, data: image.data } },
    ]);

    const text = result.response.text();
    if (!text) {
      throw new Error('No se recibio respuesta del modelo');
    }
    return text;
  } catch (error) {
    if (error instanceof Error) {
      // Manejar errores especificos de la API
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
        throw new Error('API Key invalida. Verifica tu configuracion.');
      }
      if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('429')) {
        throw new Error('Limite de solicitudes excedido. Espera un momento.');
      }
      if (error.message.includes('SAFETY')) {
        throw new Error('La imagen fue bloqueada por filtros de seguridad.');
      }
    }
    throw error;
  }
};
