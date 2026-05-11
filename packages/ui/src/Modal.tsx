'use client';

import { cn } from '@lidxi/shared';
import { type ReactNode, useEffect } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Ancho máximo del cuerpo. Por defecto 460px (suficiente para keypad compacto). */
  maxWidth?: string;
  /** Si false, la tecla ESC no cierra el modal. Útil para flujos críticos. */
  closeOnEscape?: boolean;
  className?: string;
}

/**
 * Modal base con backdrop. Sin focus-trap (TODO: agregar si la UX lo amerita).
 * El consumidor controla open/close — es un componente puramente presentacional.
 */
export const Modal = ({
  open,
  onClose,
  children,
  maxWidth = '460px',
  closeOnEscape = true,
  className,
}: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    // Bloquea scroll del body mientras el modal está abierto.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prev;
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClose();
      }}
      role="presentation"
    >
      {/* biome-ignore lint/a11y/useSemanticElements: usamos <div role="dialog"> en lugar de <dialog> nativo porque la animación, click-outside y portales no encajan con el ciclo showModal()/close() del elemento nativo. */}
      <div
        role="dialog"
        aria-modal="true"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className={cn('w-full rounded-xl bg-surface shadow-lg border border-line', className)}
      >
        {children}
      </div>
    </div>
  );
};
