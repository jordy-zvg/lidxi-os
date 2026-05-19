import { ROLE_LABEL } from '@kobi/shared';
import { Button } from '@kobi/ui';
import type { MockEmployee } from './mock-employees';

function avatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  const h1 = hash;
  const h2 = (hash + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1} 70% 60%), hsl(${h2} 70% 50%))`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface EmployeeCardProps {
  employee: MockEmployee;
  onEdit: () => void;
}

export const EmployeeCard = ({ employee, onEdit }: EmployeeCardProps) => (
  <div className="bg-surface border border-line rounded-lg p-4 flex flex-col gap-3">
    <div className="flex flex-col items-center text-center gap-2">
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-semibold"
        style={{ background: avatarGradient(employee.id) }}
      >
        {initials(employee.name)}
      </div>
      <div>
        <p className="text-sm font-medium text-ink">{employee.name}</p>
        <p className="text-xs text-ink-400">{ROLE_LABEL[employee.role]}</p>
      </div>
    </div>

    <div className="flex items-center justify-center gap-1.5 text-xs">
      <span
        className={`h-2 w-2 rounded-full shrink-0 ${employee.onShift ? 'bg-ok animate-pulse' : 'bg-ink-500'}`}
      />
      {employee.onShift ? (
        <span className="text-ink-200">
          En turno · desde <span className="font-mono">{employee.shiftStart}</span>
        </span>
      ) : (
        <span className="text-ink-400">Fuera de turno</span>
      )}
    </div>

    <div className="border-t border-line pt-3 space-y-1">
      {employee.orders > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-ink-400">Pedidos hoy</span>
          <span className="font-mono text-ink">{employee.orders}</span>
        </div>
      )}
      <div className="flex justify-between text-xs">
        <span className="text-ink-400">Horas hoy</span>
        <span className="font-mono text-ink">{employee.hoursToday}</span>
      </div>
    </div>

    <Button variant="secondary" size="sm" onClick={onEdit} className="w-full">
      Editar
    </Button>
  </div>
);
