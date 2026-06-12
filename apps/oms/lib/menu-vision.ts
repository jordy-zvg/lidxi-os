import Anthropic from '@anthropic-ai/sdk';

/**
 * Extracción de menú desde fotos vía visión (Claude). SOLO SERVER-SIDE:
 * este módulo lo importa únicamente menu-import-actions.ts ('use server');
 * ANTHROPIC_API_KEY jamás llega al cliente.
 *
 * Contrato honesto (documentado también en la UI): saca productos base,
 * precios base y categorías. NO saca foto de platillo, NI modificadores
 * confiables, NI precios por canal. El precio extraído alimenta base_price
 * (canal directo) — ver invariante de precios en menu-import-actions.ts.
 *
 * Incertidumbre: nada de "confianza" autorreportada. El modelo marca items
 * con campos faltantes/ambiguos (needs_review + razones) y NUNCA inventa
 * precios (sin precio visible ⇒ null). El staging es la red de seguridad.
 */

const DEFAULT_VISION_MODEL = 'claude-opus-4-8';

export interface ExtractedPageItem {
  name: string;
  description: string | null;
  /** Pesos MXN tal como aparecen impresos; null = no se distingue. */
  price_mxn: number | null;
  category: string;
  needs_review: boolean;
  review_reasons: string[];
}

export interface PageExtraction {
  is_menu: boolean;
  page_note: string | null;
  categories: string[];
  items: ExtractedPageItem[];
}

export interface MergedMenuItem {
  name: string;
  description: string | null;
  /** Centavos MXN; null = sin precio detectado (el caller decide el default). */
  price_cents: number | null;
  category: string;
  review_reasons: string[];
}

// Structured outputs: el schema garantiza el shape — sin parseo heurístico.
const PAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['is_menu', 'page_note', 'categories', 'items'],
  properties: {
    is_menu: {
      type: 'boolean',
      description:
        'false si la imagen NO es un menú de restaurante o es ilegible (borrosa, oscura, otra cosa)',
    },
    page_note: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      description: 'Si is_menu=false o hubo problemas: explicación corta del porqué',
    },
    categories: { type: 'array', items: { type: 'string' } },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'name',
          'description',
          'price_mxn',
          'category',
          'needs_review',
          'review_reasons',
        ],
        properties: {
          name: { type: 'string' },
          description: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          price_mxn: {
            anyOf: [{ type: 'number' }, { type: 'null' }],
            description:
              'Precio en pesos MXN tal como aparece impreso. null si no se distingue. PROHIBIDO inventar o estimar.',
          },
          category: { type: 'string' },
          needs_review: { type: 'boolean' },
          review_reasons: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
} as const;

const EXTRACTION_PROMPT = `Extrae los productos de esta foto de un menú de restaurante (México).

Reglas:
- Extrae nombre, descripción (si la hay), precio y categoría TAL COMO aparecen impresos. No traduzcas ni "mejores" los textos; si el menú está en otro idioma, extrae en ese idioma.
- Precio: número en pesos MXN exactamente como se lee. Si un item no tiene precio visible o es ilegible, usa null — PROHIBIDO inventar o estimar precios.
- Si un item tiene varios precios (tamaños/variantes), usa el precio del tamaño base/menor y marca needs_review con razón "varios precios/tamaños".
- Categoría: la sección del menú donde aparece el item. Si no hay secciones visibles, usa "General".
- needs_review=true con razones específicas cuando: el nombre esté parcialmente ilegible, el precio sea dudoso, la categoría sea incierta, o haya cualquier ambigüedad. Razones en español, cortas (ej. "sin precio visible", "nombre parcialmente ilegible").
- Si la imagen NO es un menú o es completamente ilegible: is_menu=false, items=[], y explica en page_note.
- NO extraigas modificadores/extras como items separados si son claramente opciones de otro platillo.`;

export type SupportedImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * Una llamada por foto/página: aísla fallas por página y deja el merge en
 * código determinista. Lanza en error de API (el caller usa allSettled).
 */
export async function extractMenuPage(
  imageBase64: string,
  mediaType: SupportedImageMediaType,
): Promise<PageExtraction> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no está configurada en el servidor.');
  }
  // max_retries default del SDK (2) cubre 429/5xx con backoff automático.
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: process.env.MENU_VISION_MODEL ?? DEFAULT_VISION_MODEL,
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          { type: 'text', text: EXTRACTION_PROMPT },
        ],
      },
    ],
    output_config: { format: { type: 'json_schema', schema: PAGE_SCHEMA } },
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('El modelo rechazó procesar la imagen.');
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('Respuesta truncada (max_tokens); la página tiene demasiado contenido.');
  }

  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('Respuesta de visión sin contenido.');
  return JSON.parse(text) as PageExtraction;
}

const normalize = (s: string): string =>
  s.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ');

export const toCents = (priceMxn: number | null): number | null =>
  priceMxn === null ? null : Math.round(priceMxn * 100);

/**
 * Merge multi-página determinista: categorías por nombre normalizado; item
 * duplicado (nombre+categoría normalizados) se queda con el primero, y si los
 * precios difieren entre páginas queda marcado para revisión.
 */
export function mergePages(pages: PageExtraction[]): {
  items: MergedMenuItem[];
  categories: string[];
} {
  const byKey = new Map<string, MergedMenuItem>();
  const categories = new Map<string, string>(); // normalizada → display original

  for (const page of pages) {
    if (!page.is_menu) continue;
    for (const cat of page.categories) {
      const key = normalize(cat);
      if (key && !categories.has(key)) categories.set(key, cat.trim());
    }
    for (const item of page.items) {
      const name = item.name.trim();
      if (!name) continue;
      const category = item.category.trim() || 'General';
      const catKey = normalize(category);
      if (catKey && !categories.has(catKey)) categories.set(catKey, category);

      const reasons = [...item.review_reasons];
      if (item.needs_review && reasons.length === 0) reasons.push('marcado por el extractor');
      let priceCents = toCents(item.price_mxn);
      // Saneo: menu_items.base_price no tiene CHECK — un precio negativo o
      // no-finito del modelo se trata como "sin precio" y va a revisión.
      if (priceCents !== null && (priceCents < 0 || !Number.isFinite(priceCents))) {
        priceCents = null;
        reasons.push('precio inválido en la extracción');
      }
      if (priceCents === null && !reasons.includes('sin precio detectado')) {
        reasons.push('sin precio detectado');
      }

      const key = `${normalize(name)}|${catKey}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, {
          name,
          description: item.description?.trim() || null,
          price_cents: priceCents,
          category: categories.get(catKey) ?? category,
          review_reasons: reasons,
        });
      } else if (
        priceCents !== null &&
        existing.price_cents !== null &&
        priceCents !== existing.price_cents &&
        !existing.review_reasons.includes('precio distinto entre páginas')
      ) {
        existing.review_reasons.push('precio distinto entre páginas');
      }
    }
  }

  return { items: Array.from(byKey.values()), categories: Array.from(categories.values()) };
}
