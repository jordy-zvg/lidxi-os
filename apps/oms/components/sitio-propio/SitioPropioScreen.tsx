'use client';

import { PreviewBadge } from '@/components/admin/PreviewBadge';
import {
  type DeliveryProviderRow,
  disconnectDeliveryProvider,
  saveDeliveryProviderConnection,
} from '@/lib/delivery-provider-actions';
import type {
  DELIVERY_PROVIDER_SCHEMAS,
  DeliveryProviderId,
} from '@/lib/delivery-provider-schemas';
import { StatusPill } from '@kobi/ui';
import {
  IconBrandWhatsapp,
  IconLink,
  IconMapPin,
  IconReceipt2,
  IconTruck,
  IconUnlink,
  IconX,
} from '@tabler/icons-react';
import { useState, useTransition } from 'react';

interface SitioPropioScreenProps {
  providers: DeliveryProviderRow[];
  providerSchemas: typeof DELIVERY_PROVIDER_SCHEMAS;
}

const SAMPLE_ORDERS = [
  {
    id: 'SP-A123',
    status: 'preparing' as const,
    customer: 'Laura M.',
    items: '2× Tacos al pastor · 1× Agua jamaica',
    total: '$348',
    eta: '12 min',
    accent: 'border-l-warn',
  },
  {
    id: 'SP-A124',
    status: 'ready' as const,
    customer: 'Pablo R.',
    items: '1× Quesadilla hongos · 1× Flan coco',
    total: '$210',
    eta: 'Listo · esperando courier',
    accent: 'border-l-ok',
  },
  {
    id: 'SP-A125',
    status: 'received' as const,
    customer: 'Sofía K.',
    items: '3× Tacos suadero · 2× Cerveza',
    total: '$580',
    eta: '2 min',
    accent: 'border-l-info',
  },
];

const STATUS_LABEL = {
  received: 'Nuevo',
  preparing: 'En cocina',
  ready: 'Listo',
} as const;

const STATUS_VARIANT = {
  received: 'info',
  preparing: 'warn',
  ready: 'ok',
} as const;

export const SitioPropioScreen = ({ providers, providerSchemas }: SitioPropioScreenProps) => {
  const [editing, setEditing] = useState<DeliveryProviderId | null>(null);
  const uberDirect = providers.find((p) => p.provider === 'uber_direct');

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-ink">Sitio propio</h1>
          <p className="mt-1 text-sm text-ink-400 max-w-xl">
            Tu tienda directa con logística Uber Direct y cobro tuyo. Diversifica canales y reduce
            la comisión que pagas a marketplaces.
          </p>
        </div>
        <PreviewBadge variant="preview" />
      </header>

      {/* HERO STRIP — 4 columnas de métricas del canal */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-card-gap">
        <HeroStat label="Órdenes hoy" value="3" sub="vs 8 en marketplaces" />
        <HeroStat
          label="Comisión promedio"
          value="0%"
          sub="(7% solo logística)"
          accent="text-ok-text"
        />
        <HeroStat label="Ticket promedio" value="$379" sub="+22% vs Uber Eats" />
        <HeroStat
          label="Ahorro estimado mes"
          value="$8,420"
          sub="vs todo en marketplaces"
          accent="text-ok-text"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
        {/* Inbox de órdenes directas — 2/3 */}
        <section className="lg:col-span-2 bg-surface border border-line rounded-lg p-card">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <IconReceipt2 size={14} />
              Inbox de órdenes directas
            </h2>
            <span className="text-[11px] text-ink-400">datos de ejemplo</span>
          </header>
          <ul className="space-y-2.5">
            {SAMPLE_ORDERS.map((o) => (
              <li
                key={o.id}
                className={`flex items-center gap-3 border-l-4 ${o.accent} bg-canvas rounded-r-md px-3 py-2.5`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink-400">{o.id}</span>
                    <StatusPill variant={STATUS_VARIANT[o.status]}>
                      {STATUS_LABEL[o.status]}
                    </StatusPill>
                  </div>
                  <p className="text-sm text-ink mt-0.5 truncate">{o.customer}</p>
                  <p className="text-xs text-ink-400 truncate">{o.items}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-semibold text-ink">{o.total}</p>
                  <p className="text-[11px] text-ink-400">{o.eta}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Mapa de cobertura SVG */}
        <section className="bg-surface border border-line rounded-lg p-card">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <IconMapPin size={14} />
              Cobertura
            </h2>
            <span className="text-[11px] text-ink-400">5 km</span>
          </header>
          <div className="relative aspect-square bg-canvas rounded-md overflow-hidden">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full"
            >
              {/* Calles dummy */}
              {[40, 80, 120, 160].map((y) => (
                <line
                  key={`h-${y}`}
                  x1="0"
                  y1={y}
                  x2="200"
                  y2={y}
                  stroke="currentColor"
                  className="text-ink-500/30"
                  strokeWidth="0.5"
                />
              ))}
              {[40, 80, 120, 160].map((x) => (
                <line
                  key={`v-${x}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="200"
                  stroke="currentColor"
                  className="text-ink-500/30"
                  strokeWidth="0.5"
                />
              ))}
              {/* Radio de cobertura */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="currentColor"
                className="text-brand/15"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              {/* Pin del restaurante */}
              <circle cx="100" cy="100" r="5" fill="currentColor" className="text-brand" />
              <circle
                cx="100"
                cy="100"
                r="10"
                fill="none"
                stroke="currentColor"
                className="text-brand"
                strokeWidth="1"
                opacity="0.4"
              />
            </svg>
          </div>
          <p className="mt-2 text-[11px] text-ink-400 text-center">
            Radio de entrega actual · ajusta abajo
          </p>
        </section>
      </div>

      {/* Bloque Uber Direct: REAL persistencia */}
      <section className="bg-surface border border-line rounded-lg p-card">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: providerSchemas.uber_direct.brand }}
            >
              U
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                Uber Direct
                <span className="text-[10px] font-medium uppercase tracking-wider text-ok-text bg-ok-soft px-2 py-0.5 rounded-full">
                  Persistencia real
                </span>
              </h2>
              <p className="text-xs text-ink-400 mt-0.5">
                {providerSchemas.uber_direct.description}
              </p>
            </div>
          </div>
          {uberDirect && (
            <StatusPill
              variant={
                uberDirect.status === 'connected'
                  ? 'ok'
                  : uberDirect.status === 'pending'
                    ? 'warn'
                    : uberDirect.status === 'error'
                      ? 'danger'
                      : 'neutral'
              }
            >
              {uberDirect.status === 'connected'
                ? 'Conectado'
                : uberDirect.status === 'pending'
                  ? 'Pendiente'
                  : uberDirect.status === 'error'
                    ? 'Error'
                    : 'Desconectado'}
            </StatusPill>
          )}
        </header>

        {uberDirect && uberDirect.status !== 'disconnected' && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
            {providerSchemas.uber_direct.fields
              .filter((f) => f.type === 'text' && uberDirect.credentials[f.name])
              .map((f) => (
                <div key={f.name} className="flex justify-between">
                  <dt className="text-ink-400 text-xs">{f.label}</dt>
                  <dd className="font-mono text-xs text-ink-300 truncate max-w-[200px]">
                    {uberDirect.credentials[f.name]}
                  </dd>
                </div>
              ))}
          </dl>
        )}

        <div className="flex gap-2">
          {uberDirect && uberDirect.status === 'disconnected' ? (
            <button
              type="button"
              onClick={() => setEditing('uber_direct')}
              className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <IconLink size={14} />
              Conectar Uber Direct
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing('uber_direct')}
                className="h-9 px-4 rounded-md border border-line-2 text-sm font-medium text-ink-200 hover:bg-surface-2 transition-colors"
              >
                Editar credenciales
              </button>
              <DisconnectButton />
            </>
          )}
        </div>

        <p className="mt-3 text-[11px] text-ink-400">
          Guarda las credenciales que Uber Direct te asignó. La activación real con su API llegará
          en un sprint próximo — por ahora las credenciales quedan resguardadas con RLS por tu
          tenant.
        </p>
      </section>

      {/* Config del storefront — cascarón */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-card-gap">
        <ConfigCard
          icon={<IconTruck size={14} />}
          title="Radio y modelo de subsidio"
          description="Define hasta dónde entregas y cómo subsidias el envío (a tu costo, dividido, o cliente paga todo)."
        />
        <ConfigCard
          icon={<IconBrandWhatsapp size={14} />}
          title="Notificaciones WhatsApp"
          description="Avisa a tus clientes que su orden está lista y comparte tracking del courier."
        />
      </section>

      {editing && (
        <UberDirectFormDrawer
          schema={providerSchemas.uber_direct}
          existing={uberDirect?.credentials ?? {}}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function HeroStat({
  label,
  value,
  sub,
  accent = 'text-ink',
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg p-card">
      <p className="text-xs text-ink-400">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-400">{sub}</p>
    </div>
  );
}

function ConfigCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg p-card">
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
          {icon}
          {title}
        </h3>
        <PreviewBadge variant="soon" />
      </header>
      <p className="text-xs text-ink-400 leading-relaxed">{description}</p>
    </div>
  );
}

function DisconnectButton() {
  const [pending, startTransition] = useTransition();
  const onClick = () => {
    if (!confirm('¿Desconectar Uber Direct? Las credenciales se borran de la base de datos.'))
      return;
    startTransition(async () => {
      await disconnectDeliveryProvider('uber_direct');
    });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="h-9 px-3 rounded-md border border-line-2 text-sm font-medium text-danger-text hover:bg-surface-2 transition-colors flex items-center gap-1.5 disabled:opacity-40"
    >
      <IconUnlink size={14} />
      Desconectar
    </button>
  );
}

function UberDirectFormDrawer({
  schema,
  existing,
  onClose,
}: {
  schema: (typeof DELIVERY_PROVIDER_SCHEMAS)['uber_direct'];
  existing: Record<string, string>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...existing }));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const r = await saveDeliveryProviderConnection('uber_direct', values);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      onClose();
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/70"
        role="presentation"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog
        open
        aria-label="Conectar Uber Direct"
        className="fixed right-0 top-0 bottom-0 z-50 w-[440px] m-0 p-0 bg-surface border-l border-line shadow-lg flex flex-col overflow-hidden"
      >
        <header className="shrink-0 border-b border-line px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: schema.brand }}
            >
              U
            </div>
            <span className="font-medium text-sm text-ink">Conectar Uber Direct</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-xs text-ink-400">
            Captura las credenciales que Uber Direct te proporcionó cuando te dieron acceso de
            partner. Se guardan con RLS por tu tenant — solo tú las ves.
          </p>

          {error && (
            <div className="rounded-md bg-danger-soft border border-danger px-4 py-2.5 text-sm text-danger-text">
              {error}
            </div>
          )}

          {schema.fields.map((f) => (
            <div key={f.name}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1"
                htmlFor={`ud-${f.name}`}
              >
                {f.label}
                {f.required && ' *'}
              </label>
              <input
                id={`ud-${f.name}`}
                type={f.type}
                placeholder={f.placeholder}
                value={values[f.name] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm font-mono text-ink focus:outline-none focus:border-brand"
              />
              {f.help && <p className="mt-1 text-[11px] text-ink-400">{f.help}</p>}
            </div>
          ))}

          <div className="rounded-lg bg-warn-soft border border-warn px-3 py-2.5 text-xs text-warn-text">
            La conexión se marca como <strong>Pendiente</strong>. La activación real con la API de
            Uber Direct llegará cuando obtengamos acceso de partner.
          </div>
        </div>

        <footer className="shrink-0 border-t border-line px-5 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-9 px-4 rounded-md border border-line-2 text-sm text-ink-200 hover:bg-surface-2 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover disabled:opacity-40"
          >
            {pending ? 'Guardando…' : 'Guardar credenciales'}
          </button>
        </footer>
      </dialog>
    </>
  );
}
