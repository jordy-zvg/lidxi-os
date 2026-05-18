'use client';

import { Button, SegmentedControl, Toggle } from '@kobi/ui';
import { useState } from 'react';
import {
  DEFAULT_RULES,
  KITCHEN_RULES,
  PRINTER_TYPE_LABEL,
  type Printer,
  type PrinterRules,
  type PrinterType,
} from './mock-printers';

type ConnectionType = 'lan' | 'wifi' | 'usb';

const TYPE_OPTIONS = (['kitchen', 'label', 'cashier'] as PrinterType[]).map((v) => ({
  value: v,
  label: PRINTER_TYPE_LABEL[v],
}));

const CONN_OPTIONS = [
  { value: 'lan' as ConnectionType, label: 'LAN' },
  { value: 'wifi' as ConnectionType, label: 'Wi-Fi' },
  { value: 'usb' as ConnectionType, label: 'USB' },
];

interface RuleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const RuleRow = ({ label, checked, onChange }: RuleRowProps) => (
  <div className="flex items-center justify-between py-2.5 border-b border-line last:border-b-0">
    <span className="text-sm text-ink-200">{label}</span>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

interface PrinterConfigPanelProps {
  printer: Printer;
  onDelete: () => void;
}

export const PrinterConfigPanel = ({ printer, onDelete }: PrinterConfigPanelProps) => {
  const [name, setName] = useState(printer.name);
  const [type, setType] = useState<PrinterType>(printer.type);
  const [connection, setConnection] = useState<ConnectionType>(printer.connection);
  const [ip, setIp] = useState(printer.ip ?? '');
  const [port, setPort] = useState(String(printer.port ?? 9100));
  const [rules, setRules] = useState<PrinterRules>(
    printer.type === 'kitchen' ? KITCHEN_RULES : DEFAULT_RULES,
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleRule = (key: keyof PrinterRules) =>
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-line px-5 py-4 shrink-0">
        <h2 className="text-sm font-semibold text-ink">Configuración</h2>
        <p className="text-xs text-ink-400 mt-0.5">{printer.model}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wider text-ink-400"
            htmlFor="printer-name"
          >
            Nombre
          </label>
          <input
            id="printer-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-9 rounded-md border border-line-2 bg-surface px-3 text-sm text-ink placeholder-ink-400 focus:outline-none focus:border-brand focus:shadow-focus transition-colors"
          />
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Tipo</span>
          <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} size="sm" />
        </div>

        {/* Conexión */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Conexión
          </span>
          <SegmentedControl
            options={CONN_OPTIONS}
            value={connection}
            onChange={setConnection}
            size="sm"
          />
        </div>

        {/* IP + Puerto */}
        {connection !== 'usb' && (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider text-ink-400"
                htmlFor="printer-ip"
              >
                Dirección IP
              </label>
              <input
                id="printer-ip"
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.42"
                className="w-full h-9 rounded-md border border-line-2 bg-surface px-3 font-mono text-sm text-ink placeholder-ink-400 focus:outline-none focus:border-brand focus:shadow-focus transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider text-ink-400"
                htmlFor="printer-port"
              >
                Puerto
              </label>
              <input
                id="printer-port"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full h-9 rounded-md border border-line-2 bg-surface px-3 font-mono text-sm text-ink focus:outline-none focus:border-brand focus:shadow-focus transition-colors"
              />
            </div>
          </div>
        )}

        {/* Reglas */}
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Reglas de auto-impresión
          </span>
          <div className="bg-canvas rounded-lg border border-line px-3 mt-2">
            <RuleRow
              label="Al aceptar pedido → imprimir comanda en cocina"
              checked={rules.onAccept}
              onChange={() => toggleRule('onAccept')}
            />
            <RuleRow
              label="Al marcar listo → imprimir etiqueta de empaque"
              checked={rules.onReady}
              onChange={() => toggleRule('onReady')}
            />
            <RuleRow
              label="Al cobrar en mostrador → imprimir ticket de venta"
              checked={rules.onCheckout}
              onChange={() => toggleRule('onCheckout')}
            />
            <RuleRow
              label="Al cerrar turno → imprimir ticket de corte"
              checked={rules.onShiftClose}
              onChange={() => toggleRule('onShiftClose')}
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-line px-5 py-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onDelete}
          className="text-sm font-medium text-danger-text hover:underline"
        >
          Eliminar impresora
        </button>
        <Button onClick={handleSave}>{saved ? 'Guardado ✓' : 'Guardar cambios'}</Button>
      </div>
    </div>
  );
};
