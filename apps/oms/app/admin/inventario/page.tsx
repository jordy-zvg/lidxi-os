import { InventarioScreen } from '@/components/admin/inventario/InventarioScreen';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { listInventoryItems } from './actions';

export const metadata = {
  title: 'Inventario',
};

export default async function InventarioPage() {
  await requireTenant();
  const result = await listInventoryItems();

  const items = result.ok ? result.items : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Inventario</h1>
        <p className="mt-1 text-sm text-ink-400">Gestiona artículos y stock</p>
      </div>

      <InventarioScreen items={items} />
    </div>
  );
}
