import { PagoMockClient } from '@/components/checkout/PagoMockClient';
import { loadTenantBySlug } from '@/lib/storefront-actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PagoMockPage({
  params,
  searchParams,
}: {
  params: { restaurantSlug: string };
  searchParams: { preferenceId?: string; orderId?: string };
}) {
  const tenant = await loadTenantBySlug(params.restaurantSlug);
  if (!tenant) notFound();
  const preferenceId = searchParams.preferenceId;
  const orderId = searchParams.orderId;
  if (!preferenceId || !orderId) notFound();
  return <PagoMockClient tenant={tenant} preferenceId={preferenceId} orderId={orderId} />;
}
