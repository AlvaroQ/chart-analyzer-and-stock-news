# ProjectIA - Plataforma de Análisis Financiero con IA

Una aplicación full-stack de análisis financiero potenciada por inteligencia artificial, construida con Next.js 16 y React 19. Integra múltiples agentes de IA especializados para búsqueda de noticias en tiempo real y análisis técnico de gráficos bursátiles.

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura y Stack Tecnológico](#arquitectura-y-stack-tecnológico)
- [Beneficios de la Arquitectura](#beneficios-de-la-arquitectura)
- [Agentes de IA Integrados](#agentes-de-ia-integrados)
- [Técnicas de Prompt Engineering](#técnicas-de-prompt-engineering)
- [Seguridad](#seguridad)
- [Instalación](#instalación)
- [Uso](#uso)
- [API Reference](#api-reference)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## Descripción General

ProjectIA es una plataforma profesional que combina dos capacidades fundamentales para el análisis de inversiones:

1. **Búsqueda Avanzada de Noticias**: Utiliza Perplexity AI con acceso a internet en tiempo real para obtener las noticias financieras más relevantes sobre cualquier ticker bursátil.

2. **Análisis Técnico con IA**: Emplea Google Gemini 2.0 Flash para analizar imágenes de gráficos de velas japonesas, identificando patrones, niveles de soporte/resistencia e indicadores técnicos.

---

## Arquitectura y Stack Tecnológico

### Stack Principal

| Capa               | Tecnología           | Versión |
| ------------------ | -------------------- | ------- |
| **Framework**      | Next.js (App Router) | 16.0.10 |
| **Runtime**        | React                | 19.2.1  |
| **Lenguaje**       | TypeScript           | 5.x     |
| **Estilos**        | Tailwind CSS         | 4.x     |
| **Componentes UI** | shadcn/ui            | Latest  |
| **Iconos**         | Lucide React         | Latest  |
| **Validación**     | Zod                  | Latest  |
| **IA Framework**   | Google Genkit        | 1.26.0  |

### Proveedores de IA

| Proveedor         | Modelo           | Propósito                           |
| ----------------- | ---------------- | ----------------------------------- |
| **Perplexity AI** | sonar-pro        | Búsqueda de noticias con acceso web |
| **Google Gemini** | gemini-2.0-flash | Análisis técnico de gráficos        |

### Estructura de Directorios

```
src/
├── app/                    # App Router de Next.js
│   ├── api/
│   │   └── busqueda/       # Endpoint de búsqueda de noticias
│   ├── busqueda-avanzada/  # Página de búsqueda con IA
│   ├── analisis-tecnico/   # Página de análisis de gráficos
│   ├── error.tsx           # Error boundary
│   └── layout.tsx          # Layout raíz
├── ai/
│   ├── genkit.ts           # Configuración de Google Genkit
│   └── flows/              # Flujos de IA
│       └── technical-analysis-flow.ts
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   └── shared/             # Componentes compartidos
├── hooks/
│   └── useNewsSearch.ts    # Hook para búsqueda de noticias
├── lib/
│   ├── constants.ts        # Constantes y configuración
│   ├── env.ts              # Validación de variables de entorno
│   ├── logger.ts           # Logger estructurado
│   ├── rate-limit.ts       # Rate limiter
│   └── utils.ts            # Utilidades (cn)
└── types/
    └── index.ts            # Definiciones de tipos TypeScript
```

---

## Beneficios de la Arquitectura

### Next.js 16 con App Router

- **Server Components por defecto**: Reduce el JavaScript enviado al cliente, mejorando el Time to First Byte (TTFB) y el SEO
- **Streaming y Suspense**: Renderizado progresivo para una experiencia de usuario más fluida
- **API Routes integradas**: Backend y frontend unificados en un solo deployment
- **Edge Runtime Ready**: Preparado para ejecución en edge functions con latencia mínima
- **Caché automático**: Optimización de fetch requests con revalidación inteligente

### React 19

- **Concurrent Features**: Renderizado no bloqueante para interfaces más responsivas
- **Server Actions**: Mutaciones de datos simplificadas sin API endpoints adicionales
- **Automatic Batching mejorado**: Menor cantidad de re-renders

### TypeScript Strict Mode

- **Type Safety completo**: Detección de errores en tiempo de compilación
- **IntelliSense mejorado**: Autocompletado y documentación inline
- **Refactoring seguro**: Cambios en el código con confianza
- **Contratos de datos**: Interfaces bien definidas entre componentes y APIs

### Tailwind CSS v4

- **Zero-runtime CSS**: Sin overhead de JavaScript para estilos
- **Purge automático**: Solo se incluye el CSS utilizado
- **Design tokens consistentes**: Sistema de diseño coherente
- **JIT compiler**: Compilación instantánea durante desarrollo

### Zod para Validación

- **Schema-first validation**: Un único source of truth para tipos y validación
- **Runtime safety**: Validación de datos externos (APIs, formularios)
- **Mensajes de error descriptivos**: Feedback claro para debugging
- **Integración TypeScript**: Inferencia de tipos automática desde schemas

### Google Genkit

- **Abstracción de proveedores**: Facilita cambiar entre modelos de IA
- **Flujos tipados**: Input/output con type safety completo
- **Observabilidad integrada**: Tracing y métricas out-of-the-box
- **Testing simplificado**: Flujos fáciles de testear unitariamente

---

## Agentes de IA Integrados

### 1. Agente de Búsqueda de Noticias (Perplexity AI)

**Modelo**: `sonar-pro`
**Propósito**: Búsqueda y síntesis de noticias financieras en tiempo real

#### Configuración

```typescript
{
  temperature: 0.3,        // Baja aleatoriedad para respuestas factuales
  max_tokens: 2500,        // Límite de respuesta
  search_recency_filter: "month",  // Noticias del último mes
  search_context_size: "high",     // Contexto amplio de búsqueda
  timeout: 30000           // 30 segundos de timeout
}
```

#### Características

- **Acceso a Internet en tiempo real**: Consulta fuentes actualizadas
- **Fuentes verificadas**: Reuters, Bloomberg, Financial Times, WSJ, CNBC
- **Filtrado por relevancia**: Prioriza noticias con impacto en el mercado
- **Clasificación de impacto**: HIGH, MEDIUM, LOW
- **Etiquetado semántico**: earnings, acquisition, regulatory, market, etc.

### 2. Agente de Análisis Técnico (Google Gemini 2.0 Flash)

**Modelo**: `googleai/gemini-2.0-flash`
**Propósito**: Análisis visual de gráficos de velas japonesas

#### Capacidades de Análisis

| Categoría             | Elementos Analizados                                |
| --------------------- | --------------------------------------------------- |
| **Tendencia**         | Estructura de altos/bajos, tendencias por timeframe |
| **Patrones de Velas** | Engulfing, Pinbar, Doji, Morning/Evening Star       |
| **Formaciones**       | Triángulos, Banderas, Hombro-Cabeza-Hombro          |
| **Niveles Clave**     | Soportes, Resistencias, Zonas de liquidez           |
| **Indicadores**       | RSI (valor exacto), MACD (cruces y histograma)      |

#### Principios del Agente

- **Solo datos visuales**: No inventa números ni indicadores no visibles
- **Análisis institucional**: Perspectiva de Price Action profesional
- **Cautela y objetividad**: Evita predicciones especulativas
- **Terminología española**: Output localizado para el mercado hispanohablante

---

## Técnicas de Prompt Engineering

El proyecto implementa técnicas avanzadas de prompt engineering para garantizar respuestas estructuradas, precisas y deterministas de los modelos de IA.

### 1. Salida Estructurada por Esquema (Schema-Based Prompting)

Define explícitamente el formato JSON esperado en el prompt, obligando al modelo a adherirse a una estructura predefinida.

```typescript
// Ejemplo del prompt de búsqueda
`Devuelve ÚNICAMENTE un JSON con este formato exacto:
{
  "news": [
    {
      "title": "...",
      "summary": "...",
      "date": "YYYY-MM-DD",
      "source": "...",
      "url": "...",
      "impact_level": "HIGH|MEDIUM|LOW",
      "tags": ["..."]
    }
  ]
}`
```

**Beneficio**: Elimina ambigüedad en el formato de salida, facilitando el parsing automático y la integración con el sistema de tipos de TypeScript.

### 2. Tipado de Campos (Typed Slots)

Cada campo del schema tiene un tipo de dato específico y restricciones claras.

```typescript
interface NewsItem {
  title: string           // Texto, máximo 100 caracteres
  summary: string         // Texto, máximo 120 palabras
  date: string            // Formato estricto: YYYY-MM-DD
  source: string          // Nombre de fuente verificada
  url: string             // URL válida
  impact_level: ImpactLevel  // Enum: "HIGH" | "MEDIUM" | "LOW"
  tags: string[]          // Array de categorías predefinidas
}
```

**Beneficio**: Garantiza consistencia en los datos y permite validación automática con Zod post-respuesta.

### 3. Descomposición de Tarea en Sub-Salidas

Las tareas complejas se dividen en secciones independientes para mayor precisión.

```typescript
// Análisis técnico dividido en secciones
{
  "general_trend": { /* Análisis de tendencia */ },
  "candle_patterns": { /* Patrones identificados */ },
  "technical_signals": { /* Señales de trading */ },
  "support_levels": [ /* Niveles de soporte */ ],
  "resistance_levels": [ /* Niveles de resistencia */ ],
  "rsi": { /* Indicador RSI */ },
  "macd": { /* Indicador MACD */ }
}
```

**Beneficio**: Cada sub-tarea puede ser evaluada independientemente, reduciendo errores de confusión entre conceptos y permitiendo procesamiento granular.

### 4. Estandarización de Interfaz (Contrato Estable)

Se define un contrato de API inmutable que actúa como interfaz entre la IA y el sistema.

```typescript
// Contrato de respuesta siempre idéntico
interface SearchResponse {
  ticker: string
  news: NewsItem[]
  usage?: TokenUsage
  error?: string
}
```

**Beneficio**: Permite evolucionar la lógica interna del prompt sin modificar el código de integración, siguiendo el principio Open/Closed.

### 5. Instrucciones con Restricciones Explícitas

El prompt incluye directivas negativas que delimitan claramente lo que el modelo NO debe hacer.

```
Instrucciones Críticas de Precisión:
- NO inventes patrones que no sean claramente visibles
- NO proporciones valores numéricos de indicadores si no son visibles
- Si un indicador NO es visible, indica "isVisible: false"
- NO incluyas texto adicional fuera del JSON
- Sé CONSERVADOR: si algo no es claro, indícalo como "no_claro"
```

**Beneficio**: Reduce alucinaciones y respuestas inventadas, fundamental para aplicaciones financieras donde la precisión es crítica.

### 6. Formato de Salida Fuertemente Especificado

Se especifica no solo la estructura, sino también el formato exacto de cada valor.

```
- date: Formato YYYY-MM-DD (ejemplo: 2024-12-15)
- summary: Máximo 120 palabras, en español
- impact_level: EXACTAMENTE uno de: "HIGH", "MEDIUM", "LOW"
- tags: Array con valores de: ["earnings", "acquisition", "regulatory", "market", "analyst", "product", "management", "legal", "dividend", "other"]
```

**Beneficio**: Elimina variaciones de formato que complicarían el procesamiento posterior.

### 7. Vocabulario Controlado

Se utiliza un conjunto cerrado de valores permitidos para campos categóricos.

```typescript
// Vocabulario de impact_level
type ImpactLevel = "HIGH" | "MEDIUM" | "LOW"

// Vocabulario de tags
const ALLOWED_TAGS = [
  "earnings",      // Resultados financieros
  "acquisition",   // Fusiones y adquisiciones
  "regulatory",    // Regulación
  "market",        // Movimientos de mercado
  "analyst",       // Ratings de analistas
  "product",       // Lanzamientos de productos
  "management",    // Cambios directivos
  "legal",         // Asuntos legales
  "dividend",      // Dividendos
  "other"          // Otros
]
```

**Beneficio**: Permite filtrado, agrupación y análisis consistente de las noticias.

### 8. Reglas Negativas y Fallback Determinista

Se definen comportamientos por defecto cuando no hay información disponible.

```
- Si no encuentras noticias relevantes, devuelve: {"news": []}
- Si un indicador no es visible: {"isVisible": false, "value": null}
- NO incluyas texto explicativo fuera del JSON
- Si la imagen no es un gráfico financiero, devuelve:
  {"error": "La imagen proporcionada no parece ser un gráfico financiero válido"}
```

**Beneficio**: Garantiza que el sistema siempre reciba una respuesta parseable, incluso en casos edge o de error.

### Matriz de Técnicas por Agente

| Técnica                  | Perplexity (Búsqueda) | Gemini (Análisis) |
| ------------------------ | :-------------------: | :---------------: |
| Schema-based prompting   |           ✓           |         ✓         |
| Typed slots              |           ✓           |         ✓         |
| Descomposición de tarea  |           ✓           |         ✓         |
| Contrato estable         |           ✓           |         ✓         |
| Restricciones explícitas |           ✓           |         ✓         |
| Formato especificado     |           ✓           |         ✓         |
| Vocabulario controlado   |           ✓           |         ✓         |
| Fallback determinista    |           ✓           |         ✓         |

---

## Seguridad

### Headers HTTP de Seguridad

Configurados en `next.config.ts` para todas las respuestas:

| Header                      | Configuración                                  | Protección                    |
| --------------------------- | ---------------------------------------------- | ----------------------------- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Fuerza HTTPS durante 2 años   |
| `X-Frame-Options`           | `SAMEORIGIN`                                   | Previene clickjacking         |
| `X-Content-Type-Options`    | `nosniff`                                      | Evita MIME sniffing           |
| `X-XSS-Protection`          | `1; mode=block`                                | Protección XSS del navegador  |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`     | Desactiva APIs innecesarias   |
| `Content-Security-Policy`   | Política restrictiva con allowlist             | Previene inyección de scripts |

### Validación de Entrada

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

### Validación de Variables de Entorno

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

### Rate Limiting

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

### Logging Seguro

```typescript
// Sanitización automática de datos sensibles
const SENSITIVE_KEYS = [
  "password", "token", "api_key", "apiKey",
  "secret", "authorization", "cookie"
]

// Truncamiento de valores largos (>500 chars)
// Logs estructurados en JSON para integración con SIEM
```

### Protección de API Keys

- Variables de entorno exclusivamente server-side
- Nunca expuestas al cliente
- Validación de presencia al inicio de la aplicación
- Prefijo `NEXT_PUBLIC_` solo para variables públicas (ninguna API key)

---

## Instalación

### Prerrequisitos

- Node.js 18.x o superior
- npm, yarn, pnpm o bun
- Cuenta y API key de [Perplexity AI](https://www.perplexity.ai/)
- Cuenta y API key de [Google AI Studio](https://aistudio.google.com/)

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/projectia.git
cd projectia
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env.local` en la raíz del proyecto:

```env
# API Keys (requeridas)
GOOGLE_GEMINI_API_KEY=tu_api_key_de_gemini
PERPLEXITY_API_KEY=tu_api_key_de_perplexity

# Entorno
NODE_ENV=development
```

4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

5. **Abrir en navegador**

```
http://localhost:3000
```

### Scripts Disponibles

| Comando         | Descripción                   |
| --------------- | ----------------------------- |
| `npm run dev`   | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción       |
| `npm run start` | Inicia servidor de producción |
| `npm run lint`  | Ejecuta ESLint                |

---

## Uso

### Búsqueda Avanzada de Noticias

1. Navegar a `/busqueda-avanzada`
2. Ingresar el ticker de la acción (ej: `AAPL`, `TSLA`, `NVDA`)
3. Hacer clic en "Buscar"
4. Revisar las noticias categorizadas por nivel de impacto

### Análisis Técnico de Gráficos

1. Navegar a `/analisis-tecnico`
2. Subir una imagen de gráfico de velas japonesas:
   - Arrastrar y soltar
   - Pegar desde portapapeles (Ctrl+V)
   - Seleccionar archivo manualmente
3. Esperar el análisis de la IA
4. Revisar resultados en las pestañas:
   - **Análisis**: Tendencia y patrones
   - **Niveles**: Soportes y resistencias
   - **Indicadores**: RSI y MACD

---

## API Reference

### POST `/api/busqueda`

Busca noticias financieras para un ticker específico.

**Request:**

```typescript
{
  "ticker": "AAPL"  // 1-10 caracteres, alfanumérico
}
```

**Response (200 OK):**

```typescript
{
  "ticker": "AAPL",
  "news": [
    {
      "title": "Apple reporta récord de ingresos en Q4",
      "summary": "La compañía superó expectativas con...",
      "date": "2024-12-10",
      "source": "Reuters",
      "url": "https://reuters.com/...",
      "impact_level": "HIGH",
      "tags": ["earnings", "market"]
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 800,
    "total_tokens": 950
  }
}
```

**Errores:**

| Código | Descripción                |
| ------ | -------------------------- |
| 400    | Ticker inválido            |
| 429    | Rate limit excedido        |
| 500    | Error interno del servidor |
| 504    | Timeout de la API externa  |

**Headers de Caché:**

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=60
```

---

## Estructura del Proyecto

```
ProyectIA/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/busqueda/route.ts  # API de búsqueda
│   │   ├── busqueda-avanzada/     # Página de búsqueda
│   │   ├── analisis-tecnico/      # Página de análisis
│   │   ├── layout.tsx             # Layout principal
│   │   ├── page.tsx               # Landing page
│   │   ├── error.tsx              # Error boundary
│   │   └── not-found.tsx          # Página 404
│   ├── ai/
│   │   ├── genkit.ts              # Config de Genkit
│   │   └── flows/
│   │       └── technical-analysis-flow.ts
│   ├── components/
│   │   ├── ui/                    # shadcn/ui
│   │   └── shared/                # Componentes comunes
│   ├── hooks/
│   │   └── useNewsSearch.ts       # Hook de búsqueda
│   ├── lib/
│   │   ├── constants.ts           # Configuración
│   │   ├── env.ts                 # Validación de env
│   │   ├── logger.ts              # Logger
│   │   ├── rate-limit.ts          # Rate limiter
│   │   └── utils.ts               # Utilidades
│   └── types/
│       └── index.ts               # Tipos TypeScript
├── public/                        # Assets estáticos
├── .env.local                     # Variables de entorno (no commitear)
├── next.config.ts                 # Config de Next.js
├── tailwind.config.ts             # Config de Tailwind
├── tsconfig.json                  # Config de TypeScript
├── package.json                   # Dependencias
├── CLAUDE.md                      # Instrucciones para Claude
└── README.md                      # Este archivo
```

---

## Licencia

Este proyecto es parte del curso de DevExpert.io.

---

## Créditos

Desarrollado con tecnologías de:
- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Google Genkit](https://firebase.google.com/docs/genkit) - Framework IA
- [Perplexity AI](https://www.perplexity.ai/) - Búsqueda con IA
- [Google Gemini](https://deepmind.google/technologies/gemini/) - Modelo multimodal

<p align="center">
  <a href="https://www.buymeacoffee.com/alvaroqp" target="_blank">
    <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;">
  </a>
</p>