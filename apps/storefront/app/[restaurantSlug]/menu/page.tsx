import { PageStub } from '@lidxi/ui';

export default function RestaurantMenuPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold capitalize">{params.restaurantSlug} · Menú</h1>
      <PageStub
        title="Catálogo público"
        description="Renderiza desde Supabase con ISR. Cada item con precio del canal 'direct'."
      />
    </main>
  );
}
