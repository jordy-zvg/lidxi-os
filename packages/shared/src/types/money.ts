/**
 * Toda cantidad monetaria se modela en centavos enteros para evitar errores
 * de coma flotante. La moneda es siempre MXN salvo que el restaurant declare
 * lo contrario en `restaurants.currency`.
 */

export type CentsMXN = number & { readonly __brand: 'CentsMXN' };

export const cents = (n: number): CentsMXN => {
  if (!Number.isInteger(n)) throw new Error(`cents() expects integer, got ${n}`);
  return n as CentsMXN;
};

export const pesos = (n: number): CentsMXN => cents(Math.round(n * 100));
