import { CHANNELS, formatOrderId } from '@lidxi/shared';
import { Br, Cut, Printer, Text } from 'react-thermal-printer';
import type { ReceiptOrder } from '../types';

/**
 * Etiqueta de embalaje para bolsa de delivery (80mm chico).
 * Datos mínimos para que el repartidor identifique la entrega en un vistazo.
 */
export const PackingLabel = ({ order }: { order: ReceiptOrder }) => {
  const channel = CHANNELS[order.channel];
  const totalItems = order.items.reduce((s, it) => s + it.qty, 0);
  return (
    <Printer type="epson" width={42}>
      <Text align="center" bold size={{ width: 2, height: 2 }}>
        MIZTLI
      </Text>
      <Text align="center">{channel.label}</Text>
      <Br />
      <Text align="center" bold size={{ width: 2, height: 2 }}>
        {formatOrderId(order.id)}
      </Text>
      {order.externalId && <Text align="center">Ref: {order.externalId}</Text>}
      <Br />
      <Text align="center" bold>
        {order.customer?.name ?? 'Cliente'}
      </Text>
      {order.customer?.phone && <Text align="center">{order.customer.phone}</Text>}
      <Br />
      <Text align="center">
        {totalItems} {totalItems === 1 ? 'pieza' : 'piezas'}
      </Text>
      <Br />
      <Cut />
    </Printer>
  );
};
