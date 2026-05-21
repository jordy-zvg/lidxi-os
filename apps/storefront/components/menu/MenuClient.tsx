'use client';

import { useCart } from '@/lib/cart-store';
import type { StorefrontMenuItem, StorefrontTenant } from '@/lib/storefront-actions';
import Link from 'next/link';
import { useState } from 'react';

interface MenuClientProps {
  tenant: StorefrontTenant;
  items: StorefrontMenuItem[];
}

function pesos(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
}

export function MenuClient({ tenant, items }: MenuClientProps) {
  const cart = useCart(tenant.slug);

  // Agrupar items por categoría
  const grouped = items.reduce<Record<string, StorefrontMenuItem[]>>((acc, item) => {
    const cat = item.category ?? 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-canvas pb-32">
      <header className="bg-surface border-b border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
          <div>
            <Link
              href={`/${tenant.slug}`}
              className="text-[11px] text-ink-400 hover:text-ink uppercase tracking-wider"
            >
              ← Inicio
            </Link>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink capitalize">{tenant.name}</h1>
            <p className="text-xs text-ink-400">Menú directo · ordena sin marketplaces</p>
          </div>
          {cart.itemCount > 0 && (
            <Link
              href={`/${tenant.slug}/checkout`}
              className="h-10 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors flex items-center gap-2"
            >
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">{cart.itemCount}</span>
              Ir al checkout · {pesos(cart.totalCents)}
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line-2 bg-surface py-16 px-6 text-center">
            <p className="text-base font-medium text-ink">El menú no está disponible</p>
            <p className="mt-2 text-sm text-ink-400">
              {tenant.name} no tiene items activos en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <section key={cat}>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-3">
                  {cat}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(grouped[cat] ?? []).map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={() =>
                        cart.addItem({
                          menuItemId: item.id,
                          name: item.name,
                          unitPriceCents: item.price_cents,
                          imageUrl: item.image_url,
                        })
                      }
                      qtyInCart={cart.lines.find((l) => l.menuItemId === item.id)?.qty ?? 0}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {cart.itemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line shadow-lg lg:hidden">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-ink-400">
                {cart.itemCount} {cart.itemCount === 1 ? 'producto' : 'productos'}
              </p>
              <p className="font-mono font-semibold text-ink text-base">{pesos(cart.totalCents)}</p>
            </div>
            <Link
              href={`/${tenant.slug}/checkout`}
              className="h-11 px-5 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover flex items-center gap-2"
            >
              Ir al checkout →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  onAdd,
  qtyInCart,
}: {
  item: StorefrontMenuItem;
  onAdd: () => void;
  qtyInCart: number;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <article className="bg-surface border border-line rounded-lg overflow-hidden flex flex-col">
      {item.image_url ? (
        // biome-ignore lint/a11y/useAltText: alt está presente
        <img
          src={item.image_url}
          alt={item.name}
          className="aspect-[4/3] object-cover bg-canvas"
          loading="lazy"
        />
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-canvas to-surface-2 flex items-center justify-center text-ink-400 text-xs">
          Sin imagen
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <h3 className="text-sm font-medium text-ink">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-ink-400 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <p className="font-mono font-semibold text-ink text-sm">{pesos(item.price_cents)}</p>
          <button
            type="button"
            onClick={() => {
              onAdd();
              setPressed(true);
              setTimeout(() => setPressed(false), 300);
            }}
            className={`h-9 min-w-[44px] px-3 rounded-md bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors ${pressed ? 'scale-95' : ''} transition-transform`}
          >
            {qtyInCart > 0 ? `+1 · (${qtyInCart})` : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}
