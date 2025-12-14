/**
 * Rate Limiter en memoria
 * Para produccion con multiples instancias, considerar Redis/Upstash
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Store en memoria para rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpiar registros expirados cada 5 minutos
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // No bloquear el proceso de Node
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

// Iniciar limpieza automatica
startCleanup();

export interface RateLimitResult {
  /** Si la solicitud esta permitida */
  success: boolean;
  /** Solicitudes restantes en la ventana actual */
  remaining: number;
  /** Limite total de solicitudes */
  limit: number;
  /** Tiempo en ms hasta que se resetee la ventana */
  resetIn: number;
}

export interface RateLimitOptions {
  /** Numero maximo de solicitudes permitidas */
  limit?: number;
  /** Ventana de tiempo en milisegundos */
  windowMs?: number;
}

/**
 * Verifica y actualiza el rate limit para un identificador
 *
 * @param identifier - Identificador unico (ej: IP, user ID)
 * @param options - Opciones de configuracion
 * @returns Resultado del rate limit
 *
 * @example
 * ```ts
 * const result = rateLimit("192.168.1.1", { limit: 10, windowMs: 60000 });
 * if (!result.success) {
 *   return new Response("Too Many Requests", { status: 429 });
 * }
 * ```
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { limit = 10, windowMs = 60000 } = options;
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Si no existe registro o ha expirado, crear uno nuevo
  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newRecord);

    return {
      success: true,
      remaining: limit - 1,
      limit,
      resetIn: windowMs,
    };
  }

  // Verificar si se ha excedido el limite
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      limit,
      resetIn: record.resetTime - now,
    };
  }

  // Incrementar contador
  record.count++;

  return {
    success: true,
    remaining: limit - record.count,
    limit,
    resetIn: record.resetTime - now,
  };
}

/**
 * Obtiene los headers de rate limit para incluir en la respuesta
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetIn / 1000).toString(),
  };
}
