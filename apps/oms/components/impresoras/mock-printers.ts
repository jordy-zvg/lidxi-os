export type PrinterType = 'kitchen' | 'label' | 'cashier';
export type PrinterStatus = 'ready' | 'warning' | 'error';
export type ConnectionType = 'lan' | 'wifi' | 'usb';

export interface Printer {
  id: string;
  name: string;
  type: PrinterType;
  connection: ConnectionType;
  ip: string | null;
  port: number | null;
  status: PrinterStatus;
  model: string;
  warning?: string;
}

export interface PrinterRules {
  onAccept: boolean;
  onReady: boolean;
  onCheckout: boolean;
  onShiftClose: boolean;
}

export const DEFAULT_RULES: PrinterRules = {
  onAccept: false,
  onReady: false,
  onCheckout: false,
  onShiftClose: false,
};

export const KITCHEN_RULES: PrinterRules = {
  onAccept: true,
  onReady: false,
  onCheckout: false,
  onShiftClose: false,
};

export const MOCK_PRINTERS: Printer[] = [
  {
    id: 'p1',
    name: 'Cocina principal',
    type: 'kitchen',
    connection: 'lan',
    ip: '192.168.1.42',
    port: 9100,
    status: 'ready',
    model: 'Epson TM-T20III',
  },
  {
    id: 'p2',
    name: 'Empaque · etiquetas',
    type: 'label',
    connection: 'wifi',
    ip: '192.168.1.43',
    port: 9100,
    status: 'ready',
    model: 'Brother QL-820NWB',
  },
  {
    id: 'p3',
    name: 'Caja mostrador',
    type: 'cashier',
    connection: 'usb',
    ip: null,
    port: null,
    status: 'warning',
    model: 'Star TSP143',
    warning: 'Papel bajo',
  },
];

export const PRINTER_TYPE_LABEL: Record<PrinterType, string> = {
  kitchen: 'Cocina',
  label: 'Etiquetas',
  cashier: 'Caja',
};
