/**
 * Constantes y configuracion centralizada de la aplicacion
 */

// ==========================================
// Configuracion de APIs externas
// ==========================================

export const API_CONFIG = {
  PERPLEXITY: {
    URL: "https://api.perplexity.ai/chat/completions",
    MODEL: "sonar-pro",
    TEMPERATURE: 0.3,
    MAX_TOKENS: 2500,
    TOP_P: 0.9,
    SEARCH_RECENCY: "month",
    SEARCH_CONTEXT_SIZE: "high",
    TIMEOUT_MS: 30000,
  },
  GEMINI: {
    MODEL: "googleai/gemini-2.0-flash",
  },
} as const;

// ==========================================
// Validacion de inputs
// ==========================================

export const VALIDATION = {
  TICKER: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10,
    /** Patron para tickers validos: letras, numeros, puntos, guiones */
    PATTERN: /^[A-Z0-9.\-^]+$/i,
    /** Mensaje de error para ticker invalido */
    ERROR_MESSAGE: "Ticker invalido. Solo se permiten letras, numeros, puntos y guiones (1-10 caracteres)",
  },
  IMAGE: {
    MAX_SIZE_BYTES: 4 * 1024 * 1024, // 4MB
    ALLOWED_TYPES: ["image/jpeg", "image/png"] as const,
  },
} as const;

// ==========================================
// Rate Limiting
// ==========================================

export const RATE_LIMIT = {
  /** Solicitudes permitidas por ventana */
  DEFAULT_LIMIT: 10,
  /** Ventana de tiempo en milisegundos (1 minuto) */
  DEFAULT_WINDOW_MS: 60 * 1000,
  /** Mensaje de error cuando se excede el limite */
  ERROR_MESSAGE: "Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.",
} as const;

// ==========================================
// Cache
// ==========================================

export const CACHE = {
  /** TTL para respuestas de busqueda (5 minutos) */
  SEARCH_TTL_SECONDS: 300,
  /** Cache-Control header para respuestas de busqueda */
  SEARCH_CACHE_CONTROL: "private, max-age=300",
} as const;

// ==========================================
// Mensajes de UI
// ==========================================

export const UI_MESSAGES = {
  LOADING: {
    SEARCH: "Buscando noticias...",
    SEARCH_SUBTITLE: "Analizando fuentes financieras con IA",
    ANALYSIS: "Analizando con IA...",
    ANALYSIS_SUBTITLE: "Identificando patrones, tendencias e indicadores",
  },
  EMPTY: {
    SEARCH_TITLE: "Busca noticias financieras",
    SEARCH_SUBTITLE: "Introduce un ticker (ej: AAPL, TSLA, NVDA) para obtener las noticias mas relevantes del ultimo mes",
    NO_RESULTS_TITLE: "No se encontraron noticias",
    NO_RESULTS_SUBTITLE: "No hay noticias relevantes para este ticker. Intenta con otro simbolo.",
    WAITING_TITLE: "Esperando imagen",
    WAITING_SUBTITLE: "Sube o pega un grafico de velas para que la IA lo analice",
  },
  SUCCESS: {
    SEARCH: (count: number, ticker: string) =>
      `Se encontraron ${count} noticia${count !== 1 ? "s" : ""} para ${ticker}`,
    ANALYSIS: "Analisis completado exitosamente",
    IMAGE_PASTED: "Imagen pegada correctamente desde el portapapeles",
  },
  ERROR: {
    SEARCH_GENERIC: "Error al realizar la busqueda",
    ANALYSIS_GENERIC: "No se pudo completar el analisis. Por favor, intentalo de nuevo.",
    TICKER_REQUIRED: "Por favor, introduce un ticker para buscar",
    IMAGE_REQUIRED: "Por favor, sube una imagen primero",
    FILE_TOO_LARGE: "El archivo es demasiado grande. El limite es 4MB.",
  },
} as const;

// ==========================================
// Tags de noticias disponibles
// ==========================================

export const NEWS_TAGS = [
  "earnings",
  "acquisition",
  "regulatory",
  "partnership",
  "product",
  "analyst",
  "lawsuit",
  "ceo",
  "dividend",
  "guidance",
  "ipo",
  "buyback",
  "layoffs",
  "expansion",
] as const;

export type NewsTag = (typeof NEWS_TAGS)[number];
