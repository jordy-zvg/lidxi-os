export const metadata = { title: 'Detalle del pedido' };

import { OrderDetailView } from '@/components/order-detail/OrderDetailView';
import { getEmployeeContext } from '@/lib/operations/employee-context';
import { createSupabaseServiceClient } from '@kobi/db';

interface Props {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: Props) {
  // El slug público es restaurants.slug del tenant activo (NO tenants.slug, que
  // es interno/autogenerado). Lo resolvemos server-side para construir el link
  // de seguimiento que el operador comparte con el cliente.
  const ctx = await getEmployeeContext();
  let restaurantSlug: string | null = null;
  if (ctx) {
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase
      .from('restaurants')
      .select('slug')
      .eq('tenant_id', ctx.tenantId)
      .limit(1)
      .maybeSingle();
    restaurantSlug = (data as { slug: string | null } | null)?.slug ?? null;
  }

  return (
    <OrderDetailView
      orderId={params.id}
      restaurantSlug={restaurantSlug}
      storefrontUrl={process.env.NEXT_PUBLIC_STOREFRONT_URL ?? null}
    />
  );
}
