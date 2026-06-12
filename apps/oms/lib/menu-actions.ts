'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import type { MenuItemOptionGroup } from '@kobi/shared';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type MenuItemSource = 'manual' | 'rappi' | 'eats' | 'didi' | 'foto';
export type MenuItemStatus = 'draft' | 'active' | 'archived';

export interface MenuItemRow {
  id: string;
  tenant_id: string;
  restaurant_id: string;
  category: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  photo_key: string | null;
  base_price: number;
  active: boolean;
  source: MenuItemSource;
  status: MenuItemStatus;
  options: MenuItemOptionGroup[];
  import_id: string | null;
  review_reasons: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryGroup {
  name: string;
  count: number;
}

async function getRestaurantIdForTenant(tenantId: string): Promise<string> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('tenant_id', tenantId)
    .single();
  if (error || !data) throw new Error('Restaurante no encontrado para este tenant');
  return (data as { id: string }).id;
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

export interface LoadMenuEditorOpts {
  /** Scopea el editor a los BORRADORES de un import (pantalla de staging). */
  importId?: string;
}

export const loadMenuEditorData = async (
  opts?: LoadMenuEditorOpts,
): Promise<ActionResult<{ categories: CategoryGroup[]; items: MenuItemRow[] }>> => {
  try {
    const { tenantId } = await requireTenant();
    const supabase = createSupabaseServerClient();
    let query = supabase.from('menu_items').select('*').eq('tenant_id', tenantId);
    if (opts?.importId) {
      // Scope hermético del staging: solo drafts de ESTE import. El menú vivo
      // y los drafts de otros imports no entran a la pantalla.
      query = query.eq('import_id', opts.importId).eq('status', 'draft');
    }
    const { data, error } = await query.order('category').order('name');

    if (error) return { ok: false, error: error.message };

    const rows = (data ?? []) as MenuItemRow[];
    const categoryMap = new Map<string, number>();
    for (const row of rows) {
      categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + 1);
    }
    const categories: CategoryGroup[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return { ok: true, data: { categories, items: rows } };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
};

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateMenuItemInput {
  category: string;
  name: string;
  description?: string;
  base_price: number;
  photo_url?: string;
  photo_key?: string;
  active?: boolean;
  options?: MenuItemOptionGroup[];
}

export interface DraftScope {
  /** El item nace como borrador colgado de este import (staging). */
  importId: string;
  source?: MenuItemSource;
}

export const createMenuItem = async (
  input: CreateMenuItemInput,
  draft?: DraftScope,
): Promise<ActionResult<MenuItemRow>> => {
  try {
    const { tenantId } = await requireTenant();
    const restaurantId = await getRestaurantIdForTenant(tenantId);
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        tenant_id: tenantId,
        restaurant_id: restaurantId,
        category: input.category,
        name: input.name,
        description: input.description ?? null,
        base_price: input.base_price,
        photo_url: input.photo_url ?? null,
        photo_key: input.photo_key ?? null,
        active: input.active ?? true,
        options: input.options ?? [],
        status: draft ? 'draft' : 'active',
        source: draft?.source ?? 'manual',
        import_id: draft?.importId ?? null,
      })
      .select('*')
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: data as MenuItemRow };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
};

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdateMenuItemInput {
  category?: string;
  name?: string;
  description?: string | null;
  base_price?: number;
  photo_url?: string | null;
  photo_key?: string | null;
  active?: boolean;
  options?: MenuItemOptionGroup[];
}

export const updateMenuItem = async (
  id: string,
  input: UpdateMenuItemInput,
): Promise<ActionResult<MenuItemRow>> => {
  try {
    const { tenantId } = await requireTenant();
    const supabase = createSupabaseServerClient();
    // Guardar desde el editor = un humano revisó → se limpia la marca de
    // revisión obligatoria que dejó el importador.
    const { data, error } = await supabase
      .from('menu_items')
      .update({ ...input, review_reasons: null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: data as MenuItemRow };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
};

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export const deleteMenuItem = async (id: string): Promise<ActionResult<null>> => {
  try {
    const { tenantId } = await requireTenant();
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
};
