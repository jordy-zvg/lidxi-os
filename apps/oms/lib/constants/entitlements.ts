import { type PlanId, isValidPlanSlug } from './plans';

/**
 * Entitlements por plan — primer enforcement real por plan del sistema.
 *
 * REGLA FAIL-CLOSED: plan ausente, vacío o con valor desconocido NIEGA la
 * feature. Nunca default a permitir: un fail-open aquí filtra features de
 * pago a tenants que no las contrataron sin que nadie lo note.
 *
 * El acceso es binario por plan (sí/no). No hay metering ni cobro por uso:
 * el costo de operar una feature (p.ej. visión del importador) es COGS.
 */

export type FeatureKey = 'menu.editor' | 'menu.import_photos' | 'menu.import_marketplace';

const FEATURES: Record<FeatureKey, readonly PlanId[]> = {
  // Editor manual + importador de fotos: driver de activación, todos los planes.
  'menu.editor': ['arranque', 'crecimiento', 'escala'],
  'menu.import_photos': ['arranque', 'crecimiento', 'escala'],
  // Importación de marketplace (v1.5): lo caro/frágil/recurrente.
  'menu.import_marketplace': ['crecimiento', 'escala'],
};

export function canUseFeature(plan: string | null | undefined, feature: FeatureKey): boolean {
  if (!isValidPlanSlug(plan)) return false;
  return FEATURES[feature].includes(plan);
}
