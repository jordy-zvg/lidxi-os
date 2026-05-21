import Link from 'next/link';

export default function PagoExitoPage({
  params,
  searchParams,
}: {
  params: { restaurantSlug: string };
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-surface border border-line rounded-lg p-8 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-ok-soft flex items-center justify-center">
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
            className="text-ok-text"
            aria-hidden="true"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-ink">¡Pago confirmado!</h1>
        <p className="mt-2 text-sm text-ink-400">
          Recibimos tu pedido. El restaurante empezará a prepararlo en cuanto lo confirme.
        </p>
        {orderId && (
          <div className="mt-5 bg-canvas border border-line-2 rounded-md p-3">
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Número de pedido</p>
            <p className="font-mono text-xs text-ink mt-1 break-all">{orderId}</p>
          </div>
        )}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {orderId && (
            <Link
              href={`/${params.restaurantSlug}/seguimiento/${orderId}`}
              className="h-10 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover flex items-center justify-center"
            >
              Ver seguimiento
            </Link>
          )}
          <Link
            href={`/${params.restaurantSlug}/menu`}
            className="h-10 rounded-md border border-line-2 text-ink-200 text-sm font-medium hover:bg-surface-2 flex items-center justify-center"
          >
            Volver al menú
          </Link>
        </div>
      </div>
    </main>
  );
}
