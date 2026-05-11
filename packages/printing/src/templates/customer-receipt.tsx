import { CHANNELS, formatMXN, formatOrderId, formatTimeMX } from '@lidxi/shared';
import { Br, Cut, Line, Printer, Row, Text } from 'react-thermal-printer';
import type { ReceiptOrder } from '../types.js';

/**
 * Ticket de venta para el cliente (80mm).
 * Incluye precios, impuestos y total. Pie con leyenda fiscal/contacto.
 */
export const CustomerReceipt = ({
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
      <Text align="center">www.miztli.mx</Text>
      <Line />
      <Row left={<Text>Canal</Text>} right={<Text>{channel.label}</Text>} />
      <Row left={<Text>Orden</Text>} right={<Text>{formatOrderId(order.id)}</Text>} />
      <Row left={<Text>Fecha</Text>} right={<Text>{formatTimeMX(order.createdAt)}</Text>} />
      {order.paymentMethod && (
        <Row left={<Text>Pago</Text>} right={<Text>{order.paymentMethod}</Text>} />
      )}
      <Line />
      {order.items.map((it, idx) => (
        <Row
          key={idx}
          left={
            <Text>
              {it.qty}× {it.name}
            </Text>
          }
          right={<Text> </Text>}
        />
      ))}
      <Line />
      <Row left={<Text>Subtotal</Text>} right={<Text>{formatMXN(order.subtotal)}</Text>} />
      <Row left={<Text>IVA</Text>} right={<Text>{formatMXN(order.tax)}</Text>} />
      {order.deliveryFee !== undefined && order.deliveryFee > 0 && (
        <Row left={<Text>Envío</Text>} right={<Text>{formatMXN(order.deliveryFee)}</Text>} />
      )}
      <Row
        left={
          <Text bold size={{ width: 1, height: 2 }}>
            TOTAL
          </Text>
        }
        right={
          <Text bold size={{ width: 1, height: 2 }}>
            {formatMXN(order.total)}
          </Text>
        }
      />
      <Line />
      <Text align="center">Gracias por su compra</Text>
      <Br />
      <Cut />
    </Printer>
  );
};
