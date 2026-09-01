import { KitchenTicketPrintPreview } from '@/components/comanda/KitchenTicketPrintPreview';
import type { ReceiptOrder } from '@kobi/printing';
import { cents } from '@kobi/shared';

/**
 * Ruta de prueba de impresión de comanda.
 *
 * Existe para validar el papel ANTES de que la captura de pedidos esté
 * construida (Sprint 19, Fase 2). Una comanda de prueba impresa en papel real
 * vale más que una captura perfecta que nunca tocó una impresora.
 *
 * Vive FUERA del route group (operations) a propósito: ese grupo envuelve todo
 * en <Chrome> (sidebar + topbar), y aunque el CSS de impresión los oculta,
 * la prueba del papel no debe depender de que ese ocultamiento funcione.
 *
 * No requiere sesión de empleado: es una página de verificación de hardware,
 * sin datos reales. Se abre desde la PC de cocina.
 */

export const metadata = {
  title: 'Prueba de impresión — Kobi',
  robots: { index: false, follow: false },
};

/**
 * Caso de prueba deliberadamente incómodo: revela problemas de jerarquía.
 *   - Un ítem con cantidad > 1 (¿se lee "3×" pegado al nombre?).
 *   - Un ítem con dos modificadores (¿se distinguen del nombre del platillo?).
 *   - Un ítem con nota larga (¿hace wrap sin romper la comanda?).
 */
const ORDEN_DE_PRUEBA: ReceiptOrder = {
  id: 'prueba-impresion-0001',
  channel: 'eats',
  externalId: 'A1B2C',
  createdAt: '2026-08-25T20:15:00.000Z',
  customer: { name: 'Ana' },
  items: [
    {
      qty: 3,
      name: 'Hamburguesa doble',
      modifiers: ['Término tres cuartos'],
    },
    {
      qty: 1,
      name: 'Hamburguesa con queso',
      modifiers: ['Sin cebolla', 'Extra queso'],
    },
    {
      qty: 2,
      name: 'Papas gajo grandes',
      notes: 'Separar en dos bolsas distintas, una sin sal porque el cliente es alérgico',
    },
  ],
  // La comanda de cocina no imprime precios; estos campos solo satisfacen
  // el contrato de ReceiptOrder.
  subtotal: cents(0),
  tax: cents(0),
  total: cents(0),
};

export default function ComandaPruebaPage() {
  return (
    <KitchenTicketPrintPreview
      order={ORDEN_DE_PRUEBA}
      tenantName="Miztli Burguers"
      branchName="Sucursal principal"
    />
  );
}
