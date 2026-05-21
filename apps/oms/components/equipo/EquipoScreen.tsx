'use client';

import { Button } from '@kobi/ui';
import { IconUserPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { AddEmployeeDrawer } from './AddEmployeeDrawer';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeSlideOver } from './EmployeeSlideOver';

export interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  status: 'activo' | 'pausado';
  fingerprint_enrolled: boolean;
}

interface EquipoScreenProps {
  employees: EmployeeRecord[];
}

export const EquipoScreen = ({ employees }: EquipoScreenProps) => {
  const [selected, setSelected] = useState<EmployeeRecord | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const active = employees.filter((e) => e.status === 'activo');

  return (
    <div className="flex flex-col gap-section-sm h-full">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-medium text-ink">Equipo</h1>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <IconUserPlus size={16} className="mr-1.5" />
          Agregar empleado
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-card-gap shrink-0">
        {[
          { label: 'Total empleados', value: String(employees.length) },
          { label: 'Activos', value: String(active.length), highlight: true },
          { label: 'En turno ahora', value: '—' },
          { label: 'Horas del equipo hoy', value: '—' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-line rounded-lg p-card">
            <p className="text-xs text-ink-400 mb-kpi-label">{kpi.label}</p>
            <p
              className={`font-mono text-2xl font-semibold ${kpi.highlight ? 'text-ok' : 'text-ink'}`}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Grid de empleados */}
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
          <p className="text-sm font-medium text-ink">No hay empleados todavía</p>
          <p className="text-xs text-ink-400 max-w-xs">
            Agrega a tu primer empleado con el botón de arriba. Recibirá un PIN para acceder al POS.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-card-gap flex-1 content-start overflow-y-auto">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} onEdit={() => setSelected(emp)} />
          ))}
        </div>
      )}

      <EmployeeSlideOver employee={selected} onClose={() => setSelected(null)} />
      <AddEmployeeDrawer open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
};
