import type { ReactNode } from 'react';

/**
 * Layout por restaurant. En el futuro:
 *   - Cargamos el restaurant por slug y exponemos contexto al árbol.
 *   - Aplicamos brand_color del restaurant a las CSS vars de la rama.
 *   - Pintamos header/footer específicos del cliente.
 *
 * Por ahora solo wrap básico.
 */
export default function RestaurantLayout({
  children,
}: {
  children: ReactNode;
  params: { restaurantSlug: string };
}) {
  return <div className="min-h-screen">{children}</div>;
}
