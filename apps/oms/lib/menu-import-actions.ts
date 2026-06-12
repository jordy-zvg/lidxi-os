'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireFeature, requireTenant } from '@/lib/supabase/tenant-guard';
import { createSupabaseServiceClient } from '@kobi/db';
import type { ActionResult, MenuItemSource } from './menu-actions';
import {
  type PageExtraction,
  type SupportedImageMediaType,
  extractMenuPage,
  mergePages,
} from './menu-vision';

/**
 * Corridas de importación / sesiones de staging (tabla menu_imports).
 *
 * INVARIANTE DE PRECIOS (no negociable): nadie consume menu_channel_prices en
 * runtime, así que base_price ES el precio del canal directo. El importador de
 * fotos escribe base_price (un menú impreso tiene un precio). Los importadores
 * de marketplace (v1.5) escribirán SOLO su columna en menu_channel_prices y
 * NUNCA base_price — un precio inflado de marketplace en base_price haría que
 * el storefront cobre de más al cliente directo. Ver docs/specs/menu-config-v1.md.
 *
 * SCOPE HERMÉTICO: toda escritura masiva sobre borradores lleva la triple
 * llave tenant_id + import_id + status='draft'. Los items ya confirmados
 * conservan su import_id pero pasan a status='active' → quedan inalcanzables
 * para confirm/discard posteriores.
 */

export type MenuImportStatus = 'processing' | 'ready' | 'error' | 'confirmed' | 'discarded';

export interface MenuImportRow {
  id: string;
  tenant_id: string;
  source: MenuItemSource;
  status: MenuImportStatus;
  input: { photo_keys?: string[] };
  summary: Record<string, number>;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuImportDetail {
  row: MenuImportRow;
  draftCount: number;
  pendingReviewCount: number;
}

interface DraftReviewFields {
  id: string;
  base_price: number;
  source: string;
  review_reasons: string[] | null;
}

/**
 * Pendiente de revisión obligatoria: marcado por el importador
 * (review_reasons) o foto sin precio detectado (base_price 0). La red de
 * seguridad del staging — confirmar se bloquea hasta resolverlos.
 */
const isPendingReview = (d: DraftReviewFields): boolean =>
  (d.review_reasons?.length ?? 0) > 0 || (d.source === 'foto' && d.base_price === 0);

const loadDrafts = async (
  supabase: ReturnType<typeof createSupabaseServerClient>,
  tenantId: string,
  importId: string,
) =>
  supabase
    .from('menu_items')
    .select('id, base_price, source, review_reasons, photo_key')
    .eq('tenant_id', tenantId)
    .eq('import_id', importId)
    .eq('status', 'draft');

// ---------------------------------------------------------------------------
// Crear sesión manual (staging vacío) — el método manual del flujo unificado
// ---------------------------------------------------------------------------

export const createManualImport = async (): Promise<ActionResult<{ importId: string }>> => {
  try {
    const { tenantId } = await requireFeature('menu.editor');
    const supabase = createSupabaseServerClient();
    // Manual no procesa nada: nace 'ready' directo al staging.
    const { data, error } = await supabase
      .from('menu_imports')
      .insert({ tenant_id: tenantId, source: 'manual', status: 'ready' })
      .select('id')
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { importId: (data as { id: string }).id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

// ---------------------------------------------------------------------------
// Leer estado del import (lo pollea la UI en imports con procesamiento async)
// ---------------------------------------------------------------------------

export const getMenuImport = async (importId: string): Promise<ActionResult<MenuImportDetail>> => {
  try {
    const { tenantId } = await requireTenant();
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('menu_imports')
      .select('*')
      .eq('id', importId)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: 'Import no encontrado' };

    const { data: drafts, error: draftsError } = await loadDrafts(supabase, tenantId, importId);
    if (draftsError) return { ok: false, error: draftsError.message };
    const rows = (drafts ?? []) as DraftReviewFields[];

    return {
      ok: true,
      data: {
        row: data as MenuImportRow,
        draftCount: rows.length,
        pendingReviewCount: rows.filter(isPendingReview).length,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

// ---------------------------------------------------------------------------
// Confirmar: promueve los borradores del import a menú activo
// ---------------------------------------------------------------------------

export const confirmMenuImport = async (
  importId: string,
): Promise<ActionResult<{ promoted: number }>> => {
  try {
    const { tenantId } = await requireFeature('menu.editor');
    const supabase = createSupabaseServerClient();

    const { data: imp, error: impError } = await supabase
      .from('menu_imports')
      .select('id, status')
      .eq('id', importId)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (impError) return { ok: false, error: impError.message };
    if (!imp) return { ok: false, error: 'Import no encontrado' };
    if ((imp as { status: MenuImportStatus }).status !== 'ready') {
      return { ok: false, error: 'Este import no está listo para confirmar.' };
    }

    const { data: drafts, error: draftsError } = await loadDrafts(supabase, tenantId, importId);
    if (draftsError) return { ok: false, error: draftsError.message };
    const rows = (drafts ?? []) as DraftReviewFields[];
    if (rows.length === 0) {
      return { ok: false, error: 'No hay borradores que confirmar. Agrega productos o descarta.' };
    }
    const pending = rows.filter(isPendingReview);
    if (pending.length > 0) {
      return {
        ok: false,
        error: `Quedan ${pending.length} producto(s) por revisar (sin precio o marcados). Edítalos o elimínalos antes de confirmar.`,
      };
    }

    // Promoción hermética: triple llave. El menú vivo y otros imports son
    // inalcanzables para este UPDATE.
    const { data: promoted, error: updateError } = await supabase
      .from('menu_items')
      .update({ status: 'active', review_reasons: null, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('import_id', importId)
      .eq('status', 'draft')
      .select('id');
    if (updateError) return { ok: false, error: updateError.message };

    const count = promoted?.length ?? 0;
    await supabase
      .from('menu_imports')
      .update({ status: 'confirmed', summary: { items: count } })
      .eq('id', importId)
      .eq('tenant_id', tenantId);

    return { ok: true, data: { promoted: count } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

// ---------------------------------------------------------------------------
// Descartar: ELIMINA borradores + storage asociado (decisión #5, alcance
// completo). Nada de fotos colgando — primero storage, luego filas: si el
// storage falla se aborta con las filas intactas y el descarte es reintentable.
// ---------------------------------------------------------------------------

export const discardMenuImport = async (
  importId: string,
): Promise<ActionResult<{ deleted: number }>> => {
  try {
    const { tenantId } = await requireFeature('menu.editor');
    const supabase = createSupabaseServerClient();

    const { data: imp, error: impError } = await supabase
      .from('menu_imports')
      .select('id, status, input, updated_at')
      .eq('id', importId)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (impError) return { ok: false, error: impError.message };
    if (!imp) return { ok: false, error: 'Import no encontrado' };
    const status = (imp as { status: MenuImportStatus }).status;
    if (status === 'confirmed' || status === 'discarded') {
      return { ok: false, error: 'Este import ya fue cerrado.' };
    }
    // processing reciente = corriendo de verdad; colgado (stale) sí se puede
    // descartar para no dejar al usuario atrapado.
    if (
      status === 'processing' &&
      Date.now() - new Date((imp as { updated_at: string }).updated_at).getTime() <
        STALE_PROCESSING_MS
    ) {
      return { ok: false, error: 'El import sigue procesando; espera a que termine.' };
    }

    const { data: drafts, error: draftsError } = await loadDrafts(supabase, tenantId, importId);
    if (draftsError) return { ok: false, error: draftsError.message };
    const rows = (drafts ?? []) as Array<DraftReviewFields & { photo_key: string | null }>;

    const service = createSupabaseServiceClient();

    // 1) Fotos de platillo de los borradores (bucket menu-items). El prefijo
    //    de tenant es la autorización: nunca borrar keys fuera del tenant.
    const dishKeys = rows
      .map((d) => d.photo_key)
      .filter((k): k is string => !!k && k.startsWith(`${tenantId}/`));
    if (dishKeys.length > 0) {
      const { error: dishError } = await service.storage.from('menu-items').remove(dishKeys);
      if (dishError)
        return { ok: false, error: `No se pudieron borrar fotos: ${dishError.message}` };
    }

    // 2) Fotos de input del import (bucket menu-imports; vacío en manual).
    const inputKeys = (
      (imp as { input: { photo_keys?: string[] } }).input?.photo_keys ?? []
    ).filter((k) => k.startsWith(`${tenantId}/`));
    if (inputKeys.length > 0) {
      const { error: inputError } = await service.storage.from('menu-imports').remove(inputKeys);
      if (inputError)
        return { ok: false, error: `No se pudieron borrar fotos de input: ${inputError.message}` };
    }

    // 3) Filas — borrado hermético con triple llave.
    const { data: deleted, error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('import_id', importId)
      .eq('status', 'draft')
      .select('id');
    if (deleteError) return { ok: false, error: deleteError.message };

    await supabase
      .from('menu_imports')
      .update({ status: 'discarded' })
      .eq('id', importId)
      .eq('tenant_id', tenantId);

    return { ok: true, data: { deleted: deleted?.length ?? 0 } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

// ===========================================================================
// Método FOTOS (visión) — gateado por 'menu.import_photos'
// ===========================================================================

const PHOTO_ALLOWED_TYPES = new Set<string>(['image/jpeg', 'image/png', 'image/webp']);
const PHOTO_MAX_BYTES = 8 * 1024 * 1024; // límite del bucket menu-imports

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MEDIA_BY_EXT: Record<string, SupportedImageMediaType> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** Crea la corrida de fotos. Las fotos se suben después, una por una. */
export const createPhotoImport = async (): Promise<ActionResult<{ importId: string }>> => {
  try {
    const { tenantId } = await requireFeature('menu.import_photos');
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('menu_imports')
      .insert({ tenant_id: tenantId, source: 'foto', status: 'processing', input: {} })
      .select('id')
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { importId: (data as { id: string }).id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/**
 * Sube UNA foto del menú impreso al bucket privado menu-imports. Una por
 * llamada (límite de body de server actions) y SECUENCIAL desde el cliente:
 * el append a input.photo_keys es read-modify-write sin lock.
 */
export const uploadImportPhoto = async (
  importId: string,
  pageIndex: number,
  formData: FormData,
): Promise<ActionResult<{ key: string }>> => {
  try {
    const { tenantId } = await requireFeature('menu.import_photos');
    const supabase = createSupabaseServerClient();

    const { data: imp, error: impError } = await supabase
      .from('menu_imports')
      .select('id, source, status, input')
      .eq('id', importId)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (impError) return { ok: false, error: impError.message };
    if (!imp) return { ok: false, error: 'Import no encontrado' };
    const row = imp as {
      source: string;
      status: MenuImportStatus;
      input: { photo_keys?: string[] };
    };
    if (row.source !== 'foto' || row.status !== 'processing') {
      return { ok: false, error: 'Este import no acepta fotos.' };
    }

    // instanceof Blob (no File): File no es global en Node 18; Blob sí, y el
    // File de undici que arma Next para FormData es subclase de Blob.
    const file = formData.get('file');
    if (!(file instanceof Blob)) return { ok: false, error: 'Archivo inválido.' };
    if (!PHOTO_ALLOWED_TYPES.has(file.type)) {
      return { ok: false, error: 'Tipo no permitido. Usa JPEG, PNG o WebP.' };
    }
    if (file.size > PHOTO_MAX_BYTES) {
      return { ok: false, error: 'La foto supera 8 MB.' };
    }

    const ext = EXT_BY_TYPE[file.type];
    const key = `${tenantId}/imports/${importId}/${pageIndex}.${ext}`;
    const service = createSupabaseServiceClient();
    const { error: uploadError } = await service.storage
      .from('menu-imports')
      .upload(key, file, { contentType: file.type, upsert: true });
    if (uploadError) return { ok: false, error: uploadError.message };

    const keys = [...(row.input.photo_keys ?? []).filter((k) => k !== key), key];
    const { error: updateError } = await supabase
      .from('menu_imports')
      .update({ input: { photo_keys: keys } })
      .eq('id', importId)
      .eq('tenant_id', tenantId);
    if (updateError) return { ok: false, error: updateError.message };

    return { ok: true, data: { key } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/**
 * Núcleo del procesamiento. Garantía anti-colgado: TODO camino de salida
 * escribe ready o error en la fila (el catch externo incluye un best-effort
 * a error). El único modo de quedar en processing es un crash duro del
 * proceso — para eso existe retryMenuImport + detección de stale en la UI.
 */
async function runPhotoProcessing(
  tenantId: string,
  importId: string,
  photoKeys: string[],
): Promise<ActionResult<{ items: number; pagesFailed: number }>> {
  const supabase = createSupabaseServerClient();
  const service = createSupabaseServiceClient();

  const failImport = async (message: string) => {
    await supabase
      .from('menu_imports')
      .update({ status: 'error', error: message })
      .eq('id', importId)
      .eq('tenant_id', tenantId);
    return { ok: false as const, error: message };
  };

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return await failImport(
        'El servidor no tiene configurada la extracción por visión (ANTHROPIC_API_KEY).',
      );
    }

    // Descarga del bucket privado + visión por página, en paralelo.
    // allSettled: una página caída (foto corrupta, API lenta, rate limit ya
    // reintentado por el SDK) no tira a las demás.
    const results = await Promise.allSettled(
      photoKeys.map(async (key): Promise<PageExtraction> => {
        const ext = key.split('.').pop() ?? '';
        const mediaType = MEDIA_BY_EXT[ext];
        if (!mediaType) throw new Error(`Extensión no soportada: ${ext}`);
        const { data: blob, error: dlError } = await service.storage
          .from('menu-imports')
          .download(key);
        if (dlError || !blob) throw new Error(`No se pudo leer la foto: ${dlError?.message}`);
        const base64 = Buffer.from(await blob.arrayBuffer()).toString('base64');
        return extractMenuPage(base64, mediaType);
      }),
    );

    const pages = results
      .filter((r): r is PromiseFulfilledResult<PageExtraction> => r.status === 'fulfilled')
      .map((r) => r.value);
    const pagesFailed = results.length - pages.length;

    if (pages.length === 0) {
      const firstError =
        results[0]?.status === 'rejected'
          ? String(results[0].reason?.message ?? results[0].reason)
          : '';
      return await failImport(`No se pudo procesar ninguna foto. ${firstError}`.trim());
    }

    const notMenuNotes = pages
      .filter((p) => !p.is_menu)
      .map((p) => p.page_note)
      .filter(Boolean);
    const { items, categories } = mergePages(pages);

    if (items.length === 0) {
      return await failImport(
        notMenuNotes.length > 0
          ? `No se detectaron productos: ${notMenuNotes.join(' / ')}`
          : 'No se detectaron productos en las fotos. Verifica que sean fotos legibles del menú.',
      );
    }

    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('tenant_id', tenantId)
      .single();
    if (restError || !restaurant) return await failImport('Restaurante no encontrado.');

    // INVARIANTE DE PRECIOS: el precio extraído va a base_price (canal
    // directo) y a NINGÚN otro lado. menu_channel_prices no se toca aquí.
    const draftRows = items.map((item) => ({
      tenant_id: tenantId,
      restaurant_id: (restaurant as { id: string }).id,
      category: item.category,
      name: item.name.slice(0, 120),
      description: item.description,
      base_price: item.price_cents ?? 0,
      active: true,
      status: 'draft',
      source: 'foto',
      import_id: importId,
      options: [],
      review_reasons: item.review_reasons.length > 0 ? item.review_reasons : null,
    }));

    const { error: insertError } = await supabase.from('menu_items').insert(draftRows);
    if (insertError)
      return await failImport(`No se pudieron crear los borradores: ${insertError.message}`);

    const needsReview = items.filter((i) => i.review_reasons.length > 0).length;
    await supabase
      .from('menu_imports')
      .update({
        status: 'ready',
        error: null,
        summary: {
          pages: photoKeys.length,
          pages_failed: pagesFailed,
          items: items.length,
          categories: categories.length,
          needs_review: needsReview,
        },
      })
      .eq('id', importId)
      .eq('tenant_id', tenantId);

    return { ok: true, data: { items: items.length, pagesFailed } };
  } catch (e) {
    // Best-effort: que el job nunca quede colgado en processing por una
    // excepción no prevista.
    return await failImport(e instanceof Error ? e.message : String(e));
  }
}

/** Procesa las fotos ya subidas de un import. Idempotencia: aborta si ya hay borradores. */
export const processMenuImport = async (
  importId: string,
): Promise<ActionResult<{ items: number; pagesFailed: number }>> => {
  try {
    const { tenantId } = await requireFeature('menu.import_photos');
    const supabase = createSupabaseServerClient();

    const { data: imp, error: impError } = await supabase
      .from('menu_imports')
      .select('id, source, status, input')
      .eq('id', importId)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (impError) return { ok: false, error: impError.message };
    if (!imp) return { ok: false, error: 'Import no encontrado' };
    const row = imp as {
      source: string;
      status: MenuImportStatus;
      input: { photo_keys?: string[] };
    };
    if (row.source !== 'foto') return { ok: false, error: 'Este import no es de fotos.' };
    if (row.status !== 'processing') return { ok: false, error: 'Este import ya fue procesado.' };

    const photoKeys = row.input.photo_keys ?? [];
    if (photoKeys.length === 0) return { ok: false, error: 'El import no tiene fotos subidas.' };

    // Guard de reentrada: si ya hay borradores, otro proceso ya corrió.
    const { data: existing, error: existingError } = await loadDrafts(supabase, tenantId, importId);
    if (existingError) return { ok: false, error: existingError.message };
    if ((existing ?? []).length > 0) {
      return {
        ok: false,
        error: 'Este import ya tiene borradores; usa Reintentar para reprocesar.',
      };
    }

    return await runPhotoProcessing(tenantId, importId, photoKeys);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

const STALE_PROCESSING_MS = 2 * 60 * 1000;

/**
 * Reintento tras error o tras processing colgado (crash duro). Borra los
 * borradores previos del import (triple llave) y reprocesa las mismas fotos.
 */
export const retryMenuImport = async (
  importId: string,
): Promise<ActionResult<{ items: number; pagesFailed: number }>> => {
  try {
    const { tenantId } = await requireFeature('menu.import_photos');
    const supabase = createSupabaseServerClient();

    const { data: imp, error: impError } = await supabase
      .from('menu_imports')
      .select('id, source, status, input, updated_at')
      .eq('id', importId)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (impError) return { ok: false, error: impError.message };
    if (!imp) return { ok: false, error: 'Import no encontrado' };
    const row = imp as {
      source: string;
      status: MenuImportStatus;
      input: { photo_keys?: string[] };
      updated_at: string;
    };
    if (row.source !== 'foto') return { ok: false, error: 'Este import no es de fotos.' };
    if (row.status !== 'error' && row.status !== 'processing') {
      return { ok: false, error: 'Este import no se puede reintentar.' };
    }
    // processing reciente = probablemente sigue corriendo; no duplicar.
    if (
      row.status === 'processing' &&
      Date.now() - new Date(row.updated_at).getTime() < STALE_PROCESSING_MS
    ) {
      return { ok: false, error: 'El import sigue procesando; espera un momento.' };
    }
    const photoKeys = row.input.photo_keys ?? [];
    if (photoKeys.length === 0) return { ok: false, error: 'El import no tiene fotos subidas.' };

    // Limpia borradores previos (y sus fotos de platillo) antes de reprocesar.
    const { data: drafts, error: draftsError } = await loadDrafts(supabase, tenantId, importId);
    if (draftsError) return { ok: false, error: draftsError.message };
    const dishKeys = ((drafts ?? []) as Array<{ photo_key: string | null }>)
      .map((d) => d.photo_key)
      .filter((k): k is string => !!k && k.startsWith(`${tenantId}/`));
    if (dishKeys.length > 0) {
      const service = createSupabaseServiceClient();
      const { error: dishError } = await service.storage.from('menu-items').remove(dishKeys);
      if (dishError)
        return { ok: false, error: `No se pudieron borrar fotos: ${dishError.message}` };
    }
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('import_id', importId)
      .eq('status', 'draft');
    if (deleteError) return { ok: false, error: deleteError.message };

    const { error: resetError } = await supabase
      .from('menu_imports')
      .update({ status: 'processing', error: null })
      .eq('id', importId)
      .eq('tenant_id', tenantId);
    if (resetError) return { ok: false, error: resetError.message };

    return await runPhotoProcessing(tenantId, importId, photoKeys);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};
