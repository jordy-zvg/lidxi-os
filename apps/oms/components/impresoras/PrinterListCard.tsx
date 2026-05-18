import { cn } from '@kobi/shared';
import { StatusPill } from '@kobi/ui';
import { IconCashRegister, IconPrinter, IconTag } from '@tabler/icons-react';
import type { Printer, PrinterType } from './mock-printers';
import { PRINTER_TYPE_LABEL } from './mock-printers';

const PRINTER_ICON: Record<PrinterType, React.ReactElement> = {
  kitchen: <IconPrinter size={20} className="text-ink-300" />,
  label: <IconTag size={20} className="text-ink-300" />,
  cashier: <IconCashRegister size={20} className="text-ink-300" />,
};

const STATUS_PILL: Record<string, { variant: 'ok' | 'warn' | 'danger'; label: string }> = {
  ready: { variant: 'ok', label: 'Lista' },
  warning: { variant: 'warn', label: 'Papel bajo' },
  error: { variant: 'danger', label: 'Sin conexión' },
};

interface PrinterListCardProps {
  printer: Printer;
  selected: boolean;
  onSelect: () => void;
  onTestPrint: () => void;
}

export const PrinterListCard = ({
  printer,
  selected,
  onSelect,
  onTestPrint,
}: PrinterListCardProps) => {
  const pill = STATUS_PILL[printer.status] ?? { variant: 'neutral' as const, label: 'Desconocido' };
  const connectionLabel =
    printer.connection === 'usb' ? 'USB' : `${printer.ip ?? '—'}:${printer.port ?? 9100}`;

  return (
    <div
      className={cn(
        'border rounded-lg transition-colors',
        selected ? 'border-brand bg-brand-soft' : 'border-line bg-surface',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="w-full text-left p-4 hover:bg-surface-2 transition-colors rounded-t-lg"
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">{PRINTER_ICON[printer.type]}</div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-medium text-sm text-ink">{printer.name}</span>
              <StatusPill variant={pill.variant}>{printer.warning ?? pill.label}</StatusPill>
            </div>
            <p className="text-xs text-ink-300">
              {PRINTER_TYPE_LABEL[printer.type]} · {printer.model}
            </p>
            <p className="font-mono text-xs text-ink-400">{connectionLabel}</p>
          </div>
        </div>
      </button>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onTestPrint}
          className="w-full h-8 rounded border border-line-2 text-xs font-medium text-ink-200 hover:bg-surface-2 transition-colors"
        >
          Probar impresión
        </button>
      </div>
    </div>
  );
};
