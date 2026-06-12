export const metadata = { title: 'Staging de menú' };

import { ImportProcessingScreen } from '@/components/menu-import/ImportProcessingScreen';
import { MenuImportReviewScreen } from '@/components/menu-import/MenuImportReviewScreen';
import { getMenuImport } from '@/lib/menu-import-actions';
import { redirect } from 'next/navigation';

export default async function MenuImportPage({ params }: { params: { id: string } }) {
  const result = await getMenuImport(params.id);
  if (!result.ok) redirect('/admin/menu');
  const { row } = result.data;
  // Imports cerrados no tienen staging que mostrar.
  if (row.status === 'confirmed' || row.status === 'discarded') redirect('/admin/menu');
  // Fotos en vuelo o fallidas: poller con reintento/descarte.
  if (row.status === 'processing' || row.status === 'error') {
    return (
      <ImportProcessingScreen
        importId={row.id}
        initialStatus={row.status}
        initialError={row.error}
        updatedAt={row.updated_at}
      />
    );
  }
  return <MenuImportReviewScreen importRow={{ id: row.id, source: row.source }} />;
}
