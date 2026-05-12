'use client';

import { IconChevronDown, IconClockStop, IconLogout, IconUserCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { closeShiftAndSignOut, signOut } from '../lib/auth-actions';

interface SessionMenuProps {
  employeeName?: string;
  employeeId?: string;
}

export const SessionMenu = ({
  employeeName = 'Demo · Miztli Pardo',
  employeeId = 'demo',
}: SessionMenuProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    startTransition(async () => {
      await signOut();
      router.push('/login');
    });
  };

  const handleCloseShift = () => {
    setOpen(false);
    startTransition(async () => {
      await closeShiftAndSignOut();
      router.push('/login');
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-ink-200 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50"
      >
        <span className="h-6 w-6 rounded-full bg-brand-soft flex items-center justify-center text-[10px] font-semibold text-brand-text shrink-0">
          {employeeName.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[120px] truncate">{employeeName}</span>
        <IconChevronDown size={14} className="text-ink-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-line bg-surface shadow-lg z-50">
          <a
            href={`/personal/${employeeId}`}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-200 hover:bg-surface-2 rounded-t-lg transition-colors"
            onClick={() => setOpen(false)}
          >
            <IconUserCircle size={16} className="text-ink-400 shrink-0" />
            Mi perfil
          </a>

          <div className="border-t border-line" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-start gap-2.5 px-3 py-2.5 text-sm text-ink-200 hover:bg-surface-2 transition-colors"
          >
            <IconLogout size={16} className="text-ink-400 shrink-0 mt-0.5" />
            <span className="flex flex-col items-start">
              <span>Cerrar sesión</span>
              <span className="text-xs text-ink-400">el turno sigue abierto</span>
            </span>
          </button>

          <div className="border-t border-line" />

          <button
            type="button"
            onClick={handleCloseShift}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-danger-text hover:bg-surface-2 rounded-b-lg transition-colors"
          >
            <IconClockStop size={16} className="shrink-0" />
            Cerrar turno
          </button>
        </div>
      )}
    </div>
  );
};
