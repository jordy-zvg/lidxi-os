export const metadata = { title: 'Importar menú' };

import { ImportStartScreen } from '@/components/menu-import/ImportStartScreen';
import { canUseFeature } from '@/lib/constants/entitlements';
import { requireTenant } from '@/lib/supabase/tenant-guard';

export default async function MenuImportStartPage() {
  const ctx = await requireTenant();
  // Gating de UI (cosmético): la frontera real es requireFeature en las actions.
  return <ImportStartScreen photosEnabled={canUseFeature(ctx.plan, 'menu.import_photos')} />;
}
