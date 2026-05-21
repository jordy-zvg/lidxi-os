import { CheckoutClient } from '@/components/checkout/CheckoutClient';
import { loadTenantBySlug } from '@/lib/storefront-actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  const tenant = await loadTenantBySlug(params.restaurantSlug);
  if (!tenant) notFound();
  return <CheckoutClient tenant={tenant} />;
}
