import { ROLE_LABEL } from '@kobi/shared';
import type { Role } from '@kobi/shared';
import { Button } from '@kobi/ui';
import type { EmployeeRecord } from './EquipoScreen';

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

const ROLE_KEYS = Object.keys(ROLE_LABEL) as Role[];

function roleLabel(role: string): string {
  if (ROLE_KEYS.includes(role as Role)) return ROLE_LABEL[role as Role];
  return role;
}

interface EmployeeCardProps {
  employee: EmployeeRecord;
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
        <p className="text-xs text-ink-400">{roleLabel(employee.role)}</p>
      </div>
    </div>

    <div className="flex items-center justify-center gap-1.5 text-xs">
      <span
        className={`h-2 w-2 rounded-full shrink-0 ${employee.status === 'activo' ? 'bg-ok' : 'bg-ink-500'}`}
      />
      <span className={employee.status === 'activo' ? 'text-ink-200' : 'text-ink-400'}>
        {employee.status === 'activo' ? 'Activo' : 'Pausado'}
      </span>
    </div>

    <Button variant="secondary" size="sm" onClick={onEdit} className="w-full">
      Editar
    </Button>
  </div>
);
