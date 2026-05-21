import Link from 'next/link';

export default function PagoErrorPage({
  params,
  searchParams,
}: {
  params: { restaurantSlug: string };
  searchParams: { orderId?: string };
}) {
  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-surface border border-line rounded-lg p-8 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-danger-soft flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-danger-text"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-ink">No pudimos cobrar tu pedido</h1>
        <p className="mt-2 text-sm text-ink-400">
          Mercado Pago rechazó la transacción. Tu carrito sigue guardado; intenta de nuevo con otra
          tarjeta.
        </p>
        <div className="mt-6">
          <Link
            href={`/${params.restaurantSlug}/checkout`}
            className="inline-flex h-10 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover items-center"
          >
            Intentar de nuevo
          </Link>
        </div>
      </div>
    </main>
  );
}
