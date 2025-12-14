/**
 * Logger estructurado para la aplicacion
 * Prepara logs en formato JSON para integracion con servicios de monitoreo
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
}

/**
 * Crea una entrada de log estructurada
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && Object.keys(context).length > 0 && { context }),
  };
}

/**
 * Sanitiza el contexto para evitar exponer datos sensibles
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;

  const sensitiveKeys = [
    "password",
    "token",
    "api_key",
    "apiKey",
    "secret",
    "authorization",
    "cookie",
  ];

  const sanitized: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "string" && value.length > 500) {
      // Truncar valores muy largos
      sanitized[key] = value.substring(0, 500) + "...[truncated]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Determina si debemos loggear basado en el nivel y entorno
 */
function shouldLog(level: LogLevel): boolean {
  const isDev = process.env.NODE_ENV === "development";

  if (level === "debug") {
    return isDev;
  }

  return true;
}

/**
 * Logger principal de la aplicacion
 *
 * @example
 * ```ts
 * logger.info("Usuario registrado", { userId: "123" });
 * logger.error("Error en API", { endpoint: "/api/search", status: 500 });
 * ```
 */
export const logger = {
  /**
   * Log de debug - solo visible en desarrollo
   */
  debug(message: string, context?: LogContext): void {
    if (!shouldLog("debug")) return;

    const entry = createLogEntry("debug", message, sanitizeContext(context));
    console.debug(JSON.stringify(entry));
  },

  /**
   * Log informativo
   */
  info(message: string, context?: LogContext): void {
    if (!shouldLog("info")) return;

    const entry = createLogEntry("info", message, sanitizeContext(context));
    console.info(JSON.stringify(entry));
  },

  /**
   * Log de advertencia
   */
  warn(message: string, context?: LogContext): void {
    if (!shouldLog("warn")) return;

    const entry = createLogEntry("warn", message, sanitizeContext(context));
    console.warn(JSON.stringify(entry));
  },

  /**
   * Log de error
   */
  error(message: string, context?: LogContext): void {
    if (!shouldLog("error")) return;

    const entry = createLogEntry("error", message, sanitizeContext(context));
    console.error(JSON.stringify(entry));

    // Aqui se puede integrar con Sentry u otro servicio de monitoreo
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureMessage(message, { extra: context, level: 'error' });
    // }
  },

  /**
   * Log de error con excepcion
   */
  exception(message: string, error: unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            }
          : String(error),
    };

    this.error(message, errorContext);
  },
};
