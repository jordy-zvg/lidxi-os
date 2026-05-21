'use client';

import { useCart } from '@/lib/cart-store';
import { type StorefrontTenant, triggerMockMercadoPagoWebhook } from '@/lib/storefront-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface PagoMockClientProps {
  tenant: StorefrontTenant;
  preferenceId: string;
  orderId: string;
}

export function PagoMockClient({ tenant, preferenceId, orderId }: PagoMockClientProps) {
  const router = useRouter();
  const cart = useCart(tenant.slug);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pay = (status: 'paid' | 'failed') => {
    setError(null);
    startTransition(async () => {
      const r = await triggerMockMercadoPagoWebhook(preferenceId, status);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      cart.clear();
      const target =
        status === 'paid'
          ? `/${tenant.slug}/pago/exito?orderId=${orderId}`
          : `/${tenant.slug}/pago/error?orderId=${orderId}`;
      // biome-ignore lint/suspicious/noExplicitAny: typedRoutes no infiere paths dinámicos.
      router.push(target as any);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-canvas to-surface-2 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-surface border border-line rounded-lg shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-md bg-[#009EE3] flex items-center justify-center text-white font-bold text-sm">
            MP
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Mercado Pago</h1>
            <p className="text-[11px] text-ink-400 uppercase tracking-wider">
              Sandbox mock · pago simulado
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-warn-soft border border-warn px-4 py-2.5 text-xs text-warn-text">
          <strong>Modo mock activo.</strong> En producción este flujo redirige al checkout real de
          Mercado Pago. Aquí simulamos el resultado para validar el loop completo.
        </div>

        <section className="mt-6 space-y-3">
          <div className="border border-line-2 rounded-md p-3">
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Pedido</p>
            <p className="font-mono text-sm text-ink mt-0.5 break-all">{orderId}</p>
          </div>
          <div className="border border-line-2 rounded-md p-3">
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Restaurante</p>
            <p className="text-sm font-medium text-ink mt-0.5">{tenant.name}</p>
          </div>
          <div className="border border-line-2 rounded-md p-3 bg-canvas">
            <p className="text-[10px] uppercase tracking-wider text-ink-400">
              Tarjeta de prueba (Mercado Pago sandbox)
            </p>
            <p className="font-mono text-sm text-ink mt-1 tracking-wider">5031 7557 3453 0604</p>
            <p className="text-[11px] text-ink-400 mt-1">Mastercard · CVV 123 · Vence 11/30</p>
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-md bg-danger-soft border border-danger px-4 py-2.5 text-sm text-danger-text">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => pay('paid')}
            disabled={pending}
            className="h-11 rounded-md bg-[#009EE3] hover:bg-[#0089C8] text-white text-sm font-semibold disabled:opacity-50"
          >
            {pending ? 'Procesando…' : 'Aprobar pago'}
          </button>
          <button
            type="button"
            onClick={() => pay('failed')}
            disabled={pending}
            className="h-11 rounded-md border border-line-2 text-ink-200 text-sm font-medium hover:bg-surface-2 disabled:opacity-50"
          >
            Rechazar pago
          </button>
        </div>

        <Link
          href={`/${tenant.slug}/checkout`}
          className="block mt-4 text-center text-[11px] text-ink-400 hover:text-ink"
        >
          Cancelar y volver al carrito
        </Link>
      </div>
    </div>
  );
}
