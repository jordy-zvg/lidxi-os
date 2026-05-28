/**
 * Denominaciones de efectivo MXN compartidas entre la apertura de caja
 * (OpeningFloatGate) y el cierre/arqueo (CajaScreen). Vivir en un solo lugar
 * garantiza que el conteo por denominación sea idéntico en ambos flujos y no
 * se desincronice si mañana cambia el set de billetes/monedas.
 */

export interface BilleteDenom {
  valor: number;
  /** Color del chip del billete (paleta desaturada, alejada del rojo de marca). */
  color: string;
}

export interface MonedaDenom {
  valor: number;
  label: string;
}

export const BILLETES: BilleteDenom[] = [
  { valor: 1000, color: '#4A7C59' },
  { valor: 500, color: '#8B6F47' },
  { valor: 200, color: '#A36480' },
  { valor: 100, color: '#B45A52' },
  { valor: 50, color: '#C97B3A' },
  { valor: 20, color: '#4A6FA5' },
];

export const MONEDAS: MonedaDenom[] = [
  { valor: 10, label: '$10' },
  { valor: 5, label: '$5' },
  { valor: 2, label: '$2' },
  { valor: 1, label: '$1' },
];

/**
 * Suma el conteo de piezas por denominación y devuelve el total en centavos.
 * Los registros mapean valor-en-pesos → cantidad de piezas (string del input).
 * Una cantidad vacía o no numérica cuenta como 0.
 */
export function sumDenominationsCents(
  billetes: Record<number, string>,
  monedas: Record<number, string>,
): number {
  const totalBilletes = BILLETES.reduce((sum, b) => {
    const qty = Number(billetes[b.valor] ?? 0);
    return sum + qty * b.valor * 100;
  }, 0);
  const totalMonedas = MONEDAS.reduce((sum, m) => {
    const qty = Number(monedas[m.valor] ?? 0);
    return sum + qty * m.valor * 100;
  }, 0);
  return totalBilletes + totalMonedas;
}
