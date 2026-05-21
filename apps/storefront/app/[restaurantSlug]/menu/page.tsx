import { MenuClient } from '@/components/menu/MenuClient';
import { loadTenantBySlug, loadTenantMenu } from '@/lib/storefront-actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RestaurantMenuPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  const tenant = await loadTenantBySlug(params.restaurantSlug);
  if (!tenant) notFound();

  const menuRes = await loadTenantMenu(tenant.id);
  if (!menuRes.ok) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-4 text-2xl font-semibold capitalize">{tenant.name}</h1>
        <p className="text-danger-text">No se pudo cargar el menú: {menuRes.error}</p>
      </main>
    );
  }

  return <MenuClient tenant={tenant} items={menuRes.data} />;
}
