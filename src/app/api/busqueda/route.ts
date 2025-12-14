import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { API_CONFIG, VALIDATION, RATE_LIMIT, CACHE } from "@/lib/constants";
import type {
  NewsItem,
  PerplexityMessage,
  PerplexityResponse,
} from "@/types";

// ==========================================
// Schemas de Validacion
// ==========================================

const tickerSchema = z.object({
  ticker: z
    .string()
    .min(VALIDATION.TICKER.MIN_LENGTH)
    .max(VALIDATION.TICKER.MAX_LENGTH)
    .regex(VALIDATION.TICKER.PATTERN, VALIDATION.TICKER.ERROR_MESSAGE)
    .transform((val) => val.trim().toUpperCase()),
});

// ==========================================
// Prompts
// ==========================================

const SYSTEM_PROMPT = `Eres un especialista en análisis de noticias financieras con acceso a información de mercado en tiempo real. Tu rol es extraer y validar noticias relevantes sobre acciones específicas, priorizando:
1. Fuentes verificadas y reconocidas (Reuters, Bloomberg, Financial Times, AP, etc.)
2. Información factual y contrastada, no especulaciones
3. Impacto en el mercado (relevancia para inversores)
4. Estructura de datos consistente y parseable

Siempre valida que:
- Las URLs sean accesibles y contengan el artículo completo
- Las fechas sean recientes (últimas 72 horas preferentemente)
- Los resúmenes capturen información material, no trivial`;

function buildUserPrompt(ticker: string): string {
  return `Busca y extrae las últimas 5 noticias financieras MÁS RELEVANTES sobre la acción ${ticker}.

CRITERIOS DE BÚSQUEDA:
- Período: último mes
- Relevancia: solo noticias con impacto en precio o decisiones de inversión
- Fuentes: medios financieros reconocidos (Reuters, Bloomberg, CNBC, Financial Times, WSJ, etc.)
- Excluir noticias duplicadas o repetidas

IDIOMA: TODO el contenido debe estar en ESPAÑOL. Traduce los títulos y resúmenes al español.

RESPONDE ÚNICAMENTE CON UN ARRAY JSON VÁLIDO con este formato exacto:
[
  {
    "title": "Título de la noticia EN ESPAÑOL",
    "summary": "Resumen EN ESPAÑOL de máximo 120 palabras explicando QUÉ pasó, POR QUÉ es relevante e IMPACTO esperado",
    "date": "2024-12-14",
    "source": "Nombre del medio",
    "url": "https://ejemplo.com/noticia",
    "impact_level": "HIGH",
    "tags": ["earnings", "acquisition"]
  }
]

REGLAS:
- IMPORTANTE: Títulos y resúmenes SIEMPRE en español
- impact_level debe ser: "HIGH", "MEDIUM" o "LOW"
- tags pueden incluir: earnings, acquisition, regulatory, partnership, product, analyst, lawsuit, ceo, dividend, guidance
- Si no encuentras noticias relevantes, devuelve un array vacío: []
- NO incluyas texto adicional antes o después del JSON
- Solo devuelve el array JSON, nada más`;
}

// ==========================================
// Helpers
// ==========================================

/**
 * Obtiene el identificador del cliente para rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

/**
 * Parsea y valida la respuesta de la API
 */
function parseNewsResponse(content: string): NewsItem[] {
  // Limpiar bloques de codigo markdown
  let cleanContent = content.trim();
  cleanContent = cleanContent.replace(/^```json?\s*/i, "");
  cleanContent = cleanContent.replace(/```\s*$/i, "");
  cleanContent = cleanContent.trim();

  // Intentar extraer array JSON
  const jsonArrayMatch = cleanContent.match(/\[[\s\S]*\]/);
  let rawNews: unknown[];

  if (jsonArrayMatch) {
    rawNews = JSON.parse(jsonArrayMatch[0]);
  } else {
    // Intentar como objeto unico
    const singleMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (singleMatch) {
      const parsed = JSON.parse(singleMatch[0]);
      rawNews = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      logger.warn("No se encontro JSON en la respuesta de Perplexity");
      return [];
    }
  }

  // Validar y sanitizar items
  return rawNews
    .filter((item): item is Record<string, unknown> => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).title === "string" &&
        typeof (item as Record<string, unknown>).summary === "string"
      );
    })
    .map((item) => ({
      title: String(item.title || "Sin titulo"),
      summary: String(item.summary || "Sin resumen"),
      date: String(item.date || new Date().toISOString().split("T")[0]),
      source: String(item.source || "Fuente desconocida"),
      url: String(item.url || "#"),
      impact_level: (
        ["HIGH", "MEDIUM", "LOW"].includes(String(item.impact_level))
          ? item.impact_level
          : "MEDIUM"
      ) as "HIGH" | "MEDIUM" | "LOW",
      tags: Array.isArray(item.tags)
        ? item.tags.filter((t): t is string => typeof t === "string")
        : [],
    }));
}

// ==========================================
// Handler Principal
// ==========================================

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);

  // 1. Rate Limiting
  const rateLimitResult = rateLimit(clientId, {
    limit: RATE_LIMIT.DEFAULT_LIMIT,
    windowMs: RATE_LIMIT.DEFAULT_WINDOW_MS,
  });

  if (!rateLimitResult.success) {
    logger.warn("Rate limit excedido", { clientId });
    return NextResponse.json(
      { error: RATE_LIMIT.ERROR_MESSAGE },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    // 2. Parsear y validar input
    const body = await request.json();
    const parseResult = tickerSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage =
        parseResult.error.errors[0]?.message || "Input invalido";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const { ticker } = parseResult.data;

    logger.info("Busqueda iniciada", { ticker, clientId });

    // 3. Construir mensajes para Perplexity
    const messages: PerplexityMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(ticker) },
    ];

    // 4. Llamar a la API de Perplexity
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_CONFIG.PERPLEXITY.TIMEOUT_MS
    );

    let response: Response;
    try {
      response = await fetch(API_CONFIG.PERPLEXITY.URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: API_CONFIG.PERPLEXITY.MODEL,
          messages,
          temperature: API_CONFIG.PERPLEXITY.TEMPERATURE,
          max_tokens: API_CONFIG.PERPLEXITY.MAX_TOKENS,
          top_p: API_CONFIG.PERPLEXITY.TOP_P,
          search_recency_filter: API_CONFIG.PERPLEXITY.SEARCH_RECENCY,
          web_search_options: {
            search_context_size: API_CONFIG.PERPLEXITY.SEARCH_CONTEXT_SIZE,
          },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // 5. Manejar errores de la API
    if (!response.ok) {
      logger.error("Error de Perplexity API", {
        status: response.status,
        statusText: response.statusText,
        ticker,
      });

      return NextResponse.json(
        { error: `Error de la API de Perplexity: ${response.status}` },
        { status: response.status, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // 6. Parsear respuesta
    const data: PerplexityResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      logger.error("Respuesta vacia de Perplexity", { ticker });
      return NextResponse.json(
        { error: "No se recibio respuesta de la API" },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // 7. Parsear noticias
    let news: NewsItem[];
    try {
      news = parseNewsResponse(content);
    } catch (parseError) {
      logger.exception("Error parseando respuesta de Perplexity", parseError, {
        ticker,
      });

      return NextResponse.json(
        { error: "Error al procesar la respuesta de la API" },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    logger.info("Busqueda completada", {
      ticker,
      newsCount: news.length,
      tokens: data.usage?.total_tokens,
    });

    // 8. Responder con cache headers
    return NextResponse.json(
      {
        ticker,
        news,
        usage: data.usage,
      },
      {
        headers: {
          ...getRateLimitHeaders(rateLimitResult),
          "Cache-Control": CACHE.SEARCH_CACHE_CONTROL,
        },
      }
    );
  } catch (error) {
    // Manejar errores de timeout
    if (error instanceof Error && error.name === "AbortError") {
      logger.error("Timeout en llamada a Perplexity", { clientId });
      return NextResponse.json(
        { error: "La solicitud tardo demasiado. Intente nuevamente." },
        { status: 504, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    logger.exception("Error interno en API de busqueda", error, { clientId });

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}
