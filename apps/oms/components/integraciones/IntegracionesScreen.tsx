'use client';

import { StatusPill } from '@kobi/ui';
import { IconLink, IconLoader2, IconUnlink } from '@tabler/icons-react';
import { useState } from 'react';

interface Integracion {
  id: string;
  nombre: string;
  color: string;
  estado: 'connected' | 'disconnected' | 'pending';
  store_id: string | null;
  ultima_sync: string | null;
  comision: number;
  pedidos_hoy: number;
}

const MOCK_INTEGRACIONES: Integracion[] = [
  {
    id: 'eats',
    nombre: 'Uber Eats',
    color: '#06C167',
    estado: 'connected',
    store_id: 'UE-48291-MX',
    ultima_sync: '14:32',
    comision: 0.28,
    pedidos_hoy: 9,
  },
  {
    id: 'rappi',
    nombre: 'Rappi',
    color: '#FF441F',
    estado: 'connected',
    store_id: 'RP-77821',
    ultima_sync: '14:30',
    comision: 0.27,
    pedidos_hoy: 5,
  },
  {
    id: 'didi',
    nombre: 'Didi Food',
    color: '#FF6E14',
    estado: 'disconnected',
    store_id: null,
    ultima_sync: null,
    comision: 0.25,
    pedidos_hoy: 0,
  },
  {
    id: 'direct',
    nombre: 'Uber Direct',
    color: '#000000',
    estado: 'connected',
    store_id: 'UD-MZTL-001',
    ultima_sync: '14:35',
    comision: 0.072,
    pedidos_hoy: 8,
  },
  {
    id: 'stripe',
    nombre: 'Stripe · pagos sitio propio',
    color: '#5469D4',
    estado: 'connected',
    store_id: 'acct_1QxMZL…',
    ultima_sync: '14:35',
    comision: 0.029,
    pedidos_hoy: 8,
  },
];

// Ticket promedio mock para calcular comisión del día
const TICKET_PROM_CENTS = 34800;

function fmtComision(comision: number): string {
  return `${(comision * 100).toFixed(1)}%`;
}

function fmtPago(pedidos: number, comision: number): string {
  const monto = (pedidos * TICKET_PROM_CENTS * comision) / 100;
  return `$${Math.round(monto).toLocaleString('es-MX')}`;
}

// ---------------------------------------------------------------------------
// Modal OAuth simulado
// ---------------------------------------------------------------------------

interface OAuthModalProps {
  nombre: string;
  onSuccess: (storeId: string) => void;
  onClose: () => void;
}

const OAuthModal = ({ nombre, onSuccess, onClose }: OAuthModalProps) => {
  const [phase, setPhase] = useState<'loading' | 'success'>('loading');

  useState(() => {
    const id = setTimeout(() => {
      setPhase('success');
      setTimeout(() => onSuccess('DF-44821'), 1500);
    }, 2000);
    return () => clearTimeout(id);
  });

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
        className="fixed inset-0 z-50 m-auto w-80 h-fit p-0 rounded-xl bg-surface border border-line shadow-lg flex flex-col items-center text-center p-8 gap-4"
      >
        {phase === 'loading' ? (
          <>
            <IconLoader2 size={32} className="text-brand animate-spin" />
            <div>
              <p className="font-medium text-sm text-ink">Conectando con {nombre}</p>
              <p className="text-xs text-ink-400 mt-1">Redirigiendo para autorización…</p>
            </div>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-full bg-ok-soft flex items-center justify-center">
              <IconLink size={20} className="text-ok" />
            </div>
            <div>
              <p className="font-medium text-sm text-ink">Conexión exitosa</p>
              <p className="font-mono text-xs text-ink-400 mt-1">Store ID: DF-44821</p>
            </div>
          </>
        )}
      </dialog>
    </>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const IntegracionesScreen = () => {
  const [integraciones, setIntegraciones] = useState<Integracion[]>(MOCK_INTEGRACIONES);
  const [oauthTarget, setOauthTarget] = useState<string | null>(null);

  const handleConnect = (id: string) => setOauthTarget(id);

  const handleOAuthSuccess = (id: string, storeId: string) => {
    setIntegraciones((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              estado: 'connected',
              store_id: storeId,
              ultima_sync: new Date().toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : i,
      ),
    );
    setOauthTarget(null);
  };

  const connected = integraciones.filter((i) => i.id !== 'stripe');
  const oauthInteg = integraciones.find((i) => i.id === oauthTarget);

  // Ahorro vs todo en Eats
  const eatsFee = 0.28;
  const totalPedidosHoy = connected.reduce((s, i) => s + i.pedidos_hoy, 0);
  const comisionReal = connected.reduce(
    (s, i) => s + i.pedidos_hoy * TICKET_PROM_CENTS * i.comision,
    0,
  );
  const comisionSiTodoEats = totalPedidosHoy * TICKET_PROM_CENTS * eatsFee;
  const ahorroHoy = Math.round((comisionSiTodoEats - comisionReal) / 100);

  return (
    <div className="flex flex-col gap-section-sm overflow-y-auto pb-6">
      <h1 className="text-xl font-medium text-ink shrink-0">Integraciones</h1>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-card-gap">
        {integraciones.map((integ) => (
          <div
            key={integ.id}
            className="bg-surface border border-line rounded-lg p-card-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: integ.color }}
                >
                  {integ.nombre[0]}
                </div>
                <span className="font-medium text-sm text-ink">{integ.nombre}</span>
              </div>
              <StatusPill
                variant={
                  integ.estado === 'connected'
                    ? 'ok'
                    : integ.estado === 'pending'
                      ? 'warn'
                      : 'danger'
                }
              >
                {integ.estado === 'connected'
                  ? 'Conectado'
                  : integ.estado === 'pending'
                    ? 'Verificando'
                    : 'Desconectado'}
              </StatusPill>
            </div>

            {integ.estado === 'connected' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-400">Store ID</span>
                  <span className="font-mono text-ink-300">{integ.store_id}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-400">Última sync</span>
                  <span className="font-mono text-ink-300">{integ.ultima_sync}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-400">Comisión</span>
                  <span className="font-mono text-ink-200">{fmtComision(integ.comision)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {integ.estado === 'connected' ? (
                <button
                  type="button"
                  className="flex-1 h-8 rounded border border-line-2 text-xs font-medium text-ink-200 hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5"
                >
                  <IconUnlink size={13} />
                  Reconectar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConnect(integ.id)}
                  className="flex-1 h-8 rounded bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors flex items-center justify-center gap-1.5"
                >
                  <IconLink size={13} />
                  Conectar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de comisiones */}
      <div className="bg-surface border border-line rounded-lg p-card">
        <h2 className="text-sm font-semibold text-ink mb-4">Resumen de comisiones · hoy</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-ink-400 border-b border-line">
              {['Canal', 'Comisión', 'Pedidos hoy', 'Comisión pagada hoy'].map((h) => (
                <th
                  key={h}
                  className="text-left py-row-header-y px-row-x font-medium whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {connected.map((i) => (
              <tr key={i.id}>
                <td className="py-row-y px-row-x font-medium text-ink">{i.nombre}</td>
                <td className="py-row-y px-row-x font-mono text-ink-200">
                  {fmtComision(i.comision)}
                </td>
                <td className="py-row-y px-row-x font-mono text-ink-300">
                  {i.estado === 'connected' ? i.pedidos_hoy : '—'}
                </td>
                <td className="py-2.5 font-mono text-ink-300">
                  {i.estado === 'connected' && i.pedidos_hoy > 0
                    ? fmtPago(i.pedidos_hoy, i.comision)
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">Ahorro vs. todo en Uber Eats</p>
            <p className="font-mono text-xl font-semibold text-ok-text mt-0.5">
              +${ahorroHoy.toLocaleString('es-MX')} este mes (estimado)
            </p>
          </div>
          <div className="text-xs text-ink-400 text-right max-w-[200px] leading-relaxed">
            Al diversificar canales reduces tu comisión promedio de 28% a{' '}
            {totalPedidosHoy > 0
              ? `${((comisionReal / (totalPedidosHoy * TICKET_PROM_CENTS)) * 100).toFixed(1)}%`
              : '—'}
          </div>
        </div>
      </div>

      {/* OAuth modal */}
      {oauthTarget && oauthInteg && (
        <OAuthModal
          nombre={oauthInteg.nombre}
          onSuccess={(storeId) => handleOAuthSuccess(oauthTarget, storeId)}
          onClose={() => setOauthTarget(null)}
        />
      )}
    </div>
  );
};
