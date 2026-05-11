import type { ReactElement } from 'react';
import { render } from 'react-thermal-printer';
import type { PrinterTarget } from '../types';

/**
 * Envía un template renderizado a una impresora térmica 80mm.
 *
 * react-thermal-printer transforma el JSX en bytes ESC/POS; aquí decidimos
 * cómo los entregamos al hardware:
 *   - mock      → console.log (desarrollo).
 *   - network   → TCP raw socket al puerto 9100 (estándar JetDirect).
 *   - usb       → TODO; requiere node-escpos-usb o libusb, lo dejamos para
 *                 cuando tengamos hardware con qué probar.
 */
export const printToTarget = async (
  template: ReactElement,
  target: PrinterTarget,
): Promise<void> => {
  const bytes = await render(template);

  if (target.type === 'mock' || process.env.MOCK_PRINTERS === 'true') {
    // biome-ignore lint/suspicious/noConsole: el sink de mock es la consola por diseño.
    console.log('[printer:mock]', bytes.length, 'bytes');
    return;
  }

  if (target.type === 'network') {
    if (!target.address) throw new Error('Network printer sin address');
    const [host, portStr] = target.address.split(':');
    const port = portStr ? Number.parseInt(portStr, 10) : 9100;
    if (!host) throw new Error(`Address inválida: ${target.address}`);
    await sendOverTcp(host, port, bytes);
    return;
  }

  if (target.type === 'usb') {
    // TODO[printing-usb]: implementar usando `escpos-usb` o `node-thermal-printer`
    // cuando tengamos una Epson TM-m30 o equivalente para probar. Por ahora
    // forzamos fallback a mock en vez de fallar silenciosamente.
    throw new Error('Printer USB no implementado todavía. Usa target.type = "mock" en dev.');
  }

  throw new Error(`Tipo de target desconocido: ${(target as { type: string }).type}`);
};

const sendOverTcp = async (host: string, port: number, bytes: Uint8Array): Promise<void> => {
  // Cargamos `net` dinámicamente para no romper el bundling de Next en client
  // si alguien importa el package por accidente desde un Client Component.
  const net = await import('node:net');
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const onError = (e: Error) => {
      socket.destroy();
      reject(e);
    };
    socket.setTimeout(5_000, () => onError(new Error(`TCP timeout para ${host}:${port}`)));
    socket.once('error', onError);
    socket.connect(port, host, () => {
      socket.write(Buffer.from(bytes), (err) => {
        if (err) return onError(err);
        socket.end();
      });
    });
    socket.once('close', () => resolve());
  });
};
