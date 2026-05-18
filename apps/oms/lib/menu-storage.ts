'use server';

import { createSupabaseServiceClient } from '@kobi/db';

const BUCKET = 'menu-items';
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadResult {
  url: string;
  key: string;
}

export const uploadMenuImage = async (
  file: File,
  restaurantId: string,
  itemId: string,
): Promise<UploadResult> => {
  if (!ALLOWED.has(file.type))
    throw new Error('Tipo de imagen no permitido. Usa JPEG, PNG o WebP.');
  if (file.size > MAX_BYTES) throw new Error('La imagen no puede superar 4 MB.');

  const ext = file.type.split('/')[1] ?? 'jpg';
  const key = `${restaurantId}/${itemId}.${ext}`;
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
  const supabase = createSupabaseServiceClient();
  await supabase.storage.from(BUCKET).remove([key]);
};
