'use client';

import { cents, formatMXN } from '@lidxi/shared';
import { useState } from 'react';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeSlideOver } from './EmployeeSlideOver';
import { MOCK_EMPLOYEES, type MockEmployee } from './mock-employees';

const MOCK_KPIS = {
  total: MOCK_EMPLOYEES.length,
  enTurno: MOCK_EMPLOYEES.filter((e) => e.onShift).length,
  horasHoy: 14,
  roles: { managers: 1, cajeros: 1, cocineros: 2, repartidores: 0 },
  ventasHoy: cents(MOCK_EMPLOYEES.reduce((s, e) => s + e.sales, 0)),
};

export const PersonalScreen = () => {
  const [selected, setSelected] = useState<MockEmployee | null>(null);

  return (
    <div className="flex flex-col gap-5 h-full">
      <h1 className="text-xl font-medium text-ink shrink-0">Personal</h1>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Total empleados', value: String(MOCK_KPIS.total) },
          { label: 'En turno ahora', value: String(MOCK_KPIS.enTurno), highlight: true },
          { label: 'Horas trabajadas hoy', value: `${MOCK_KPIS.horasHoy}h` },
          { label: 'Ventas del equipo hoy', value: formatMXN(MOCK_KPIS.ventasHoy) },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-line rounded-lg p-4">
            <p className="text-xs text-ink-400 mb-1">{kpi.label}</p>
            <p
              className={`font-mono text-2xl font-semibold ${kpi.highlight ? 'text-ok' : 'text-ink'}`}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Grid de empleados */}
      <div className="grid grid-cols-4 gap-4 flex-1 content-start overflow-y-auto">
        {MOCK_EMPLOYEES.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} onEdit={() => setSelected(emp)} />
        ))}
      </div>

      <EmployeeSlideOver employee={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
