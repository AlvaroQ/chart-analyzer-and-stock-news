import { z } from "zod";

/**
 * Schema de validacion para variables de entorno del servidor
 * Falla rapido si faltan configuraciones criticas
 */
const serverEnvSchema = z.object({
  GOOGLE_GEMINI_API_KEY: z
    .string()
    .min(1, "GOOGLE_GEMINI_API_KEY es requerida"),
  PERPLEXITY_API_KEY: z
    .string()
    .min(1, "PERPLEXITY_API_KEY es requerida"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Tipo inferido del schema de entorno
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Valida y parsea las variables de entorno
 * Lanza error si faltan variables requeridas
 */
function validateEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `  - ${field}: ${messages?.join(", ")}`)
      .join("\n");

    throw new Error(
      `Variables de entorno invalidas:\n${errorMessages}\n\n` +
      `Asegurate de tener un archivo .env.local con las variables requeridas.`
    );
  }

  return parsed.data;
}

/**
 * Variables de entorno validadas del servidor
 * Usar esta exportacion en lugar de process.env directamente
 */
export const env = validateEnv();

/**
 * Helper para verificar si estamos en desarrollo
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Helper para verificar si estamos en produccion
 */
export const isProduction = env.NODE_ENV === "production";
