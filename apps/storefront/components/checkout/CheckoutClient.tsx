'use client';

import { useCart } from '@/lib/cart-store';
import {
  type CreateDirectOrderInput,
  type StorefrontTenant,
  createDirectOrderAndPreference,
} from '@/lib/storefront-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

function pesos(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
}

export function CheckoutClient({ tenant }: { tenant: StorefrontTenant }) {
  const cart = useCart(tenant.slug);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const input: CreateDirectOrderInput = {
        tenantSlug: tenant.slug,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        customerAddress: form.address,
        items: cart.lines.map((l) => ({ menuItemId: l.menuItemId, qty: l.qty })),
      };
      const r = await createDirectOrderAndPreference(input);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      // No limpiamos el cart aquí: lo limpiamos cuando el pago se confirma
      // (página de éxito). Si el usuario abandona el checkout, el carrito
      // sigue ahí.
      window.location.href = r.data.initPoint;
    });
  };

  if (cart.lines.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <h1 className="text-xl font-semibold text-ink">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-ink-400">Agrega algo del menú para hacer un pedido.</p>
        <Link
          href={`/${tenant.slug}/menu`}
          className="mt-6 inline-flex h-10 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover items-center"
        >
          Ver menú
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="bg-surface border-b border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <Link
              href={`/${tenant.slug}/menu`}
              className="text-[11px] text-ink-400 hover:text-ink uppercase tracking-wider"
            >
              ← Volver al menú
            </Link>
            <h1 className="text-lg font-semibold text-ink">Checkout</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form className="lg:col-span-3 space-y-5" onSubmit={handleSubmit}>
          <section className="bg-surface border border-line rounded-lg p-card space-y-3">
            <h2 className="text-sm font-semibold text-ink mb-1">Datos de contacto</h2>
            <Field
              label="Nombre completo"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              autoComplete="name"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Teléfono"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                autoComplete="tel"
                inputMode="tel"
                required
              />
              <Field
                label="Email (para comprobante)"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                type="email"
                autoComplete="email"
                required
              />
            </div>
          </section>

          <section className="bg-surface border border-line rounded-lg p-card space-y-3">
            <h2 className="text-sm font-semibold text-ink mb-1">Entrega</h2>
            <Field
              label="Dirección"
              value={form.address}
              onChange={(v) => setForm((f) => ({ ...f, address: v }))}
              autoComplete="street-address"
              required
              help={`${tenant.name} despachará vía Uber Direct hasta tu domicilio.`}
            />
          </section>

          {error && (
            <div className="rounded-md bg-danger-soft border border-danger px-4 py-3 text-sm text-danger-text">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 rounded-md bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {pending ? 'Creando pedido…' : `Pagar ${pesos(cart.totalCents)} con Mercado Pago`}
          </button>
          <p className="text-[11px] text-ink-400 text-center">
            Te redirigimos al checkout seguro de Mercado Pago.
          </p>
        </form>

        {/* Resumen */}
        <aside className="lg:col-span-2 bg-surface border border-line rounded-lg p-card h-fit lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold text-ink mb-3">Resumen</h2>
          <ul className="space-y-2 mb-4">
            {cart.lines.map((line) => (
              <li key={line.menuItemId} className="flex items-start gap-2 text-sm">
                <span className="font-mono text-xs text-ink-400 shrink-0 w-6 text-right">
                  ×{line.qty}
                </span>
                <span className="flex-1 text-ink">{line.name}</span>
                <span className="font-mono text-sm text-ink shrink-0">
                  {pesos(line.unitPriceCents * line.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line-2 pt-3 flex items-center justify-between text-sm">
            <span className="text-ink-400">Subtotal</span>
            <span className="font-mono font-semibold text-ink text-base">
              {pesos(cart.totalCents)}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-ink-400">
            El costo de envío se calcula con Uber Direct antes de despachar.
          </p>
        </aside>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  inputMode,
  autoComplete,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email';
  autoComplete?: string;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
        {label}
        {required && ' *'}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-10 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
      />
      {help && <span className="block mt-1 text-[11px] text-ink-400">{help}</span>}
    </label>
  );
}
