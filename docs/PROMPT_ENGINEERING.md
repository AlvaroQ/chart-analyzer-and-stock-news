# Técnicas de Prompt Engineering

El proyecto implementa técnicas avanzadas de prompt engineering para garantizar respuestas estructuradas, precisas y deterministas de los modelos de IA.

## 1. Salida Estructurada por Esquema (Schema-Based Prompting)

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

## 2. Tipado de Campos (Typed Slots)

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

## 3. Descomposición de Tarea en Sub-Salidas

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

## 4. Estandarización de Interfaz (Contrato Estable)

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

## 5. Instrucciones con Restricciones Explícitas

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

## 6. Formato de Salida Fuertemente Especificado

Se especifica no solo la estructura, sino también el formato exacto de cada valor.

```
- date: Formato YYYY-MM-DD (ejemplo: 2024-12-15)
- summary: Máximo 120 palabras, en español
- impact_level: EXACTAMENTE uno de: "HIGH", "MEDIUM", "LOW"
- tags: Array con valores de: ["earnings", "acquisition", "regulatory", "market", "analyst", "product", "management", "legal", "dividend", "other"]
```

**Beneficio**: Elimina variaciones de formato que complicarían el procesamiento posterior.

## 7. Vocabulario Controlado

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

## 8. Reglas Negativas y Fallback Determinista

Se definen comportamientos por defecto cuando no hay información disponible.

```
- Si no encuentras noticias relevantes, devuelve: {"news": []}
- Si un indicador no es visible: {"isVisible": false, "value": null}
- NO incluyas texto explicativo fuera del JSON
- Si la imagen no es un gráfico financiero, devuelve:
  {"error": "La imagen proporcionada no parece ser un gráfico financiero válido"}
```

**Beneficio**: Garantiza que el sistema siempre reciba una respuesta parseable, incluso en casos edge o de error.

## Matriz de Técnicas por Agente

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
