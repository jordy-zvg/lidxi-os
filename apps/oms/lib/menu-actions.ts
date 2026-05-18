'use server';

import { createSupabaseServiceClient } from '@kobi/db';
import { getBranchId } from './station';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface MenuItemRow {
  id: string;
  restaurant_id: string;
  category: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  photo_key: string | null;
  base_price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryGroup {
  name: string;
  count: number;
}

async function getRestaurantId(): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const branchId = getBranchId();
  const { data, error } = await supabase
    .from('branches')
    .select('restaurant_id')
    .eq('id', branchId)
    .single();
  if (error || !data) throw new Error('Branch no encontrado');
  return (data as { restaurant_id: string }).restaurant_id;
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

export const loadMenuEditorData = async (): Promise<
  ActionResult<{ categories: CategoryGroup[]; items: MenuItemRow[] }>
> => {
  try {
    const restaurantId = await getRestaurantId();
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category')
      .order('name');

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
}

export const createMenuItem = async (
  input: CreateMenuItemInput,
): Promise<ActionResult<MenuItemRow>> => {
  try {
    const restaurantId = await getRestaurantId();
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        restaurant_id: restaurantId,
        category: input.category,
        name: input.name,
        description: input.description ?? null,
        base_price: input.base_price,
        photo_url: input.photo_url ?? null,
        photo_key: input.photo_key ?? null,
        active: input.active ?? true,
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
}

export const updateMenuItem = async (
  id: string,
  input: UpdateMenuItemInput,
): Promise<ActionResult<MenuItemRow>> => {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('menu_items')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
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
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
};
