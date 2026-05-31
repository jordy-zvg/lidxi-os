'use client';

import { cents, formatMXN } from '@kobi/shared';
import type { CentsMXN } from '@kobi/shared';
import { Modal } from '@kobi/ui';
import { IconTruck, IconX } from '@tabler/icons-react';
import { useEffect, useState, useTransition } from 'react';
import { dispatchDelivery, quoteDeliveryForOrder } from '../../lib/delivery-actions';

interface DespachoUberModalProps {
  open: boolean;
  orderId: string;
  /** Continuar al recibo, haya o no despacho (despachado / cancelado / error). */
  onDone: () => void;
}

type Phase = 'loading' | 'quoted' | 'error';

/**
 * Cotización + despacho con Uber Direct para pedidos tipo 'envio'.
 * Se abre tras un cobro exitoso: cotiza, muestra el fee y exige aceptación
 * explícita antes de crear la entrega. Si se cancela, el pedido queda cobrado
 * sin despacho (el operador lo maneja manualmente).
 */
export const DespachoUberModal = ({ open, orderId, onDone }: DespachoUberModalProps) => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [feeCents, setFeeCents] = useState<CentsMXN>(cents(0));
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPhase('loading');
    setError(null);
    quoteDeliveryForOrder(orderId).then((r) => {
      if (cancelled) return;
      if (!r.ok) {
        setError(r.error);
        setPhase('error');
        return;
      }
      setFeeCents(cents(r.data.quote.feeCents));
      setQuoteId(r.data.quote.id);
      setPhase('quoted');
    });
    return () => {
      cancelled = true;
    };
  }, [open, orderId]);

  const handleConfirm = () => {
    if (!quoteId) return;
    setError(null);
    startTransition(async () => {
      const r = await dispatchDelivery(orderId, quoteId);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      onDone();
    });
  };

  return (
    <Modal open={open} onClose={onDone} maxWidth="400px" closeOnEscape={!isPending}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-ink">Despacho a domicilio</h2>
          <button
            type="button"
            onClick={onDone}
            className="h-8 w-8 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-brand-soft flex items-center justify-center">
            <IconTruck size={36} className="text-brand" />
          </div>

          {phase === 'loading' && (
            <p className="text-sm text-ink-400">Cotizando envío con Uber Direct…</p>
          )}

          {phase === 'error' && (
            <div className="text-center">
              <p className="text-sm font-medium text-danger-text mb-1">No se pudo cotizar</p>
              <p className="text-xs text-ink-400">{error}</p>
            </div>
          )}

          {phase === 'quoted' && (
            <div className="text-center">
              <p className="text-xs text-ink-400 mb-0.5">Costo de envío estimado</p>
              <p className="font-mono text-3xl font-semibold text-ink tabular-nums">
                {formatMXN(feeCents)}
              </p>
            </div>
          )}
        </div>

        {error && phase === 'quoted' && (
          <p className="text-xs text-danger-text mt-4 text-center">{error}</p>
        )}

        <div className="mt-6 space-y-2">
          {phase === 'quoted' && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="w-full h-12 rounded-md bg-brand text-white text-base font-semibold hover:bg-brand-hover disabled:opacity-40 transition-colors"
            >
              {isPending ? 'Despachando…' : `Confirmar despacho (${formatMXN(feeCents)})`}
            </button>
          )}
          <button
            type="button"
            onClick={onDone}
            disabled={isPending}
            className="w-full h-10 rounded-md border border-line-2 text-ink-200 text-sm font-medium hover:bg-surface-2 disabled:opacity-40 transition-colors"
          >
            {phase === 'quoted' ? 'Cancelar despacho' : 'Continuar sin despacho'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
