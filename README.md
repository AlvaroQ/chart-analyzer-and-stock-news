# ProjectIA - Plataforma de Análisis Financiero con IA

Una aplicación full-stack de análisis financiero potenciada por inteligencia artificial, construida con Next.js 16 y React 19. Integra múltiples agentes de IA especializados para búsqueda de noticias en tiempo real y análisis técnico de gráficos bursátiles.

## Demo

**https://chart-analyzer-and-stock-news.vercel.app/**

<p align="center">
  <img src="assets/screenshot.png" alt="Vista previa de la aplicación" width="800">
</p>

## Tabla de Contenidos

- [Demo](#demo)
- [Descripción General](#descripción-general)
- [Arquitectura y Stack Tecnológico](#arquitectura-y-stack-tecnológico)
- [Beneficios de la Arquitectura](#beneficios-de-la-arquitectura)
- [Agentes de IA Integrados](#agentes-de-ia-integrados)
- [Técnicas de Prompt Engineering](#técnicas-de-prompt-engineering)
- [Seguridad](#seguridad)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## Descripción General

ProjectIA es una plataforma profesional que combina dos capacidades fundamentales para el análisis de inversiones:

1. **Búsqueda Avanzada de Noticias**: Utiliza Perplexity AI, Claude u OpenAI (con búsqueda web en tiempo real) para obtener las noticias financieras más relevantes sobre cualquier ticker bursátil.

2. **Análisis Técnico con IA**: Emplea Google Gemini, Claude u OpenAI para analizar imágenes de gráficos de velas japonesas, identificando patrones, niveles de soporte/resistencia e indicadores técnicos.

En cada funcionalidad eliges el proveedor con el selector de la propia página; la elección se guarda en tu navegador. Si aún no has elegido ninguno, se usa el proveedor por defecto cuando tienes su API key configurada y, si no, el primero que tengas configurado.

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
| **Tests**          | Vitest               | 3.x     |

### Proveedores de IA

| Proveedor            | Modelo             | Funcionalidades                                     |
| -------------------- | ------------------ | --------------------------------------------------- |
| **Perplexity AI**    | `sonar-pro`        | Búsqueda de noticias (por defecto)                  |
| **Google Gemini**    | `gemini-2.0-flash` | Análisis técnico (por defecto)                      |
| **Anthropic Claude** | `claude-opus-5-5`  | Análisis técnico y búsqueda de noticias (web search) |
| **OpenAI**           | `gpt-6-astra`      | Análisis técnico y búsqueda de noticias (web search) |

Todas las llamadas se hacen desde el navegador con la API key de cada usuario (BYOK); no hay backend propio ni endpoints de API. Los adaptadores de cada proveedor están en `src/services/chart/` y `src/services/news/`, y el registro de proveedores en `src/lib/providers.ts`. Ver [Estructura del Proyecto](#estructura-del-proyecto).

---

## Beneficios de la Arquitectura

### Next.js 16 con App Router

- **Server Components por defecto**: Reduce el JavaScript enviado al cliente, mejorando el Time to First Byte (TTFB) y el SEO
- **Streaming y Suspense**: Renderizado progresivo para una experiencia de usuario más fluida
- **Despliegue sencillo**: Toda la app se despliega como un único proyecto en Vercel

### React 19

- **Concurrent Features**: Renderizado no bloqueante para interfaces más responsivas
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

### Adaptadores por proveedor

- **Puertos comunes**: Cada funcionalidad define un contrato (`src/services/chart/types.ts`, `src/services/news/types.ts`) que implementan todos sus proveedores
- **Añadir un proveedor**: Basta con un nuevo adaptador y registrarlo en `src/lib/providers.ts`
- **Testing simplificado**: Los adaptadores se prueban con clientes simulados (Vitest)

---

## Agentes de IA Integrados

### 1. Agente de Búsqueda de Noticias (Perplexity AI, Claude u OpenAI)

**Modelos**: `sonar-pro` (Perplexity), `claude-opus-5-5` con la herramienta `web_search` (Claude), `gpt-6-astra` con la herramienta `web_search` (OpenAI)
**Propósito**: Búsqueda y síntesis de noticias financieras en tiempo real

#### Configuración (Perplexity)

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

### 2. Agente de Análisis Técnico (Google Gemini, Claude u OpenAI)

**Modelos**: `gemini-2.0-flash` (Gemini), `claude-opus-5-5` (Claude), `gpt-6-astra` (OpenAI). Claude y OpenAI usan salida estructurada con JSON Schema.
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

Implementamos 8 técnicas avanzadas para respuestas estructuradas y deterministas:

- **Schema-based prompting** - Formato JSON explícito
- **Typed slots** - Campos con tipos y restricciones
- **Descomposición de tareas** - Sub-salidas independientes
- **Contrato estable** - Interfaz inmutable IA-sistema
- **Restricciones explícitas** - Directivas negativas anti-alucinación
- **Formato especificado** - Valores exactos (fechas, enums)
- **Vocabulario controlado** - Conjunto cerrado de categorías
- **Fallback determinista** - Comportamientos por defecto

Ver documentación completa: [docs/PROMPT_ENGINEERING.md](docs/PROMPT_ENGINEERING.md)

---

## Seguridad

- **Headers HTTP**: HSTS, X-Frame-Options, CSP, X-XSS-Protection
- **Validación de API keys**: Comprobación del formato de cada key antes de guardarla
- **API Keys (BYOK)**: cada usuario introduce sus propias keys en `/configuracion`; se guardan solo en su navegador (localStorage) y se envían directamente a cada proveedor

Ver documentación completa: [docs/SECURITY.md](docs/SECURITY.md)

---

## Instalación

### Prerrequisitos

- Node.js 18.x o superior
- npm, yarn, pnpm o bun
- API key de al menos un proveedor por funcionalidad:
  - [Google AI Studio](https://aistudio.google.com/apikey) (Gemini) o [Anthropic](https://platform.claude.com/settings/keys) (Claude) u [OpenAI](https://platform.openai.com/api-keys) para el análisis técnico
  - [Perplexity AI](https://www.perplexity.ai/settings/api), Anthropic u OpenAI para la búsqueda de noticias

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/AlvaroQ/chart-analyzer-and-stock-news.git
cd chart-analyzer-and-stock-news
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

4. **Abrir en navegador** y configurar tus API keys en `/configuracion`

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
| `npm test`      | Ejecuta los tests (Vitest)    |

---

## Uso

### Búsqueda Avanzada de Noticias

1. Configurar al menos una API key de noticias en `/configuracion`
2. Navegar a `/busqueda-avanzada` y elegir el proveedor en el selector
3. Ingresar el ticker de la acción (ej: `AAPL`, `TSLA`, `NVDA`)
4. Hacer clic en "Buscar"
5. Revisar las noticias categorizadas por nivel de impacto

### Análisis Técnico de Gráficos

1. Configurar al menos una API key de análisis técnico en `/configuracion`
2. Navegar a `/analisis-tecnico` y elegir el proveedor en el selector
3. Subir una imagen de gráfico de velas japonesas:
   - Arrastrar y soltar
   - Pegar desde portapapeles (Ctrl+V)
   - Seleccionar archivo manualmente
4. Esperar el análisis de la IA
5. Revisar resultados en las pestañas:
   - **Análisis**: Tendencia y patrones
   - **Niveles**: Soportes y resistencias
   - **Indicadores**: RSI y MACD

<p align="center">
  <img src="assets/analisis-tecnico.png" alt="Análisis técnico de un gráfico con Claude" width="800">
</p>

---

## Estructura del Proyecto

```
chart-analyzer-and-stock-news/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx               # Landing page
│   │   ├── busqueda-avanzada/     # Página de búsqueda de noticias
│   │   ├── analisis-tecnico/      # Página de análisis de gráficos
│   │   ├── configuracion/         # Gestión de API keys (BYOK)
│   │   ├── layout.tsx             # Layout principal
│   │   ├── error.tsx              # Error boundary
│   │   ├── global-error.tsx       # Error boundary global
│   │   └── not-found.tsx          # Página 404
│   ├── services/
│   │   ├── chart/                 # Adaptadores de análisis técnico (Gemini, Claude, OpenAI)
│   │   ├── news/                  # Adaptadores de noticias (Perplexity, Claude, OpenAI)
│   │   └── clients/               # Clientes de Anthropic y OpenAI
│   ├── components/
│   │   ├── ui/                    # shadcn/ui
│   │   ├── shared/                # Componentes comunes (ProviderSelector, ApiKeyInput...)
│   │   └── providers/             # Providers de React
│   ├── context/
│   │   └── ApiKeysContext.tsx     # Estado de las API keys
│   ├── hooks/
│   │   ├── useNewsSearch.ts       # Hook de búsqueda de noticias
│   │   └── useTechnicalAnalysis.ts # Hook de análisis técnico
│   ├── lib/
│   │   ├── providers.ts           # Registro de proveedores
│   │   ├── provider-preferences.ts # Proveedor elegido por funcionalidad
│   │   ├── api-keys-storage.ts    # Persistencia de keys en localStorage
│   │   ├── api-keys-validation.ts # Validación de formato de keys
│   │   ├── constants.ts           # Configuración
│   │   └── utils.ts               # Utilidades (cn)
│   └── types/                     # Tipos TypeScript
├── tests/                         # Tests (Vitest)
├── docs/                          # Prompt engineering y seguridad
├── assets/                        # Capturas del README
├── next.config.ts                 # Config de Next.js (headers de seguridad)
├── vitest.config.ts               # Config de Vitest
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
- [Perplexity AI](https://www.perplexity.ai/) - Búsqueda con IA
- [Google Gemini](https://deepmind.google/technologies/gemini/) - Modelo multimodal
- [Anthropic Claude](https://www.anthropic.com/claude) - Modelo multimodal con búsqueda web
- [OpenAI](https://openai.com/api/) - Modelo multimodal con búsqueda web

<p align="center">
  <a href="https://www.buymeacoffee.com/alvaroqp" target="_blank">
    <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;">
  </a>
</p>