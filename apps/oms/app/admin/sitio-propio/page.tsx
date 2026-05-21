export const metadata = { title: 'Sitio propio' };

import { SitioPropioScreen } from '@/components/sitio-propio/SitioPropioScreen';
import { loadDirectOrders, loadSitioPropioMetrics } from '@/lib/delivery-actions';
import { type DeliveryProviderRow, loadDeliveryProviders } from '@/lib/delivery-provider-actions';
import { DELIVERY_PROVIDER_SCHEMAS } from '@/lib/delivery-provider-schemas';

export const dynamic = 'force-dynamic';

export default async function SitioPropioAdminPage() {
  const [providers, ordersRes, metricsRes]: [
    DeliveryProviderRow[],
    Awaited<ReturnType<typeof loadDirectOrders>>,
    Awaited<ReturnType<typeof loadSitioPropioMetrics>>,
  ] = await Promise.all([loadDeliveryProviders(), loadDirectOrders(), loadSitioPropioMetrics()]);
  return (
    <SitioPropioScreen
      providers={providers}
      providerSchemas={DELIVERY_PROVIDER_SCHEMAS}
      orders={ordersRes.ok ? ordersRes.data : []}
      metrics={metricsRes.ok ? metricsRes.data : null}
      showCredentials
    />
  );
}
