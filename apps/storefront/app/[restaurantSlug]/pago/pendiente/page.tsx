import Link from 'next/link';

export default function PagoPendientePage({
  params,
  searchParams,
}: {
  params: { restaurantSlug: string };
  searchParams: { orderId?: string };
}) {
  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-surface border border-line rounded-lg p-8 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-warn-soft flex items-center justify-center">
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
            className="text-warn-text"
            aria-hidden="true"
          >
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-ink">Pago en revisión</h1>
        <p className="mt-2 text-sm text-ink-400">
          Mercado Pago está procesando tu transacción. Te avisaremos por email cuando se confirme.
        </p>
        <div className="mt-6">
          <Link
            href={`/${params.restaurantSlug}/menu`}
            className="inline-flex h-10 px-4 rounded-md border border-line-2 text-ink-200 text-sm font-medium hover:bg-surface-2 items-center"
          >
            Volver al menú
          </Link>
        </div>
      </div>
    </main>
  );
}
