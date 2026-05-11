import { CHANNELS, formatOrderId, formatTimeMX } from '@lidxi/shared';
import { Br, Cut, Line, Printer, Row, Text } from 'react-thermal-printer';
import type { ReceiptOrder } from '../types';

/**
 * Comanda para cocina (80mm).
 * Reglas visuales:
 *   - "MIZTLI" en negro/bold arriba (la térmica no imprime color, pero
 *     reservamos la jerarquía visual para cuando agreguemos color por banda).
 *   - Items en grande, modificadores indentados.
 *   - Sin precios; cocina no necesita verlos.
 */
export const KitchenTicket = ({
  order,
  branchName,
}: { order: ReceiptOrder; branchName: string }) => {
  const channel = CHANNELS[order.channel];
  return (
    <Printer type="epson" width={42}>
      <Text align="center" bold size={{ width: 2, height: 2 }}>
        MIZTLI
      </Text>
      <Text align="center">{branchName}</Text>
      <Line />
      <Row
        left={<Text bold>{channel.label.toUpperCase()}</Text>}
        right={<Text>{formatTimeMX(order.createdAt)}</Text>}
      />
      <Text bold size={{ width: 2, height: 2 }}>
        {formatOrderId(order.id)}
      </Text>
      {order.externalId && <Text>Ref: {order.externalId}</Text>}
      <Line />
      {order.items.map((it, idx) => (
        <ItemBlock
          key={idx}
          qty={it.qty}
          name={it.name}
          modifiers={it.modifiers}
          notes={it.notes}
        />
      ))}
      <Line />
      <Text align="center">--- preparar lo antes posible ---</Text>
      <Br />
      <Cut />
    </Printer>
  );
};

const ItemBlock = ({
  qty,
  name,
  modifiers,
  notes,
}: {
  qty: number;
  name: string;
  modifiers?: string[];
  notes?: string;
}) => (
  <>
    <Text bold size={{ width: 1, height: 2 }}>
      {qty}× {name}
    </Text>
    {modifiers?.map((m, i) => (
      <Text key={i}> + {m}</Text>
    ))}
    {notes && <Text> NOTA: {notes}</Text>}
  </>
);
