'use client';

import { formatTimeMX } from '@kobi/shared';
import { Button } from '@kobi/ui';
import { IconFingerprint } from '@tabler/icons-react';
import { useState } from 'react';

/**
 * Pantalla única de fichaje. En quiosco real:
 *   1. Conectamos el lector de huella (WebUSB o wrapper Electron).
 *   2. Al detectar match, llamamos a un endpoint que crea/cierra un `shifts`.
 *   3. Mostramos confirmación 3 segundos y volvemos al estado de espera.
 *
 * En dev, el botón "Simular huella" dispara el mismo flujo con un empleado
 * dummy para poder iterar UI sin hardware.
 *
 * TODO[clock-hardware]: cuando elijamos lector (Suprema BioMini, Digital
 * Persona U.are.U, etc.) implementar la integración real. WebUSB sirve si
 * lo embebemos en Chromium con un policy que autorice el vendor; si no,
 * envolvemos esta misma PWA en Electron y usamos node-hid.
 */
export default function ClockPage() {
  const [feedback, setFeedback] = useState<{ name: string; type: 'in' | 'out'; at: string } | null>(
    null,
  );

  const handleSimulate = () => {
    setFeedback({ name: 'Marco Pérez', type: 'in', at: new Date().toISOString() });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center px-8">
      {feedback ? (
        <Feedback name={feedback.name} type={feedback.type} at={feedback.at} />
      ) : (
        <Idle onSimulate={handleSimulate} />
      )}
    </main>
  );
}

const Idle = ({ onSimulate }: { onSimulate: () => void }) => (
  <>
    <div className="flex h-64 w-64 items-center justify-center rounded-full bg-surface shadow-lg">
      <IconFingerprint size={120} className="text-brand" />
    </div>
    <h1 className="mt-8 text-2xl font-semibold text-ink">Pon tu huella para fichar</h1>
    <p className="mt-1 text-sm text-ink-300">
      El lector identifica entrada o salida automáticamente.
    </p>
    {process.env.NODE_ENV !== 'production' && (
      <Button variant="secondary" className="mt-10" onClick={onSimulate}>
        Simular huella (dev)
      </Button>
    )}
  </>
);

const Feedback = ({ name, type, at }: { name: string; type: 'in' | 'out'; at: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="flex h-48 w-48 items-center justify-center rounded-full bg-ok-soft">
      <IconFingerprint size={96} className="text-ok" />
    </div>
    <h2 className="mt-6 text-3xl font-semibold text-ink">
      {type === 'in' ? 'Entrada registrada' : 'Salida registrada'}
    </h2>
    <p className="mt-2 font-mono text-ink-200">{name}</p>
    <p className="mt-1 font-mono text-sm text-ink-400">{formatTimeMX(at)}</p>
  </div>
);
