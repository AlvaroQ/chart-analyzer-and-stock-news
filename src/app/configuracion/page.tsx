'use client';

import { Settings, Trash2, Shield, AlertTriangle, Sparkles, Key, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, ApiKeyInput } from '@/components/shared';
import { useApiKeys } from '@/context';
import { PROVIDER_IDS, PROVIDERS, type ProviderId } from '@/lib/providers';

export default function ConfiguracionPage() {
  const { apiKeys, setApiKey, hasKey, clearAllKeys } = useApiKeys();

  const handleSave = (provider: ProviderId, key: string) => {
    setApiKey(provider, key);
    toast.success(`API Key de ${PROVIDERS[provider].name} guardada correctamente`);
  };

  const handleClear = (provider: ProviderId) => {
    setApiKey(provider, null);
    toast.info(`API Key de ${PROVIDERS[provider].name} eliminada`);
  };

  const handleClearAll = () => {
    clearAllKeys();
    toast.info('Todas las API keys han sido eliminadas');
  };

  const totalProviders = PROVIDER_IDS.length;
  const configuredCount = PROVIDER_IDS.filter((id) => hasKey(id)).length;
  const allConfigured = configuredCount === totalProviders;

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
          subtitle={`Configura tus API keys (${configuredCount}/${totalProviders} configuradas)`}
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
          {/* API Keys Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROVIDER_IDS.map((id) => (
              <ProviderKeyCard
                key={id}
                provider={id}
                value={apiKeys[id]}
                isActive={hasKey(id)}
                onSave={(key) => handleSave(id, key)}
                onClear={() => handleClear(id)}
              />
            ))}
          </div>

          {/* Zona de peligro - Full width */}
          {configuredCount > 0 && (
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

// ==========================================
// Provider card
// ==========================================

interface ProviderTheme {
  hoverShadow: string;
  activeBorder: string;
  idleBorder: string;
  overlay: string;
  glowActive: string;
  glowIdle: string;
  iconBox: string;
  iconColor: string;
  title: string;
}

const PROVIDER_THEMES: Record<ProviderId, ProviderTheme> = {
  gemini: {
    hoverShadow: 'hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)]',
    activeBorder: 'border-purple-500/30 shadow-[0_8px_30px_rgba(168,85,247,0.1)]',
    idleBorder: 'border-neutral-800 hover:border-purple-500/30',
    overlay: 'from-purple-500/5 via-transparent to-pink-500/5',
    glowActive: 'bg-purple-500/30',
    glowIdle: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    iconBox: 'from-purple-500/20 to-pink-500/20 border-purple-500/20',
    iconColor: 'text-purple-400',
    title: 'from-purple-400 to-pink-400',
  },
  perplexity: {
    hoverShadow: 'hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)]',
    activeBorder: 'border-blue-500/30 shadow-[0_8px_30px_rgba(59,130,246,0.1)]',
    idleBorder: 'border-neutral-800 hover:border-blue-500/30',
    overlay: 'from-blue-500/5 via-transparent to-cyan-500/5',
    glowActive: 'bg-blue-500/30',
    glowIdle: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    iconBox: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20',
    iconColor: 'text-blue-400',
    title: 'from-blue-400 to-cyan-400',
  },
  anthropic: {
    hoverShadow: 'hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)]',
    activeBorder: 'border-orange-500/30 shadow-[0_8px_30px_rgba(249,115,22,0.1)]',
    idleBorder: 'border-neutral-800 hover:border-orange-500/30',
    overlay: 'from-orange-500/5 via-transparent to-amber-500/5',
    glowActive: 'bg-orange-500/30',
    glowIdle: 'bg-orange-500/10 group-hover:bg-orange-500/20',
    iconBox: 'from-orange-500/20 to-amber-500/20 border-orange-500/20',
    iconColor: 'text-orange-400',
    title: 'from-orange-400 to-amber-400',
  },
  openai: {
    hoverShadow: 'hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]',
    activeBorder: 'border-emerald-500/30 shadow-[0_8px_30px_rgba(16,185,129,0.1)]',
    idleBorder: 'border-neutral-800 hover:border-emerald-500/30',
    overlay: 'from-emerald-500/5 via-transparent to-teal-500/5',
    glowActive: 'bg-emerald-500/30',
    glowIdle: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconBox: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    title: 'from-emerald-400 to-teal-400',
  },
};

interface ProviderKeyCardProps {
  provider: ProviderId;
  value: string | null;
  isActive: boolean;
  onSave: (key: string) => void;
  onClear: () => void;
}

function ProviderKeyCard({ provider, value, isActive, onSave, onClear }: ProviderKeyCardProps) {
  const config = PROVIDERS[provider];
  const theme = PROVIDER_THEMES[provider];

  return (
    <Card className={`
      group relative overflow-hidden
      bg-neutral-900/50 backdrop-blur-xl
      border transition-all duration-500 ease-out
      ${theme.hoverShadow}
      hover:-translate-y-1
      ${isActive ? theme.activeBorder : theme.idleBorder}
    `}>
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        {isActive ? (
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
            <div className={`absolute inset-0 rounded-xl blur-lg transition-all duration-300 ${isActive ? theme.glowActive : theme.glowIdle}`} />
            <div className={`relative p-2.5 rounded-xl bg-gradient-to-br border ${theme.iconBox}`}>
              <Sparkles className={`h-5 w-5 ${theme.iconColor}`} />
            </div>
          </div>
          <div>
            <CardTitle className={`text-lg bg-gradient-to-r ${theme.title} bg-clip-text text-transparent`}>
              {config.name}
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-0.5">
              {config.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative pt-4">
        <ApiKeyInput type={provider} value={value} onSave={onSave} onClear={onClear} />
      </CardContent>
    </Card>
  );
}
