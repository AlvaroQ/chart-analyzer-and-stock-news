# Seguridad

Documentación detallada de las medidas de seguridad implementadas en ProjectIA.

## Headers HTTP de Seguridad

Configurados en `next.config.ts` para todas las respuestas:

| Header                      | Configuración                                  | Protección                    |
| --------------------------- | ---------------------------------------------- | ----------------------------- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Fuerza HTTPS durante 2 años   |
| `X-Frame-Options`           | `SAMEORIGIN`                                   | Previene clickjacking         |
| `X-Content-Type-Options`    | `nosniff`                                      | Evita MIME sniffing           |
| `X-XSS-Protection`          | `1; mode=block`                                | Protección XSS del navegador  |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`     | Desactiva APIs innecesarias   |
| `Content-Security-Policy`   | Política restrictiva con allowlist             | Previene inyección de scripts |

## Validación de Entrada

```typescript
// Validación de ticker con Zod
const tickerSchema = z.string()
  .min(1)
  .max(10)
  .regex(/^[A-Z0-9.\-^]+$/i, "Ticker inválido")

// Validación de imagen
const imageSchema = z.object({
  type: z.enum(["image/jpeg", "image/png"]),
  size: z.number().max(4 * 1024 * 1024) // 4MB máximo
})
```

## Validación de Variables de Entorno

```typescript
// src/lib/env.ts - Validación al inicio de la aplicación
const envSchema = z.object({
  GOOGLE_GEMINI_API_KEY: z.string().min(1),
  PERPLEXITY_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"])
})

// Falla rápidamente si faltan variables críticas
export const env = envSchema.parse(process.env)
```

## Rate Limiting

```typescript
// Configuración por defecto
{
  limit: 10,              // Máximo de requests
  windowMs: 60 * 1000,    // Ventana de 1 minuto
  cleanupInterval: 5 * 60 * 1000  // Limpieza cada 5 minutos
}

// Headers de respuesta
"X-RateLimit-Limit": "10"
"X-RateLimit-Remaining": "7"
"X-RateLimit-Reset": "1702656000"
```

## Logging Seguro

```typescript
// Sanitización automática de datos sensibles
const SENSITIVE_KEYS = [
  "password", "token", "api_key", "apiKey",
  "secret", "authorization", "cookie"
]

// Truncamiento de valores largos (>500 chars)
// Logs estructurados en JSON para integración con SIEM
```

## Protección de API Keys

- Variables de entorno exclusivamente server-side
- Nunca expuestas al cliente
- Validación de presencia al inicio de la aplicación
- Prefijo `NEXT_PUBLIC_` solo para variables públicas (ninguna API key)
