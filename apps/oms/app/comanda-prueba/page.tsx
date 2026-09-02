import { KitchenTicketPrintPreview } from '@/components/comanda/KitchenTicketPrintPreview';
import { getOperationSession } from '@/lib/operations/session-tenant';
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
 * sin datos reales. Se abre desde la PC de cocina. Si HAY sesión activa, el
 * nombre del negocio y la sucursal salen del contexto real — igual que
 * cualquier otro consumidor; los valores de ejemplo son solo el fallback
 * para la prueba sin sesión.
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
 *   - Un nombre de platillo largo y un modificador largo: es donde 58mm se
 *     rompe primero. A 48mm útiles caben ~21 caracteres en el nombre del ítem
 *     y ~30 en un modificador, así que ambos deben envolver — y al envolver,
 *     el modificador tiene que seguir leyéndose como subordinado, no como
 *     otro platillo.
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
    // El caso que rompe 58mm: nombre largo Y modificador largo en el mismo
    // ítem. Los dos envuelven a 48mm; si la jerarquía aguanta aquí, aguanta.
    {
      qty: 1,
      name: 'Hamburguesa de la casa con doble carne y tocino',
      modifiers: ['Sin cebolla morada, sin jitomate y sin pepinillos', 'Aderezo de la casa aparte'],
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

/** Fallback explícito para la prueba de hardware sin sesión activa. */
const TENANT_DE_EJEMPLO = 'Miztli Burguers';
const SUCURSAL_DE_EJEMPLO = 'Sucursal principal';

export default async function ComandaPruebaPage() {
  const session = await getOperationSession();

  return (
    <KitchenTicketPrintPreview
      order={ORDEN_DE_PRUEBA}
      tenantName={session?.tenantName ?? TENANT_DE_EJEMPLO}
      branchName={session?.branchName ?? SUCURSAL_DE_EJEMPLO}
    />
  );
}
