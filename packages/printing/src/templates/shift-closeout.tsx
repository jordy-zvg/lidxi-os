import { type CentsMXN, formatDateMX, formatMXN, formatTimeMX } from '@kobi/shared';
import { Br, Cut, Line, Printer, Row, Text } from 'react-thermal-printer';

export interface ShiftCloseoutData {
  branchName: string;
  employeeName: string;
  shiftStart: string;
  shiftEnd: string;
  orderCount: number;
  subtotal: CentsMXN;
  tax: CentsMXN;
  total: CentsMXN;
  byChannel: { channel: string; count: number; total: CentsMXN }[];
  byPayment: { method: string; total: CentsMXN }[];
  openingFloat?: CentsMXN;
  closingFloat?: CentsMXN;
}

/**
 * Corte de caja / cierre de turno (80mm).
 */
export const ShiftCloseout = ({ data }: { data: ShiftCloseoutData }) => (
  <Printer type="epson" width={42}>
    <Text align="center" bold size={{ width: 2, height: 2 }}>
      CORTE DE CAJA
    </Text>
    <Text align="center">{data.branchName}</Text>
    <Line />
    <Row left={<Text>Empleado</Text>} right={<Text>{data.employeeName}</Text>} />
    <Row left={<Text>Fecha</Text>} right={<Text>{formatDateMX(data.shiftStart)}</Text>} />
    <Row left={<Text>Inicio</Text>} right={<Text>{formatTimeMX(data.shiftStart)}</Text>} />
    <Row left={<Text>Cierre</Text>} right={<Text>{formatTimeMX(data.shiftEnd)}</Text>} />
    <Line />
    <Row left={<Text bold>Pedidos</Text>} right={<Text bold>{data.orderCount}</Text>} />
    <Br />
    <Text bold>POR CANAL</Text>
    {data.byChannel.map((c, i) => (
      <Row
        key={i}
        left={
          <Text>
            {c.channel} ({c.count})
          </Text>
        }
        right={<Text>{formatMXN(c.total)}</Text>}
      />
    ))}
    <Br />
    <Text bold>POR FORMA DE PAGO</Text>
    {data.byPayment.map((p, i) => (
      <Row key={i} left={<Text>{p.method}</Text>} right={<Text>{formatMXN(p.total)}</Text>} />
    ))}
    <Line />
    <Row left={<Text>Subtotal</Text>} right={<Text>{formatMXN(data.subtotal)}</Text>} />
    <Row left={<Text>IVA</Text>} right={<Text>{formatMXN(data.tax)}</Text>} />
    <Row
      left={
        <Text bold size={{ width: 1, height: 2 }}>
          TOTAL
        </Text>
      }
      right={
        <Text bold size={{ width: 1, height: 2 }}>
          {formatMXN(data.total)}
        </Text>
      }
    />
    {data.openingFloat !== undefined && (
      <Row left={<Text>Fondo inicial</Text>} right={<Text>{formatMXN(data.openingFloat)}</Text>} />
    )}
    {data.closingFloat !== undefined && (
      <Row left={<Text>Fondo final</Text>} right={<Text>{formatMXN(data.closingFloat)}</Text>} />
    )}
    <Line />
    <Text align="center">Firma: ___________________</Text>
    <Br />
    <Cut />
  </Printer>
);
