import { type CentsMXN, cents } from './money';
import type { OrderItemModifier } from './order';

/**
 * Modificadores a nivel catálogo (`menu_items.options` jsonb).
 * Este shape debe poder generar las dos formas que ya existen río abajo:
 * `OrderItemModifier` (order_items.modifiers) y `string[]` (impresión).
 */

export interface MenuItemOptionChoice {
  name: string;
  /** Delta sobre base_price, en centavos MXN. Puede ser 0 o negativo. */
  price_delta: number;
}

export interface MenuItemOptionGroup {
  group: string;
  type: 'single' | 'multi';
  required?: boolean;
  choices: MenuItemOptionChoice[];
}

/** Choice elegido en el POS → modifier del pedido (`order_items.modifiers`). */
export const optionChoiceToModifier = (choice: MenuItemOptionChoice): OrderItemModifier => ({
  name: choice.name,
  priceDelta: cents(choice.price_delta),
});

/** Modifiers de un item → strings para impresión (`ReceiptOrder.items[].modifiers`). */
export const modifiersToReceiptStrings = (modifiers: OrderItemModifier[]): string[] =>
  modifiers.map((m) => m.name);

/** Suma de deltas de los modifiers elegidos, para calcular el precio de línea. */
export const modifiersDelta = (modifiers: OrderItemModifier[]): CentsMXN =>
  cents(modifiers.reduce((acc, m) => acc + m.priceDelta, 0));
