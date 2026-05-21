export const metadata = { title: 'Sitio propio' };

import { SitioPropioScreen } from '@/components/sitio-propio/SitioPropioScreen';
import { type DeliveryProviderRow, loadDeliveryProviders } from '@/lib/delivery-provider-actions';
import { DELIVERY_PROVIDER_SCHEMAS } from '@/lib/delivery-provider-schemas';

export const dynamic = 'force-dynamic';

export default async function SitioPropioAdminPage() {
  const providers: DeliveryProviderRow[] = await loadDeliveryProviders();
  return <SitioPropioScreen providers={providers} providerSchemas={DELIVERY_PROVIDER_SCHEMAS} />;
}
