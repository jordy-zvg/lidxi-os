'use client';

import { useState } from 'react';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeSlideOver } from './EmployeeSlideOver';
import { MOCK_EMPLOYEES, type MockEmployee } from './mock-employees';

const totalHorasHoy = MOCK_EMPLOYEES.filter((e) => e.onShift).length * 4; // mock simple

const MOCK_KPIS = {
  total: MOCK_EMPLOYEES.length,
  enTurno: MOCK_EMPLOYEES.filter((e) => e.onShift).length,
  horasTotalesHoy: `${totalHorasHoy}h`,
  asistencia: `${MOCK_EMPLOYEES.filter((e) => e.onShift).length} de ${MOCK_EMPLOYEES.length}`,
};

export const PersonalScreen = () => {
  const [selected, setSelected] = useState<MockEmployee | null>(null);

  return (
    <div className="flex flex-col gap-section-sm h-full">
      <h1 className="text-xl font-medium text-ink shrink-0">Personal</h1>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-card-gap shrink-0">
        {[
          { label: 'Total empleados', value: String(MOCK_KPIS.total) },
          { label: 'En turno ahora', value: String(MOCK_KPIS.enTurno), highlight: true },
          { label: 'Horas del equipo hoy', value: MOCK_KPIS.horasTotalesHoy },
          { label: 'Asistencia', value: MOCK_KPIS.asistencia },
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
      <div className="grid grid-cols-4 gap-card-gap flex-1 content-start overflow-y-auto">
        {MOCK_EMPLOYEES.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} onEdit={() => setSelected(emp)} />
        ))}
      </div>

      <EmployeeSlideOver employee={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
