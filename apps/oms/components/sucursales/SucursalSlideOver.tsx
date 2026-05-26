'use client';

import { createBranchAction, updateBranchAction } from '@/app/admin/sucursales/actions';
import { Button } from '@kobi/ui';
import { IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { BranchRecord } from './SucursalesScreen';

interface SucursalSlideOverProps {
  branch: BranchRecord | null;
  creating: boolean;
  onClose: () => void;
}

export const SucursalSlideOver = ({ branch, creating, onClose }: SucursalSlideOverProps) => {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOpen = creating || branch !== null;

  useEffect(() => {
    if (!isOpen) return;
    setName(branch?.name ?? '');
    setAddress(branch?.address ?? '');
    setPhone(branch?.phone ?? '');
    setError(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  }, [isOpen, branch]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = branch
        ? await updateBranchAction(branch.id, { name, address, phone })
        : await createBranchAction({ name, address, phone });
      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/70"
        onClick={onClose}
        role="presentation"
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog
        open
        aria-label={branch ? `Editar sucursal ${branch.name}` : 'Nueva sucursal'}
        className="fixed right-0 top-0 bottom-0 z-50 w-[480px] m-0 p-0 bg-surface border-l border-line shadow-lg flex flex-col overflow-hidden"
      >
        <header className="shrink-0 border-b border-line px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
          <span className="font-medium text-sm text-ink">
            {branch ? branch.name : 'Nueva sucursal'}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <label className="block text-xs text-ink-400 mb-1" htmlFor="suc-name">
              Nombre *
            </label>
            <input
              ref={nameRef}
              id="suc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Ej. Sucursal Roma"
              className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1" htmlFor="suc-address">
              Dirección
            </label>
            <input
              id="suc-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={200}
              placeholder="Ej. Av. Insurgentes Sur 100"
              className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1" htmlFor="suc-phone">
              Teléfono
            </label>
            <input
              id="suc-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={32}
              placeholder="Ej. 55 1234 5678"
              className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <footer className="shrink-0 border-t border-line px-5 py-4 flex flex-col gap-3">
          {error && (
            <div
              role="alert"
              className="bg-danger-soft border border-danger text-danger-text text-sm px-3 py-2 rounded-md"
            >
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Guardando…' : branch ? 'Guardar cambios' : 'Crear sucursal'}
            </Button>
          </div>
        </footer>
      </dialog>
    </>
  );
};
