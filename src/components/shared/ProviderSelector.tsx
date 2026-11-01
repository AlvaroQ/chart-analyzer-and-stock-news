'use client';

import { Check, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApiKeys } from '@/context';
import { PROVIDERS, providersForFeature, type FeatureId } from '@/lib/providers';

interface ProviderSelectorProps {
  feature: FeatureId;
  className?: string;
}

/**
 * Selector del proveedor de IA para una funcionalidad.
 * La eleccion se guarda en el navegador.
 */
export function ProviderSelector({ feature, className }: ProviderSelectorProps) {
  const { featureProviders, setFeatureProvider, hasKey, isLoading } = useApiKeys();
  const selected = featureProviders[feature];

  return (
    <div
      role="radiogroup"
      aria-label="Proveedor de IA"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span className="text-xs text-zinc-500">Proveedor:</span>
      {providersForFeature(feature).map((id) => {
        const isSelected = id === selected;
        const configured = !isLoading && hasKey(id);
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setFeatureProvider(feature, id)}
            title={configured ? PROVIDERS[id].modelLabel : 'API key sin configurar'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              isSelected
                ? 'border-violet-500/50 bg-violet-500/15 text-violet-200'
                : 'border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200',
            )}
          >
            {configured ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <KeyRound className="h-3 w-3 text-amber-400" />
            )}
            {PROVIDERS[id].name}
          </button>
        );
      })}
    </div>
  );
}
