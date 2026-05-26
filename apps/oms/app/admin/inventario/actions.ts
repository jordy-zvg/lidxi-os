'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { revalidatePath } from 'next/cache';

export interface InventoryItem {
  id: string;
  branch_id: string;
  sku: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
}

export type ListInventoryResult =
  | { ok: true; items: InventoryItem[] }
  | { ok: false; error: string };

export async function listInventoryItems(): Promise<ListInventoryResult> {
  try {
    await requireTenant();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.from('inventory_items').select('*').order('name');

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, items: (data as InventoryItem[]) || [] };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export interface AddInventoryInput {
  sku: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  cost_per_unit: number;
}

export type AddInventoryResult = { ok: true; id: string } | { ok: false; error: string };

export async function addInventoryItem(input: AddInventoryInput): Promise<AddInventoryResult> {
  const sku = input.sku?.trim();
  if (!sku) return { ok: false, error: 'SKU es requerido.' };

  const name = input.name?.trim();
  if (!name || name.length < 2) return { ok: false, error: 'Nombre es requerido.' };

  if (!input.unit) return { ok: false, error: 'Unidad es requerida.' };

  if (input.current_stock < 0 || input.min_stock < 0) {
    return { ok: false, error: 'Stock y mínimo no pueden ser negativos.' };
  }

  if (input.cost_per_unit < 0) {
    return { ok: false, error: 'Costo no puede ser negativo.' };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        branch_id: '00000000-0000-0000-0000-00000000b001', // Legacy branch
        sku,
        name,
        unit: input.unit,
        current_stock: input.current_stock,
        min_stock: input.min_stock,
        cost_per_unit: input.cost_per_unit,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Ese SKU ya existe.' };
      return { ok: false, error: `Error: ${error.message}` };
    }

    revalidatePath('/admin/inventario');
    return { ok: true, id: (data as { id: string }).id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export interface UpdateInventoryInput {
  sku?: string;
  name?: string;
  unit?: string;
  current_stock?: number;
  min_stock?: number;
  cost_per_unit?: number;
}

export type UpdateInventoryResult = { ok: true } | { ok: false; error: string };

export async function updateInventoryItem(
  id: string,
  input: UpdateInventoryInput,
): Promise<UpdateInventoryResult> {
  if (!id) return { ok: false, error: 'ID inválido.' };

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.sku !== undefined) {
    const sku = input.sku.trim();
    if (!sku) return { ok: false, error: 'SKU es requerido.' };
    patch.sku = sku;
  }

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name || name.length < 2) return { ok: false, error: 'Nombre es requerido.' };
    patch.name = name;
  }

  if (input.unit !== undefined) patch.unit = input.unit;
  if (input.current_stock !== undefined) patch.current_stock = input.current_stock;
  if (input.min_stock !== undefined) patch.min_stock = input.min_stock;
  if (input.cost_per_unit !== undefined) patch.cost_per_unit = input.cost_per_unit;

  try {
    const supabase = createSupabaseServerClient();

    const { error } = await supabase.from('inventory_items').update(patch).eq('id', id);

    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Ese SKU ya existe.' };
      return { ok: false, error: `Error: ${error.message}` };
    }

    revalidatePath('/admin/inventario');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export type DeleteInventoryResult = { ok: true } | { ok: false; error: string };

export async function deleteInventoryItem(id: string): Promise<DeleteInventoryResult> {
  if (!id) return { ok: false, error: 'ID inválido.' };

  try {
    const supabase = createSupabaseServerClient();

    const { error } = await supabase.from('inventory_items').delete().eq('id', id);

    if (error) return { ok: false, error: `Error: ${error.message}` };

    revalidatePath('/admin/inventario');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
