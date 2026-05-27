'use server';

import { requireTenant } from '@/lib/supabase/tenant-guard';
import { createSupabaseServiceClient } from '@kobi/db';

const BUCKET = 'menu-items';
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Sube una foto de item de menú a Storage.
 *
 * Path canónico: `{tenant_id}/menu/{item_id}.{ext}`.
 * El tenant_id NUNCA viene del cliente — se resuelve server-side vía
 * requireTenant() para evitar que un caller manipule el path y escriba
 * bajo el folder de otro tenant. Las policies de storage validan esto
 * a nivel de fila (defense in depth).
 *
 * Service client se usa porque storage.objects.insert con anon/auth requiere
 * que las policies pasen — más simple: server action ya verifica tenant via
 * requireTenant(), confiamos en eso y bypassamos RLS para el upload del blob.
 * Las lecturas posteriores son públicas (bucket público) o vía signedUrl.
 */
export const uploadMenuImage = async (
  formData: FormData,
  itemId: string,
): Promise<UploadResult> => {
  const file = formData.get('file');
  if (!(file instanceof File)) throw new Error('No se recibió archivo válido.');
  if (!ALLOWED.has(file.type))
    throw new Error('Tipo de imagen no permitido. Usa JPEG, PNG o WebP.');
  if (file.size > MAX_BYTES) throw new Error('La imagen no puede superar 4 MB.');

  const { tenantId } = await requireTenant();
  const ext = file.type.split('/')[1] ?? 'jpg';
  const key = `${tenantId}/menu/${itemId}.${ext}`;
  const supabase = createSupabaseServiceClient();

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, bytes, { contentType: file.type, upsert: true });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { url: data.publicUrl, key };
};

export const deleteMenuImage = async (key: string): Promise<void> => {
  // El key tiene formato {tenant_id}/menu/{item_id}.{ext}. Verificamos que
  // el tenant del key coincide con el tenant del caller antes de borrar.
  const { tenantId } = await requireTenant();
  if (!key.startsWith(`${tenantId}/`)) {
    throw new Error('No autorizado a borrar este recurso.');
  }
  const supabase = createSupabaseServiceClient();
  await supabase.storage.from(BUCKET).remove([key]);
};
