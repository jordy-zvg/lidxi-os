'use client';

import { PreviewBadge } from '@/components/admin/PreviewBadge';
import { useState } from 'react';
import { PrinterConfigPanel } from './PrinterConfigPanel';
import { PrinterListCard } from './PrinterListCard';
import { MOCK_PRINTERS, type Printer } from './mock-printers';

export const ImpresorasScreen = () => {
  const [printers, setPrinters] = useState<Printer[]>(MOCK_PRINTERS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_PRINTERS[0]?.id ?? null);

  const selectedPrinter = printers.find((p) => p.id === selectedId) ?? null;

  const handleDelete = (id: string) => {
    setPrinters((prev) => prev.filter((p) => p.id !== id));
    setSelectedId(printers.find((p) => p.id !== id)?.id ?? null);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3 shrink-0">
        <h1 className="text-lg font-semibold text-ink">Impresoras</h1>
        <PreviewBadge variant="preview" />
      </header>

      <div className="flex-1 grid grid-cols-5 gap-4 min-h-0">
        {/* Lista — 60% ≈ 3/5 cols */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto">
          {printers.map((printer) => (
            <PrinterListCard
              key={printer.id}
              printer={printer}
              selected={selectedId === printer.id}
              onSelect={() => setSelectedId(printer.id)}
              onTestPrint={() => {
                // mock: trabajo de prueba enviado a la impresora
              }}
            />
          ))}

          {printers.length === 0 && (
            <div className="rounded-lg border border-dashed border-line py-12 flex items-center justify-center text-sm text-ink-400">
              Sin impresoras configuradas
            </div>
          )}
        </div>

        {/* Panel configuración — 40% ≈ 2/5 cols */}
        <div className="col-span-2 bg-surface border border-line rounded-lg overflow-hidden">
          {selectedPrinter ? (
            <PrinterConfigPanel
              printer={selectedPrinter}
              onDelete={() => handleDelete(selectedPrinter.id)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-ink-400">
              Selecciona una impresora para configurarla
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
