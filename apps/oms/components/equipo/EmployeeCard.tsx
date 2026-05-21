'use client';

import { enrollFingerprint } from '@/app/admin/equipo/actions';
import { ROLE_LABEL } from '@kobi/shared';
import type { Role } from '@kobi/shared';
import { Button } from '@kobi/ui';
import { IconFingerprint } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
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

export const EmployeeCard = ({ employee, onEdit }: EmployeeCardProps) => {
  const [enrolling, setEnrolling] = useState<'idle' | 'scanning'>('idle');
  const [pending, startTransition] = useTransition();

  const handleEnroll = () => {
    setEnrolling('scanning');
    setTimeout(() => {
      startTransition(async () => {
        await enrollFingerprint(employee.id);
        setEnrolling('idle');
      });
    }, 1200);
  };

  return (
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

      <div className="flex items-center justify-center gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${employee.status === 'activo' ? 'bg-ok' : 'bg-ink-500'}`}
          />
          <span className={employee.status === 'activo' ? 'text-ink-200' : 'text-ink-400'}>
            {employee.status === 'activo' ? 'Activo' : 'Pausado'}
          </span>
        </span>
        <span
          className="flex items-center gap-1"
          title={employee.fingerprint_enrolled ? 'Huella registrada' : 'Huella pendiente'}
        >
          <IconFingerprint
            size={14}
            className={
              enrolling === 'scanning'
                ? 'text-brand animate-pulse'
                : employee.fingerprint_enrolled
                  ? 'text-ok'
                  : 'text-ink-400'
            }
          />
          <span
            className={
              employee.fingerprint_enrolled
                ? 'text-ink-200'
                : enrolling === 'scanning'
                  ? 'text-brand'
                  : 'text-ink-400'
            }
          >
            {employee.fingerprint_enrolled
              ? 'Huella'
              : enrolling === 'scanning'
                ? 'Escaneando…'
                : 'Sin huella'}
          </span>
        </span>
      </div>

      {!employee.fingerprint_enrolled && enrolling === 'idle' && (
        <Button variant="secondary" size="sm" onClick={handleEnroll} disabled={pending}>
          Registrar huella
        </Button>
      )}

      <Button variant="secondary" size="sm" onClick={onEdit} className="w-full">
        Editar
      </Button>
    </div>
  );
};
