// Single source of truth para los planes Kobi.
// Consumido por /precios, wizard onboarding (paso 3), y cualquier UI que muestre planes.
// Si cambian precios, actualizar SOLO aquí.

export type PlanId = 'arranque' | 'crecimiento' | 'escala';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthlyMXN: number;
  priceAnnualMXN: number;
  priceSub: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'arranque',
    name: 'Arranque',
    priceMonthlyMXN: 799,
    priceAnnualMXN: 639,
    priceSub: '/ sucursal / mes',
    description: 'Para un restaurante o cocina oscura que empieza.',
    features: [
      'POS y caja',
      'OMS hasta 2 canales (Uber Eats + tu sitio)',
      'KDS básico (1 estación)',
      'Inventario simple',
      'Hasta 3 usuarios',
      'Soporte por correo',
    ],
    highlighted: false,
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    priceMonthlyMXN: 1499,
    priceAnnualMXN: 1199,
    priceSub: '/ sucursal / mes',
    description: 'Para operaciones con múltiples canales y delivery.',
    features: [
      'Todo lo de Arranque, más:',
      'OMS multi-canal (Uber Eats, Rappi, Didi, tu sitio)',
      'Storefront propio con Uber Direct',
      'Automatizaciones (hasta 10 reglas activas)',
      'KDS multi-estación',
      'Reportes avanzados',
      'Hasta 10 usuarios',
      'Soporte prioritario por WhatsApp',
    ],
    highlighted: true,
    badge: 'Más popular',
  },
  {
    id: 'escala',
    name: 'Escala',
    priceMonthlyMXN: 2999,
    priceAnnualMXN: 2399,
    priceSub: '/ sucursal / mes',
    description: 'Para cadenas y operaciones multi-sucursal.',
    features: [
      'Todo lo de Crecimiento, más:',
      'Sucursales ilimitadas',
      'Reportes consolidados con drill-down',
      'Automatizaciones ilimitadas',
      'Permisos granulares por sucursal/rol',
      'API y webhooks',
      'SSO con tu proveedor de identidad',
      'Onboarding dedicado',
      'Account manager',
      'SLA garantizado',
    ],
    highlighted: false,
  },
];

export function formatMXN(amount: number): string {
  return `$${amount.toLocaleString('es-MX')} MXN`;
}

export function getPlanById(id: string | null | undefined): Plan | undefined {
  if (!id) return undefined;
  return PLANS.find((p) => p.id === id);
}

export const PLAN_SLUGS: PlanId[] = ['arranque', 'crecimiento', 'escala'];

export function isValidPlanSlug(slug: string | null | undefined): slug is PlanId {
  return slug != null && (PLAN_SLUGS as string[]).includes(slug);
}
