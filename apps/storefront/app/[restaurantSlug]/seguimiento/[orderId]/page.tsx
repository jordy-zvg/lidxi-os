import { OrderTrackingClient } from '@/components/checkout/OrderTrackingClient';
import { loadTenantBySlug } from '@/lib/storefront-actions';
import { createSupabaseServiceClient } from '@kobi/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TrackingPage({
  params,
}: {
  params: { restaurantSlug: string; orderId: string };
}) {
  const tenant = await loadTenantBySlug(params.restaurantSlug);
  if (!tenant) notFound();

  const supabase = createSupabaseServiceClient();
  const { data: orderRow } = await supabase
    .from('orders')
    .select('id, status, customer_name, customer_address, total, payment_method, created_at')
    .eq('id', params.orderId)
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  if (!orderRow) notFound();
  const order = orderRow as {
    id: string;
    status: string;
    customer_name: string | null;
    customer_address: string | null;
    total: number;
    payment_method: string | null;
    created_at: string;
  };

  return (
    <OrderTrackingClient
      tenant={tenant}
      orderId={order.id}
      initialStatus={order.status}
      initialPaid={order.payment_method !== null}
      customerName={order.customer_name ?? 'Cliente'}
      totalCents={order.total}
    />
  );
}
