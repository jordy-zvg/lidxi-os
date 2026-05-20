'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { revalidatePath } from 'next/cache';

export async function setPaymentMode(formData: FormData): Promise<void> {
  const requested = formData.get('mode');
  if (requested !== 'test' && requested !== 'production') return;

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  await supabase
    .from('tenants')
    .update({ payment_mode: requested, updated_at: new Date().toISOString() })
    .eq('id', tenantId);

  revalidatePath('/admin/integraciones/pagos');
}
