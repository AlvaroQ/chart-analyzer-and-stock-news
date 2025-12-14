import { NextRequest, NextResponse } from "next/server";

interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  impact_level: "HIGH" | "MEDIUM" | "LOW";
  tags: string[];
}

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

export async function POST(request: NextRequest) {
  try {
    const { ticker } = await request.json();

    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json(
        { error: "El ticker es requerido" },
        { status: 400 }
      );
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key de Perplexity no configurada" },
        { status: 500 }
      );
    }

    const sanitizedTicker = ticker.trim().toUpperCase();

    const messages: PerplexityMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(sanitizedTicker) },
    ];

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages,
        temperature: 0.3,
        max_tokens: 2500,
        top_p: 0.9,
        search_recency_filter: "month",
        web_search_options: {
          search_context_size: "high",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", errorText);
      return NextResponse.json(
        { error: `Error de la API de Perplexity: ${response.status}` },
        { status: response.status }
      );
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No se recibió respuesta de la API" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let news: NewsItem[];
    try {
      // Clean up the content - remove markdown code blocks if present
      let cleanContent = content.trim();

      // Remove markdown code block markers
      cleanContent = cleanContent.replace(/^```json?\s*/i, "");
      cleanContent = cleanContent.replace(/```\s*$/i, "");
      cleanContent = cleanContent.trim();

      // Try to extract JSON array from the response
      const jsonArrayMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (jsonArrayMatch) {
        news = JSON.parse(jsonArrayMatch[0]);
      } else {
        // Try parsing as single object wrapped in array
        const singleMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (singleMatch) {
          const parsed = JSON.parse(singleMatch[0]);
          // Check if it's already an array-like structure
          news = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          // If no JSON found, return empty array
          console.warn("No JSON found in response, returning empty array");
          console.warn("Raw content:", content);
          news = [];
        }
      }

      // Validate and sanitize the news items
      news = news.filter((item): item is NewsItem => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof item.title === "string" &&
          typeof item.summary === "string"
        );
      }).map((item) => ({
        title: item.title || "Sin título",
        summary: item.summary || "Sin resumen",
        date: item.date || new Date().toISOString().split("T")[0],
        source: item.source || "Fuente desconocida",
        url: item.url || "#",
        impact_level: (["HIGH", "MEDIUM", "LOW"].includes(item.impact_level)
          ? item.impact_level
          : "MEDIUM") as "HIGH" | "MEDIUM" | "LOW",
        tags: Array.isArray(item.tags) ? item.tags : [],
      }));

    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", content);
      return NextResponse.json(
        {
          error: "Error al parsear la respuesta de la API",
          rawContent: content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ticker: sanitizedTicker,
      news,
      usage: data.usage,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
