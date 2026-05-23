'use client';

import { usePathname } from 'next/navigation';

const SEGMENT_LABELS: Record<string, string> = {
  pedidos: 'Pedidos',
  pos: 'POS',
  kds: 'Cocina',
  'sitio-propio': 'Tienda directa',
  menu: 'Menú',
  reportes: 'Reportes',
  caja: 'Caja',
  personal: 'Personal',
  timesheet: 'Tiempos',
  impresoras: 'Impresoras',
  automatizacion: 'Automatización',
  integraciones: 'Integraciones',
  inventario: 'Inventario',
  precios: 'Precios',
};

export const Breadcrumb = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const parts = segments.map((seg) => SEGMENT_LABELS[seg] ?? null).filter(Boolean) as string[];

  if (parts.length === 0) return null;

  // En mobile mostramos solo el último segmento para no exprimir el topbar.
  const last = parts[parts.length - 1];

  return (
    <nav aria-label="Ubicación" className="flex items-center gap-1.5 min-w-0">
      {/* Mobile: solo el último */}
      <span className="sm:hidden text-sm font-medium text-ink-200 truncate">{last}</span>
      {/* Desktop: cadena completa */}
      <span className="hidden sm:flex items-center gap-1.5">
        {parts.map((label, idx) => (
          <span key={label} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-ink-400 text-sm select-none">/</span>}
            <span className="text-sm font-medium text-ink-200">{label}</span>
          </span>
        ))}
      </span>
    </nav>
  );
};
