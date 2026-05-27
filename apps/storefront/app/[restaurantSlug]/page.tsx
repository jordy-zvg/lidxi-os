import { loadRestaurantLanding } from '@/lib/storefront-actions';
import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function pesos(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
}

export default async function RestaurantLandingPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  const landing = await loadRestaurantLanding(params.restaurantSlug);
  if (!landing) notFound();

  const accent = landing.brandColor ?? '#4f46e5';
  const menuHref = `/${landing.slug}/menu` as Route;

  return (
    <main className="min-h-screen bg-canvas">
      {/* Accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 sm:pt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
          Menú directo
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-ink capitalize">
          {landing.name}
        </h1>
        {landing.address && <p className="mt-3 text-sm text-ink-400">{landing.address}</p>}
        <p className="mt-4 max-w-xl text-base text-ink-300 leading-relaxed">
          Ordena directo, sin marketplaces ni comisiones extra. Recíbelo en tu domicilio.
        </p>
        <div className="mt-8">
          <Link
            href={menuHref}
            className="inline-flex h-12 items-center rounded-md px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            Ver menú
          </Link>
        </div>
      </section>

      {/* Featured */}
      {landing.featured.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              Del menú
            </h2>
            <Link
              href={menuHref}
              className="text-sm font-medium hover:underline"
              style={{ color: accent }}
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {landing.featured.map((item) => (
              <Link
                key={item.id}
                href={menuHref}
                className="group overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-md"
              >
                {item.image_url ? (
                  // biome-ignore lint/a11y/useAltText: alt presente
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-canvas to-surface-2 text-xs text-ink-400">
                    Sin imagen
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-sm font-medium text-ink line-clamp-1">{item.name}</span>
                  <span className="shrink-0 font-mono text-sm text-ink-300">
                    {pesos(item.price_cents)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
