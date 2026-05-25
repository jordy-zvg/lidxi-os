'use client';

import { generatePairingCode } from '@/app/admin/dispositivos/actions';
import { Button, Modal } from '@kobi/ui';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useEffect, useRef, useState, useTransition } from 'react';

interface PairingCodeModalProps {
  open: boolean;
  onClose: () => void;
}

interface GeneratedCode {
  code: string;
  expiresAt: string;
}

export const PairingCodeModal = ({ open, onClose }: PairingCodeModalProps) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [deviceName, setDeviceName] = useState('');
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [remainingS, setRemainingS] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setDeviceName('');
      setGenerated(null);
      setError(null);
      setCopied(false);
      setRemainingS(null);
    } else {
      // Focus el input al abrir, sin autoFocus (a11y).
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!generated) return;
    const tick = () => {
      const diffMs = new Date(generated.expiresAt).getTime() - Date.now();
      setRemainingS(Math.max(0, Math.floor(diffMs / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [generated]);

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generatePairingCode(deviceName);
      if (result.ok) {
        setGenerated({ code: result.code, expiresAt: result.expiresAt });
      } else {
        setError(result.error);
      }
    });
  };

  const handleCopy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard puede estar bloqueado en algunos contextos; ignorar silenciosamente.
    }
  };

  const formatRemaining = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const expired = remainingS === 0;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-medium text-ink mb-1">Vincular nuevo dispositivo</h2>
        <p className="text-sm text-ink-400 mb-5">
          Genera un código y úsalo en la tablet para emparejarla a este restaurante.
        </p>

        {!generated ? (
          <>
            <label className="block text-xs text-ink-400 mb-1" htmlFor="device-name">
              Nombre del dispositivo
            </label>
            <input
              ref={nameInputRef}
              id="device-name"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Ej. Tablet mostrador 1"
              maxLength={80}
              className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
            />
            <p className="text-xs text-ink-400 mt-1.5">
              Lo verás en la lista de dispositivos para identificar esta tablet.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-4 bg-danger-soft border border-danger text-danger-text text-sm px-3 py-2 rounded-md"
              >
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={isPending}>
                {isPending ? 'Generando…' : 'Generar código'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-canvas border border-line-2 rounded-lg p-6 text-center">
              <p className="text-xs text-ink-400 uppercase tracking-wider mb-2">Código</p>
              <p className="font-mono text-4xl font-semibold text-ink tracking-[0.3em]">
                {generated.code}
              </p>
              <p className={`text-xs mt-3 ${expired ? 'text-danger-text' : 'text-ink-400'}`}>
                {remainingS === null
                  ? 'Calculando…'
                  : expired
                    ? 'Código expirado — genera uno nuevo'
                    : `Expira en ${formatRemaining(remainingS)}`}
              </p>
            </div>

            <div className="mt-4 text-sm text-ink-200 space-y-1.5">
              <p>
                <span className="font-medium text-ink">1.</span> Abre Kobi en la tablet.
              </p>
              <p>
                <span className="font-medium text-ink">2.</span> Toca "Vincular dispositivo".
              </p>
              <p>
                <span className="font-medium text-ink">3.</span> Escribe el código de arriba.
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={handleCopy} disabled={expired}>
                {copied ? (
                  <>
                    <IconCheck size={14} className="mr-1" /> Copiado
                  </>
                ) : (
                  <>
                    <IconCopy size={14} className="mr-1" /> Copiar
                  </>
                )}
              </Button>
              <Button onClick={onClose}>Listo</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
