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

/**
 * Convierte CentsMXN al monto en unidad MAYOR (pesos con decimales) que esperan
 * las APIs de pago externas (Mercado Pago `unit_price`, etc.). 12345 → 123.45.
 *
 * Es la conversión INVERSA a `pesos()`: aquí SALIMOS del dominio interno (cents)
 * hacia la frontera de integración. Centralizar la conversión en un solo helper
 * evita los `/100` mágicos dispersos por el código.
 */
export const toMajorUnits = (c: CentsMXN): number => Math.round(c) / 100;
