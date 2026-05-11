import Link from 'next/link';

export default function RestaurantLandingPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold capitalize">{params.restaurantSlug}</h1>
      <p className="mt-2 text-ink-300">
        Landing del restaurante. Pendiente de diseño definitivo — el contenido lo cargaremos desde
        Supabase usando el slug y las preferencias guardadas en
        <code className="mx-1 font-mono">restaurants</code>.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href={`/${params.restaurantSlug}/menu`}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Ver menú
        </Link>
      </div>
    </main>
  );
}
