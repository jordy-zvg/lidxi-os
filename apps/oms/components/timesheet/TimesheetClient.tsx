'use client';

import { IconChevronLeft, IconChevronRight, IconClockOff, IconDownload } from '@tabler/icons-react';
import { useState } from 'react';
import type { ShiftRow } from './types';

const TYPE_LABEL: Record<string, string> = {
  pos_activation: 'Activación POS',
  clock_in: 'Entrada/Salida',
};

const ROLE_ES: Record<string, string> = {
  manager: 'Gerente',
  cashier: 'Cajero',
  cook: 'Cocinero',
  courier: 'Repartidor',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Mexico_City',
  });
}

function hoursWorked(started: string, ended: string | null): string {
  if (!ended) return 'En curso';
  const mins = Math.floor((new Date(ended).getTime() - new Date(started).getTime()) / 60_000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

interface Props {
  shifts: ShiftRow[];
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onExport: () => void;
}

export const TimesheetClient = ({ shifts, weekLabel, onPrevWeek, onNextWeek, onExport }: Props) => {
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [exportToast, setExportToast] = useState(false);

  const handleExport = () => {
    onExport();
    setExportToast(true);
    setTimeout(() => setExportToast(false), 2500);
  };

  const employees = Array.from(new Set(shifts.map((s) => s.employee_name))).sort();
  const roles = Array.from(new Set(shifts.map((s) => s.employee_role))).sort();

  const filtered = shifts.filter((s) => {
    if (filterEmployee && s.employee_name !== filterEmployee) return false;
    if (filterRole && s.employee_role !== filterRole) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-3">
        <h1 className="text-xl font-medium text-ink">Registro de horas</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 h-8 px-3 rounded border border-line-2 text-sm text-ink-200 hover:bg-surface-2 transition-colors"
          >
            <IconDownload size={14} />
            Exportar CSV
          </button>
          {exportToast && (
            <span className="text-xs text-ok-text bg-ok-soft px-2 py-1 rounded">Exportando…</span>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-1 border border-line rounded-md overflow-hidden">
          <button
            type="button"
            onClick={onPrevWeek}
            className="h-8 w-8 flex items-center justify-center hover:bg-surface-2 transition-colors"
          >
            <IconChevronLeft size={16} className="text-ink-300" />
          </button>
          <span className="px-3 text-sm font-medium text-ink min-w-[160px] text-center">
            {weekLabel}
          </span>
          <button
            type="button"
            onClick={onNextWeek}
            className="h-8 w-8 flex items-center justify-center hover:bg-surface-2 transition-colors"
          >
            <IconChevronRight size={16} className="text-ink-300" />
          </button>
        </div>

        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="h-8 rounded border border-line-2 bg-surface px-2 text-sm text-ink focus:outline-none focus:border-brand"
        >
          <option value="">Todos los empleados</option>
          {employees.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-8 rounded border border-line-2 bg-surface px-2 text-sm text-ink focus:outline-none focus:border-brand"
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {ROLE_ES[r] ?? r}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <IconClockOff size={48} className="text-ink-500" />
          <p className="text-sm font-medium text-ink-200">No hay registros para esta semana</p>
          <p className="text-xs text-ink-400">
            Los registros aparecen cuando los empleados marcan entrada
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                {['Empleado', 'Rol', 'Día', 'Entrada', 'Salida', 'Horas', 'Tipo'].map((h) => (
                  <th
                    key={h}
                    className="text-left py-row-header-y px-row-x text-xs font-semibold uppercase tracking-wider text-ink-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((shift) => (
                <tr key={shift.id} className="hover:bg-surface-2 transition-colors">
                  <td className="py-row-y px-row-x font-medium text-ink">{shift.employee_name}</td>
                  <td className="py-row-y px-row-x text-ink-300">
                    {ROLE_ES[shift.employee_role] ?? shift.employee_role}
                  </td>
                  <td className="py-row-y px-row-x text-ink-200">{formatDate(shift.started_at)}</td>
                  <td className="py-row-y px-row-x font-mono text-ink-200">
                    {formatTime(shift.started_at)}
                  </td>
                  <td className="py-row-y px-row-x font-mono text-ink-200">
                    {shift.ended_at ? (
                      formatTime(shift.ended_at)
                    ) : (
                      <span className="text-ok-text text-xs">En curso</span>
                    )}
                  </td>
                  <td className="py-row-y px-row-x font-mono text-ink">
                    {hoursWorked(shift.started_at, shift.ended_at)}
                  </td>
                  <td className="py-row-y px-row-x text-ink-300">
                    {TYPE_LABEL[shift.type] ?? shift.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
