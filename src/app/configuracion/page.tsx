'use client';

import { Settings, Trash2, Shield, AlertTriangle, Sparkles, Key, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, ApiKeyInput } from '@/components/shared';
import { useApiKeys } from '@/context';

export default function ConfiguracionPage() {
  const {
    geminiApiKey,
    perplexityApiKey,
    setGeminiApiKey,
    setPerplexityApiKey,
    clearAllKeys,
    hasGeminiKey,
    hasPerplexityKey,
  } = useApiKeys();

  const handleSaveGemini = (key: string) => {
    setGeminiApiKey(key);
    toast.success('API Key de Gemini guardada correctamente');
  };

  const handleSavePerplexity = (key: string) => {
    setPerplexityApiKey(key);
    toast.success('API Key de Perplexity guardada correctamente');
  };

  const handleClearGemini = () => {
    setGeminiApiKey(null);
    toast.info('API Key de Gemini eliminada');
  };

  const handleClearPerplexity = () => {
    setPerplexityApiKey(null);
    toast.info('API Key de Perplexity eliminada');
  };

  const handleClearAll = () => {
    clearAllKeys();
    toast.info('Todas las API keys han sido eliminadas');
  };

  const configuredCount = [hasGeminiKey, hasPerplexityKey].filter(Boolean).length;
  const allConfigured = configuredCount === 2;

  return (
    <main className="min-h-screen bg-neutral-950 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-6 max-w-5xl">
        <PageHeader
          icon={Settings}
          title="Configuracion"
          subtitle={`Configura tus API keys (${configuredCount}/2 configuradas)`}
          showAiBadge={false}
        />

        {/* Status indicator + Security notice inline */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-500 ease-out
            ${allConfigured
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }
          `}>
            {allConfigured ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Todas las APIs configuradas</span>
                <Sparkles className="h-4 w-4 animate-pulse" />
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                <span>Configuracion pendiente</span>
              </>
            )}
          </div>

          {/* Security badge compact */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20">
            <Shield className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-amber-200/80">Keys guardadas localmente</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* API Keys Grid - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Key de Gemini - Premium Card */}
          <Card className={`
            group relative overflow-hidden
            bg-neutral-900/50 backdrop-blur-xl
            border transition-all duration-500 ease-out
            hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)]
            hover:-translate-y-1
            ${hasGeminiKey
              ? 'border-purple-500/30 shadow-[0_8px_30px_rgba(168,85,247,0.1)]'
              : 'border-neutral-800 hover:border-purple-500/30'
            }
          `}>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Status indicator */}
            <div className="absolute top-4 right-4">
              {hasGeminiKey ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">Activa</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/50 border border-neutral-700">
                  <XCircle className="w-3 h-3 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500">Sin configurar</span>
                </div>
              )}
            </div>

            <CardHeader className="relative pb-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-xl blur-lg transition-all duration-300 ${hasGeminiKey ? 'bg-purple-500/30' : 'bg-purple-500/10 group-hover:bg-purple-500/20'}`} />
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Google Gemini
                  </CardTitle>
                  <CardDescription className="text-neutral-400 mt-0.5">
                    Analisis tecnico con vision por IA
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-4">
              <ApiKeyInput
                type="gemini"
                value={geminiApiKey}
                onSave={handleSaveGemini}
                onClear={handleClearGemini}
              />
            </CardContent>
          </Card>

            {/* API Key de Perplexity - Premium Card */}
          <Card className={`
            group relative overflow-hidden
            bg-neutral-900/50 backdrop-blur-xl
            border transition-all duration-500 ease-out
            hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)]
            hover:-translate-y-1
            ${hasPerplexityKey
              ? 'border-blue-500/30 shadow-[0_8px_30px_rgba(59,130,246,0.1)]'
              : 'border-neutral-800 hover:border-blue-500/30'
            }
          `}>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Status indicator */}
            <div className="absolute top-4 right-4">
              {hasPerplexityKey ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">Activa</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/50 border border-neutral-700">
                  <XCircle className="w-3 h-3 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500">Sin configurar</span>
                </div>
              )}
            </div>

            <CardHeader className="relative pb-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-xl blur-lg transition-all duration-300 ${hasPerplexityKey ? 'bg-blue-500/30' : 'bg-blue-500/10 group-hover:bg-blue-500/20'}`} />
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Perplexity
                  </CardTitle>
                  <CardDescription className="text-neutral-400 mt-0.5">
                    Busqueda avanzada de noticias financieras
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-4">
              <ApiKeyInput
                type="perplexity"
                value={perplexityApiKey}
                onSave={handleSavePerplexity}
                onClear={handleClearPerplexity}
              />
            </CardContent>
          </Card>
          </div>

          {/* Zona de peligro - Full width */}
          {(hasGeminiKey || hasPerplexityKey) && (
            <div className="
              relative overflow-hidden rounded-xl p-4
              bg-red-950/20 backdrop-blur-xl
              border border-red-500/20
              transition-all duration-300
              hover:border-red-500/30
            ">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-sm text-red-400 font-medium">Zona de peligro</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAll}
                  className="
                    gap-2
                    bg-red-500/10 hover:bg-red-500/20
                    text-red-400 hover:text-red-300
                    border border-red-500/30 hover:border-red-500/50
                    transition-all duration-300
                  "
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar todas
                </Button>
              </div>
            </div>
          )}

          {/* Informacion adicional - Full width */}
          <div className="
            relative p-4 rounded-xl
            bg-neutral-900/30 backdrop-blur
            border border-neutral-800/50
            text-xs text-neutral-500
          ">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-neutral-800/50">
                <Key className="h-3 w-3 text-neutral-500" />
              </div>
              <p className="leading-relaxed">
                <strong className="text-neutral-400">Nota:</strong> Los costos se cargan a tu cuenta de cada proveedor.
                No usar en computadoras publicas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
