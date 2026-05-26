'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface MenuItemWithPrices {
  id: string;
  name: string;
  prices: {
    channel: string;
    price: number;
  }[];
}

export type ListMenuItemsResult =
  | { ok: true; items: MenuItemWithPrices[] }
  | { ok: false; error: string };

export async function listMenuItemsWithPrices(): Promise<ListMenuItemsResult> {
  try {
    const supabase = createSupabaseServerClient();

    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('id, name')
      .order('name');

    if (itemsError) {
      return { ok: false, error: itemsError.message };
    }

    const itemIds = ((items as { id: string; name: string }[]) || []).map((i) => i.id);

    if (itemIds.length === 0) {
      return { ok: true, items: [] };
    }

    const { data: prices, error: pricesError } = await supabase
      .from('menu_channel_prices')
      .select('menu_item_id, channel, price')
      .in('menu_item_id', itemIds);

    if (pricesError) {
      return { ok: false, error: pricesError.message };
    }

    const priceMap = new Map<string, Array<{ channel: string; price: number }>>();
    for (const p of (prices as Array<{ menu_item_id: string; channel: string; price: number }>) ||
      []) {
      if (!priceMap.has(p.menu_item_id)) {
        priceMap.set(p.menu_item_id, []);
      }
      priceMap.get(p.menu_item_id)?.push({ channel: p.channel, price: p.price });
    }

    const result = (items as { id: string; name: string }[]).map((item) => ({
      id: item.id,
      name: item.name,
      prices: priceMap.get(item.id) || [],
    }));

    return { ok: true, items: result };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export interface UpdatePriceInput {
  menuItemId: string;
  channel: string;
  price: number;
}

export type UpdatePriceResult = { ok: true } | { ok: false; error: string };

export async function updatePrice(input: UpdatePriceInput): Promise<UpdatePriceResult> {
  if (!input.menuItemId || !input.channel || input.price < 0) {
    return { ok: false, error: 'Datos inválidos.' };
  }

  try {
    const supabase = createSupabaseServerClient();

    // Buscar si existe
    const { data: existing } = await supabase
      .from('menu_channel_prices')
      .select('menu_item_id')
      .eq('menu_item_id', input.menuItemId)
      .eq('channel', input.channel)
      .maybeSingle();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('menu_channel_prices')
        .update({ price: input.price })
        .eq('menu_item_id', input.menuItemId)
        .eq('channel', input.channel);

      if (error) return { ok: false, error: error.message };
    } else {
      // Insert
      const { error } = await supabase.from('menu_channel_prices').insert({
        menu_item_id: input.menuItemId,
        channel: input.channel,
        price: input.price,
      });

      if (error) return { ok: false, error: error.message };
    }

    revalidatePath('/admin/tarifas');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export type DeletePriceResult = { ok: true } | { ok: false; error: string };

export async function deletePrice(menuItemId: string, channel: string): Promise<DeletePriceResult> {
  if (!menuItemId || !channel) {
    return { ok: false, error: 'Datos inválidos.' };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { error } = await supabase
      .from('menu_channel_prices')
      .delete()
      .eq('menu_item_id', menuItemId)
      .eq('channel', channel);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/tarifas');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
