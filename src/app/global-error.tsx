"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary para errores criticos que afectan el root layout
 * Este componente tiene estilos inline porque no puede depender de CSS externos
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log basico ya que el logger puede no estar disponible
    console.error("Error critico global:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: "400px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 1.5rem",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <AlertCircle
              style={{ width: "32px", height: "32px", color: "#f87171" }}
            />
          </div>

          {/* Title */}
          <h1
            style={{
              color: "#ffffff",
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "0.75rem",
            }}
          >
            Error Critico
          </h1>

          {/* Description */}
          <p
            style={{
              color: "#a1a1aa",
              fontSize: "1rem",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
            }}
          >
            Ha ocurrido un error grave en la aplicacion. Por favor, recarga la
            pagina.
          </p>

          {/* Button */}
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.75rem",
              fontSize: "1rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#8b5cf6")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#7c3aed")
            }
          >
            <RefreshCw style={{ width: "16px", height: "16px" }} />
            Recargar pagina
          </button>
        </div>
      </body>
    </html>
  );
}
