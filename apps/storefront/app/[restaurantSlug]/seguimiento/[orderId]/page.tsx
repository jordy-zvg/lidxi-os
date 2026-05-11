import { PageStub } from '@lidxi/ui';

export default function TrackingPage({
  params,
}: {
  params: { restaurantSlug: string; orderId: string };
}) {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-4 font-mono text-sm text-ink-400">Orden #{params.orderId}</h1>
      <PageStub
        title="Seguimiento en vivo"
        description="Subscribe vía Supabase Realtime y muestra timeline del pedido + tracking del repartidor."
      />
    </main>
  );
}
